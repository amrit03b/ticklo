"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, DollarSign, Tag } from "lucide-react"
import Image from "next/image"

interface ResaleModalProps {
  ticket: {
    name: string
    description: string
    image_url: string
    collection: string
    token_id: string
  }
  eventDetails?: {
    name: string
    description: string
    image_url: string
    price: string
    date: string
    time: string
    venue: string
    category: string
  }
  onListForResale: (resalePrice: number) => Promise<void>
  isListing: boolean
}

export function ResaleModal({ ticket, eventDetails, onListForResale, isListing }: ResaleModalProps) {
  const [resalePrice, setResalePrice] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Use eventDetails price if available, otherwise use a default price
  const originalPrice = eventDetails?.price ? parseFloat(eventDetails.price.replace(" APT", "")) : 0.5
  const maxPrice = originalPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(resalePrice)
    
    if (price > maxPrice) {
      alert(`Resale price cannot exceed original price of ${maxPrice} APT`)
      return
    }
    
    if (price <= 0) {
      alert("Resale price must be greater than 0")
      return
    }

    try {
      await onListForResale(price)
      setIsOpen(false)
      setResalePrice("")
    } catch (error) {
      console.error("Failed to list for resale:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
        >
          <Tag className="w-4 h-4 mr-2" />
          List for Resale
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">List Ticket for Resale</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Preview */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={ticket.image_url || "/ticklo-logo.png"}
                  alt={ticket.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{ticket.name}</h3>
                <p className="text-white/70 text-sm line-clamp-2">{ticket.description}</p>
                {eventDetails && (
                  <div className="flex items-center text-white/60 text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(eventDetails.date).toLocaleDateString()} at {eventDetails.time}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Original Price:</span>
              <Badge className="bg-green-600 text-white">
                {eventDetails?.price || `${originalPrice} APT`}
              </Badge>
            </div>
            <div className="text-xs text-white/60">
              You can sell for the same price or less
            </div>
          </div>

          {/* Resale Price Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resalePrice" className="text-white text-lg font-medium">
                Resale Price (APT)
              </Label>
              <Input
                id="resalePrice"
                type="number"
                step="0.01"
                min="0"
                max={maxPrice}
                value={resalePrice}
                onChange={(e) => setResalePrice(e.target.value)}
                placeholder={`0.00 (max: ${maxPrice} APT)`}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg"
                required
              />
              <div className="text-xs text-white/60">
                Maximum resale price: {maxPrice} APT
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isListing || !resalePrice || parseFloat(resalePrice) <= 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold"
              >
                {isListing ? "Listing..." : "List for Resale"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 