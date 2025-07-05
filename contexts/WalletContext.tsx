"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { 
  WalletState, 
  WalletInfo, 
  WalletError, 
  ConnectionStatus,
  WalletType,
  getAvailableWallets,
  generateMockWallet,
  connectPetraWallet,
  WALLET_ERRORS,
  formatAddress,
  formatBalance,
  fetchAptosBalance
} from '@/lib/wallet'
import { 
  connectPetraWalletAdapter, 
  disconnectPetraWalletAdapter
} from '@/lib/petra-wallet'

// Action types
type WalletAction =
  | { type: 'SET_CONNECTING' }
  | { type: 'SET_CONNECTED'; payload: WalletInfo }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_ERROR'; payload: WalletError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_BALANCE'; payload: string }

// Initial state
const initialState: WalletState = {
  status: 'disconnected',
  walletInfo: null,
  error: null,
  isConnecting: false
}

// Reducer function
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return {
        ...state,
        status: 'connecting',
        isConnecting: true,
        error: null
      }
    case 'SET_CONNECTED':
      return {
        ...state,
        status: 'connected',
        walletInfo: action.payload,
        isConnecting: false,
        error: null
      }
    case 'SET_DISCONNECTED':
      return {
        ...state,
        status: 'disconnected',
        walletInfo: null,
        isConnecting: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        isConnecting: false,
        error: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'UPDATE_BALANCE':
      return {
        ...state,
        walletInfo: state.walletInfo ? {
          ...state.walletInfo,
          balance: action.payload
        } : null
      }
    default:
      return state
  }
}

// Context interface
interface WalletContextType extends WalletState {
  connect: (walletType?: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
  clearError: () => void
  availableWallets: WalletType[]
  formattedAddress: string
  formattedBalance: string
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)
  const [availableWallets, setAvailableWallets] = React.useState<WalletType[]>([])
  const { walletInfo, status } = state;

  // Initialize available wallets on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAvailableWallets(getAvailableWallets())
    }
  }, [])

  // Connect to wallet
  const connect = useCallback(async () => {
    dispatch({ type: 'SET_CONNECTING' });
    try {
      const walletInfo = await connectPetraWallet();
      if (!walletInfo.address) throw new Error('No address returned from Petra wallet');
      
      // Verify the connection is stable
      if (typeof window.petra?.isConnected === 'function') {
        const isConnected = await window.petra.isConnected();
        if (!isConnected) throw new Error('Petra wallet connection verification failed');
        
        const account = await window.petra.account();
        if (!account || account.address !== walletInfo.address) {
          throw new Error('Wallet address mismatch');
        }
      }
      
      localStorage.setItem('ticklo-wallet-connection', JSON.stringify(walletInfo));
      dispatch({ type: 'SET_CONNECTED', payload: walletInfo });
    } catch (error) {
      console.error('Wallet connection error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: WALLET_ERRORS.CONNECTION_FAILED
      });
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const savedWallet = localStorage.getItem('ticklo-wallet-connection');
        if (savedWallet) {
          const walletData = JSON.parse(savedWallet);
          if (walletData.address && walletData.isConnected && walletData.walletName === 'Petra Wallet') {
            // Verify the connection is still valid
            if (typeof window.petra?.isConnected === 'function') {
              try {
                const isConnected = await window.petra.isConnected();
                if (isConnected) {
                  // Get current account to verify it's the same
                  const account = await window.petra.account();
                  if (account && account.address === walletData.address) {
                    dispatch({ type: 'SET_CONNECTED', payload: walletData });
                    return;
                  }
                }
              } catch (error) {
                console.log('Petra wallet connection verification failed:', error);
              }
            }
            // If verification fails, clear the saved connection
            localStorage.removeItem('ticklo-wallet-connection');
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        localStorage.removeItem('ticklo-wallet-connection');
      }
    };
    checkExistingConnection();
  }, []);

  // Petra wallet doesn't support reliable event listeners in browser extension
  // We'll rely on manual connection checks instead

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      // Disconnect from Petra wallet if connected
      if (status === 'connected' && walletInfo?.walletName === 'Petra Wallet') {
        await disconnectPetraWalletAdapter()
      }
      
      // Clear localStorage
      localStorage.removeItem('ticklo-wallet-connection')
      dispatch({ type: 'SET_DISCONNECTED' })
    } catch (error) {
      console.error('Wallet disconnection error:', error)
    }
  }, [status, walletInfo])

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!state.walletInfo || !state.walletInfo.address) return

    try {
      // Fetch real balance from Aptos blockchain
      const newBalance = await fetchAptosBalance(state.walletInfo.address)
      dispatch({ type: 'UPDATE_BALANCE', payload: newBalance })
      
      // Update localStorage
      const updatedWallet = { ...state.walletInfo, balance: newBalance }
      localStorage.setItem('ticklo-wallet-connection', JSON.stringify(updatedWallet))
    } catch (error) {
      console.error('Balance refresh error:', error)
    }
  }, [state.walletInfo])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Computed values
  const formattedAddress = state.walletInfo ? formatAddress(state.walletInfo.address) : ''
  const formattedBalance = state.walletInfo ? formatBalance(state.walletInfo.balance, 8) : '0'

  const value: WalletContextType = {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    clearError,
    availableWallets,
    formattedAddress,
    formattedBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 