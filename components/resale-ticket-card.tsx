"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, DollarSign, Tag, User, Clock } from "lucide-react"
import Image from "next/image"

interface ResaleTicketCardProps {
  listing: {
    listing_id: number
    token_id: string
    event_name: string
    event_description: string
    event_image_url: string
    original_price: number
    resale_price: number
    seller_address: string
    event_date: string
    event_time: string
    event_venue: string
    event_category: string
  }
  onBuyResale: (listingId: number) => Promise<void>
  isBuying: boolean
  currentUserAddress?: string
}

export function ResaleTicketCard({ listing, onBuyResale, isBuying, currentUserAddress }: ResaleTicketCardProps) {
  const isOwnListing = currentUserAddress === listing.seller_address
  const originalPriceApt = listing.original_price / 1e8
  const resalePriceApt = listing.resale_price / 1e8
  const savings = originalPriceApt - resalePriceApt

  return (
    <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in">
      <div className="relative h-48">
        <Image
          src={listing.event_image_url || "/ticklo-logo.png"}
          alt={listing.event_name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/ticklo-logo.png";
          }}
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold px-3 py-1">
            <Tag className="w-3 h-3 mr-1" />
            Resale
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge className="bg-indigo-600 text-white rounded-full font-semibold px-3 py-1">
            {listing.event_category}
          </Badge>
        </div>
        {savings > 0 && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-green-600 text-white rounded-full font-semibold px-3 py-1">
              Save {savings.toFixed(2)} APT
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-3">{listing.event_name}</h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{listing.event_description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-white/70 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {new Date(listing.event_date).toLocaleDateString()} at {listing.event_time}
            </span>
          </div>
          <div className="flex items-center text-white/70 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{listing.event_venue}</span>
          </div>
          <div className="flex items-center text-white/70 text-sm">
            <User className="w-4 h-4 mr-2" />
            <span className="break-all">
              Seller: {listing.seller_address.slice(0, 6)}...{listing.seller_address.slice(-4)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center text-white/60 text-sm">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>Original: {originalPriceApt.toFixed(2)} APT</span>
            </div>
            <div className="flex items-center text-white text-lg font-bold">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>Resale: {resalePriceApt.toFixed(2)} APT</span>
            </div>
          </div>
        </div>

        {isOwnListing ? (
          <div className="text-center">
            <Badge className="bg-blue-600 text-white px-4 py-2 rounded-full">
              Your Listing
            </Badge>
          </div>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-3 rounded-2xl shadow-lg"
            onClick={() => onBuyResale(listing.listing_id)}
            disabled={isBuying}
          >
            {isBuying ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Buy Resale Ticket
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 