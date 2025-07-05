"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/contexts/WalletContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface NftTicket {
  name: string
  description: string
  image_url: string
  collection: string
  token_id: string
}

async function fetchUserNfts(address: string): Promise<NftTicket[]> {
  // Use the Aptos NFT v2 API to fetch all tokens owned by the user
  // This is a simplified example using the public indexer API
  const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/tokens`;
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  // Map tokens to NftTicket structure
  return (data || []).map((token: any) => ({
    name: token.token_data?.name || "Event Ticket",
    description: token.token_data?.description || "",
    image_url: token.token_data?.uri || "/placeholder.svg",
    collection: token.token_data?.collection || "",
    token_id: token.id?.token_data_id?.name || token.id?.token_data_id || "",
  }))
}

export default function ProfilePage() {
  const { walletInfo, status } = useWallet()
  const [tickets, setTickets] = useState<NftTicket[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "connected" && walletInfo?.address) {
      setLoading(true)
      fetchUserNfts(walletInfo.address).then(nfts => {
        setTickets(nfts)
        setLoading(false)
      })
    }
  }, [status, walletInfo])

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-white mb-10">My NFT Tickets</h1>
        {status !== "connected" ? (
          <div className="text-white text-xl">Connect your wallet to view your tickets.</div>
        ) : loading ? (
          <div className="text-white text-xl">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-white text-xl">No NFT tickets found in your wallet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket, idx) => (
              <Card key={ticket.token_id + idx} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in">
                <div className="relative h-48">
                  <Image
                    src={ticket.image_url || "/placeholder.svg"}
                    alt={ticket.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold px-3 py-1">
                      NFT Ticket
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{ticket.name}</h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center text-white/70 text-sm mb-2">
                    <span className="w-4 h-4 mr-2 text-white">🎟️</span>
                    <span>{ticket.collection}</span>
                  </div>
                  <div className="flex items-center text-white/70 text-xs">
                    <span className="w-4 h-4 mr-2 text-white">🆔</span>
                    <span className="break-all">{ticket.token_id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 