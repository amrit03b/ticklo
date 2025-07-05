"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { formatAddress, formatBalance } from "@/lib/wallet"

interface WalletStatusProps {
  showDetails?: boolean
  className?: string
}

export function WalletStatus({ showDetails = false, className = "" }: WalletStatusProps) {
  const { 
    status, 
    walletInfo, 
    error, 
    isConnecting, 
    formattedAddress, 
    formattedBalance,
    refreshBalance 
  } = useWallet()

  if (status === 'connecting' || isConnecting) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        <span className="text-white/70 text-sm">Connecting...</span>
      </div>
    )
  }

  if (status === 'error' && error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm">{error.message}</span>
      </div>
    )
  }

  if (status === 'connected' && walletInfo) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-white text-sm font-medium">{formattedAddress}</span>
        </div>
        
        {showDetails && (
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">
              {formattedBalance} APT
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              className="text-white/70 hover:text-white p-1 h-6 w-6"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wallet className="w-4 h-4 text-white/50" />
      <span className="text-white/50 text-sm">Not connected</span>
    </div>
  )
}

// Compact version for small spaces
export function WalletStatusCompact({ className = "" }: { className?: string }) {
  const { status, walletInfo, formattedAddress } = useWallet()

  if (status === 'connected' && walletInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
        <span className="text-white text-xs font-medium">{formattedAddress}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-white/30 rounded-full"></div>
      <span className="text-white/50 text-xs">Disconnected</span>
    </div>
  )
} 