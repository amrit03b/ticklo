"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, X, Wallet } from "lucide-react"

interface Event {
  id: number
  name: string
  description: string
  image_url: string
  price: string
  date: string
  time: string
  venue: string
  capacity: number
  tickets_sold: number
  status: string
  category: string
  organizer: string
}

interface GroupBookingModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (numTickets: number, walletAddresses: string[]) => void
  isProcessing: boolean
}

export function GroupBookingModal({
  event,
  isOpen,
  onClose,
  onConfirm,
  isProcessing
}: GroupBookingModalProps) {
  const [numTickets, setNumTickets] = useState(2)
  const [walletAddresses, setWalletAddresses] = useState<string[]>(["", ""])
  const [errors, setErrors] = useState<string[]>([])

  const handleNumTicketsChange = (value: number) => {
    if (value < 2) value = 2
    if (value > 10) value = 10 // Limit to 10 tickets for group booking
    
    setNumTickets(value)
    
    // Adjust wallet addresses array
    const newAddresses = [...walletAddresses]
    if (value > walletAddresses.length) {
      // Add empty addresses
      for (let i = walletAddresses.length; i < value; i++) {
        newAddresses.push("")
      }
    } else if (value < walletAddresses.length) {
      // Remove extra addresses
      newAddresses.splice(value)
    }
    setWalletAddresses(newAddresses)
  }

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...walletAddresses]
    newAddresses[index] = value
    setWalletAddresses(newAddresses)
  }

  const addAddress = () => {
    if (numTickets < 10) {
      setWalletAddresses([...walletAddresses, ""])
      setNumTickets(numTickets + 1)
    }
  }

  const removeAddress = (index: number) => {
    if (numTickets > 2) {
      const newAddresses = walletAddresses.filter((_, i) => i !== index)
      setWalletAddresses(newAddresses)
      setNumTickets(numTickets - 1)
    }
  }

  const validateAddresses = (): boolean => {
    const newErrors: string[] = []
    
    // Check for empty addresses
    walletAddresses.forEach((address, index) => {
      if (!address.trim()) {
        newErrors.push(`Wallet address ${index + 1} is required`)
      }
    })
    
    // Check for duplicate addresses
    const uniqueAddresses = new Set(walletAddresses.map(addr => addr.trim().toLowerCase()))
    if (uniqueAddresses.size !== walletAddresses.length) {
      newErrors.push("Duplicate wallet addresses are not allowed")
    }
    
    // Check for valid Aptos address format (basic validation)
    walletAddresses.forEach((address, index) => {
      if (address.trim() && !/^0x[a-fA-F0-9]{64}$/.test(address.trim())) {
        newErrors.push(`Wallet address ${index + 1} is not a valid Aptos address`)
      }
    })
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleConfirm = () => {
    if (validateAddresses()) {
      onConfirm(numTickets, walletAddresses.map(addr => addr.trim()))
    }
  }

  const totalPrice = event ? parseFloat(event.price.replace(" APT", "")) * numTickets : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Group Booking
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Book multiple tickets for your group. Each person will receive their own NFT ticket.
          </DialogDescription>
        </DialogHeader>

        {event && (
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
              <div className="text-white/70 text-sm space-y-1">
                <div>Date: {new Date(event.date).toLocaleDateString()}</div>
                <div>Time: {event.time}</div>
                <div>Venue: {event.venue}</div>
                <div>Price per ticket: {event.price}</div>
              </div>
            </div>

            {/* Number of Tickets */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Number of Tickets</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNumTicketsChange(numTickets - 1)}
                  disabled={numTickets <= 2}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  -
                </Button>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2">
                  {numTickets} tickets
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNumTicketsChange(numTickets + 1)}
                  disabled={numTickets >= 10}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  +
                </Button>
              </div>
              <p className="text-white/60 text-xs">Minimum 2, maximum 10 tickets for group booking</p>
            </div>

            {/* Wallet Addresses */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Wallet Addresses</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {walletAddresses.map((address, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder={`Wallet address ${index + 1}`}
                        value={address}
                        onChange={(e) => handleAddressChange(index, e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                    {numTickets > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAddress(index)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {numTickets < 10 && (
                <Button
                  variant="outline"
                  onClick={addAddress}
                  className="border-white/20 text-white hover:bg-white/10 w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Address
                </Button>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.map((error, index) => (
                  <div key={index} className="text-red-400 text-sm">{error}</div>
                ))}
              </div>
            )}

            {/* Total Price */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-indigo-500/30">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total Price:</span>
                <span className="text-2xl font-bold text-white">{totalPrice.toFixed(2)} APT</span>
              </div>
              <p className="text-white/60 text-sm mt-1">
                {numTickets} × {event.price} = {totalPrice.toFixed(2)} APT
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Confirm Group Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 