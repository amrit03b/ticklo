import { useState, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { aptToWei, weiToApt } from '@/lib/wallet'

export interface TransactionState {
  isProcessing: boolean
  isSuccess: boolean
  isError: boolean
  error: string | null
  txHash: string | null
}

export interface TransactionResult {
  success: boolean
  txHash?: string
  error?: string
}

export function useWalletTransaction() {
  const { status, walletInfo } = useWallet()
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isProcessing: false,
    isSuccess: false,
    isError: false,
    error: null,
    txHash: null
  })

  const resetTransaction = useCallback(() => {
    setTransactionState({
      isProcessing: false,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null
    })
  }, [])

  const buyTicket = useCallback(async (
    eventId: string,
    price: string, // Price in APT
    quantity: number = 1
  ): Promise<TransactionResult> => {
    if (status !== 'connected' || !walletInfo) {
      return {
        success: false,
        error: 'Wallet not connected'
      }
    }

    setTransactionState(prev => ({
      ...prev,
      isProcessing: true,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null
    }))

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // Calculate total cost
      const totalCost = parseFloat(price) * quantity
      const totalCostWei = aptToWei(totalCost.toString())
      
      // In a real implementation, you would:
      // 1. Call the smart contract to buy the ticket
      // 2. Wait for transaction confirmation
      // 3. Update the user's ticket collection
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isSuccess: true,
        txHash: mockTxHash
      }))

      return {
        success: true,
        txHash: mockTxHash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isError: true,
        error: errorMessage
      }))

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [status, walletInfo])

  const transferTokens = useCallback(async (
    toAddress: string,
    amount: string // Amount in APT
  ): Promise<TransactionResult> => {
    if (status !== 'connected' || !walletInfo) {
      return {
        success: false,
        error: 'Wallet not connected'
      }
    }

    setTransactionState(prev => ({
      ...prev,
      isProcessing: true,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null
    }))

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // In a real implementation, you would:
      // 1. Call the wallet's transfer function
      // 2. Wait for transaction confirmation
      // 3. Update the user's balance
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isSuccess: true,
        txHash: mockTxHash
      }))

      return {
        success: true,
        txHash: mockTxHash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed'
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isError: true,
        error: errorMessage
      }))

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [status, walletInfo])

  const createEvent = useCallback(async (
    eventData: {
      name: string
      description: string
      price: string
      date: string
      venue: string
      capacity: number
    }
  ): Promise<TransactionResult> => {
    if (status !== 'connected' || !walletInfo) {
      return {
        success: false,
        error: 'Wallet not connected'
      }
    }

    setTransactionState(prev => ({
      ...prev,
      isProcessing: true,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null
    }))

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // In a real implementation, you would:
      // 1. Call the smart contract to create the event
      // 2. Upload event metadata to IPFS
      // 3. Wait for transaction confirmation
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isSuccess: true,
        txHash: mockTxHash
      }))

      return {
        success: true,
        txHash: mockTxHash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Event creation failed'
      
      setTransactionState(prev => ({
        ...prev,
        isProcessing: false,
        isError: true,
        error: errorMessage
      }))

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [status, walletInfo])

  return {
    transactionState,
    resetTransaction,
    buyTicket,
    transferTokens,
    createEvent
  }
} 