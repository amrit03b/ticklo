import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { WalletInfo } from './wallet'
import { fetchAptosBalance } from './wallet'

// Initialize Petra wallet adapter
let petraWallet: PetraWallet | null = null

export const initializePetraWallet = (): PetraWallet | null => {
  if (typeof window === 'undefined') return null
  
  try {
    if (!petraWallet) {
      petraWallet = new PetraWallet()
    }
    return petraWallet
  } catch (error) {
    console.error('Failed to initialize Petra wallet:', error)
    return null
  }
}

export const getPetraWallet = (): PetraWallet | null => {
  if (!petraWallet) {
    return initializePetraWallet()
  }
  return petraWallet
}

export const connectPetraWalletAdapter = async (): Promise<WalletInfo> => {
  const wallet = getPetraWallet()
  
  if (!wallet) {
    throw new Error('Petra wallet is not available')
  }

  try {
    // Connect to wallet
    await wallet.connect()
    
    // Get account information
    const account = wallet.account
    if (!account) {
      throw new Error('Failed to get account information')
    }

    // Get balance (you might need to implement this based on Petra's API)
    const balance = await fetchAptosBalance(account.address)
    
    // Get network information
    const network = 'Aptos Testnet'
    
    return {
      address: account.address,
      balance: balance,
      network: network,
      isConnected: true,
      walletName: 'Petra Wallet'
    }
  } catch (error) {
    console.error('Petra wallet connection error:', error)
    throw new Error('Failed to connect to Petra wallet')
  }
}

export const disconnectPetraWalletAdapter = async (): Promise<void> => {
  const wallet = getPetraWallet()
  
  if (wallet) {
    try {
      await wallet.disconnect()
    } catch (error) {
      console.error('Petra wallet disconnection error:', error)
    }
  }
}

export const signAndSubmitTransaction = async (transaction: any): Promise<any> => {
  const wallet = getPetraWallet()
  
  if (!wallet) {
    throw new Error('Petra wallet is not connected')
  }

  try {
    return await wallet.signAndSubmitTransaction(transaction)
  } catch (error) {
    console.error('Transaction signing error:', error)
    throw new Error('Failed to sign and submit transaction')
  }
}

export const signTransaction = async (transaction: any): Promise<any> => {
  const wallet = getPetraWallet()
  
  if (!wallet) {
    throw new Error('Petra wallet is not connected')
  }

  try {
    return await wallet.signTransaction(transaction)
  } catch (error) {
    console.error('Transaction signing error:', error)
    throw new Error('Failed to sign transaction')
  }
}

export const isPetraWalletConnected = async (): Promise<boolean> => {
  const wallet = getPetraWallet()
  
  if (!wallet) {
    return false
  }

  try {
    return wallet.connected
  } catch (error) {
    console.error('Error checking Petra wallet connection:', error)
    return false
  }
}

// Petra wallet event listeners
export const setupPetraWalletListeners = (onConnect?: () => void, onDisconnect?: () => void) => {
  // Petra wallet does not support event listeners in the browser extension API.
  // You may implement polling or manual checks if needed.
}

// Clean up Petra wallet listeners
export const cleanupPetraWalletListeners = () => {
  // No-op: Petra wallet does not support event listeners.
} 