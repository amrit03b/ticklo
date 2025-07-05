"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  X, 
  ExternalLink, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { WalletType, formatAddress, formatBalance } from "@/lib/wallet"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

const walletOptions = [
  {
    id: 'petra' as WalletType,
    name: 'Petra Wallet',
    description: 'Official Aptos blockchain wallet',
    icon: '🟣',
    url: 'https://petra.app/',
    available: true,
    priority: 1
  }
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { 
    connect, 
    disconnect, 
    status, 
    walletInfo, 
    error, 
    isConnecting, 
    availableWallets,
    clearError,
    refreshBalance
  } = useWallet()
  
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)

  const handleConnect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    clearError()
    await connect(walletType)
  }

  const handleDisconnect = async () => {
    await disconnect()
    onClose()
  }

  const handleRefreshBalance = async () => {
    await refreshBalance()
  }

  const isWalletConnected = status === 'connected' && walletInfo

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Wallet className="w-6 h-6 mr-3" />
            {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error.message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isWalletConnected ? (
          <div className="space-y-4">
            {/* Wallet Info */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{walletInfo.walletName}</h3>
                      <p className="text-white/70 text-sm">{walletInfo.network}</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    Connected
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Address:</span>
                    <span className="text-white font-mono text-sm">
                      {formatAddress(walletInfo.address)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Options */}
            <div className="grid gap-3">
              {walletOptions.map((wallet) => (
                <Card
                  key={wallet.id}
                  className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer ${
                    selectedWallet === wallet.id && isConnecting ? 'ring-2 ring-indigo-500' : ''
                  } ${wallet.id === 'petra' ? 'ring-1 ring-purple-500/50 bg-purple-500/5' : ''}`}
                  onClick={() => handleConnect(wallet.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">{wallet.name}</h3>
                            {wallet.id === 'petra' && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/70 text-sm">{wallet.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isConnecting && selectedWallet === wallet.id ? (
                          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        ) : (
                          <ExternalLink className="w-5 h-5 text-white/50" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Install Wallet Info */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-semibold text-sm">Don't have a wallet?</h4>
                    <p className="text-blue-300/80 text-xs mt-1">
                      Install a Web3 wallet to connect to Ticklo and manage your event tickets.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isConnecting && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                <p className="text-white/70 text-sm">Connecting to wallet...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 