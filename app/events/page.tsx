"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  Wallet,
  Tag,
  RefreshCw,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useWallet } from "@/contexts/WalletContext"
import { ResaleTicketCard } from "@/components/resale-ticket-card"
import { GroupBookingModal } from "@/components/group-booking-modal"

const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
const MODULE_NAME = "new_event_manager"
const MODULE = `${MODULE_ADDR}::${MODULE_NAME}`

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

async function fetchAllEvents(): Promise<Event[]> {
  const organizers = [MODULE_ADDR]
  let allEvents: Event[] = []
  for (const addr of organizers) {
    const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${addr}/resource/${MODULE}::OrganizerEvents`
    const res = await fetch(url)
    if (!res.ok) continue
    const data = await res.json()
    const events = (data.data.events || []).map((e: any) => ({
      id: Number(e.id),
      name: e.name,
      description: e.description,
      image_url: e.image_url,
      price: `${(Number(e.price) / 1e8).toFixed(2)} APT`,
      date: e.date,
      time: e.time,
      venue: e.venue,
      capacity: Number(e.capacity),
      tickets_sold: Number(e.tickets_sold),
      status: e.status,
      category: e.category,
      organizer: addr,
    }))
    allEvents = allEvents.concat(events)
  }
  return allEvents
}

// Helper to check if the collection exists for the user
async function doesCollectionExist(address: string): Promise<boolean> {
  // Use the Aptos Indexer API (testnet endpoint)
  const url = `https://indexer-testnet.staging.gcp.aptosdev.com/v1/accounts/${address}/collections`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return (data?.collections || data)?.some?.((col: any) => col.collection_name === "Ticklo Tickets");
  } catch {
    return false;
  }
}

function getUserCollectionName(address: string) {
  return `Ticklo Tickets`;
}

async function doesCollectionExistAptos(address: string, collectionName: string): Promise<boolean> {
  const url = `https://indexer-testnet.staging.gcp.aptosdev.com/v1/accounts/${address}/collections`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    const exists = (data?.collections || data)?.some?.((col: any) => col.collection_name === collectionName);
    console.log('Collection existence check:', { address, collectionName, exists, collections: data?.collections });
    return exists;
  } catch (e) {
    console.error('Collection existence check failed:', e);
    return false;
  }
}

async function createCollectionIfNotExists(walletInfo: any, collectionName: string) {
  const exists = await doesCollectionExistAptos(walletInfo.address, collectionName);
  if (exists) return;
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
    throw new Error("Petra wallet not available or not connected");
  }
  const payload = {
    type: "entry_function_payload",
    function: "0x3::token::create_collection_script",
    type_arguments: [],
    arguments: [
      collectionName, // name
      "Tickets for Ticklo events", // description
      "https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png", // uri
      "10000", // maximum (as string)
      [true, true, true], // mutability_config (vector<bool>)
    ],
  };
  const tx = await window.petra.signAndSubmitTransaction(payload);
  await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`);
}

// async function mintTicketNFT(event: Event, walletInfo: any, collectionName: string) {
//   if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
//     throw new Error("Petra wallet not available or not connected");
//   }
//   const payload = {
//     type: "entry_function_payload",
//     function: "0x3::token::create_token_script",
//     type_arguments: [],
//     arguments: [
//       collectionName, // collection name
//       `${event.name} Ticket`, // token name
//       event.description || "Event Ticket", // description
//       "1", // supply (string)
//       event.image_url || "https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png", // uri
//       walletInfo.address, // royalty_payee_address
//       "0", // royalty_points_denominator
//       "0", // royalty_points_numerator
//       [], // property keys
//       [], // property values
//       [], // property types
//     ],
//   };
//   const tx = await window.petra.signAndSubmitTransaction(payload);
//   await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`);
// }

async function mintTicketNFT(event: Event, walletInfo: any, collectionName: string) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo)
    throw new Error("Wallet not connected");

  const payload = {
    type: "entry_function_payload",
    function: "0x3::token::create_token_script",
    type_arguments: [],
    arguments: [
      collectionName,                                 // 0
      `${event.name} Ticket - ${Date.now()}`,         // 1
      event.description || "Event Ticket",            // 2
      1,                                              // 3 - supply
      0,                                              // 4 - max
      event.image_url || "https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png",                 // 5 - uri
      walletInfo.address,                             // 6 - royalty_payee_address
      100,                                            // 7 - royalty_points_denominator
      10,                                             // 8 - royalty_points_numerator
      [true, true, true, true, true],
      [],                                             // 10 - property_keys (vector<String>)
      [],                                             // 11 - property_values (vector<vector<u8>>)
      []                                          // 13 - properties_mutable
    ]
  };
  
  console.log("Mint NFT Payload", payload);
  console.log("✅ MutabilityConfig arg:", payload.arguments[12]);

  const tx = await window.petra.signAndSubmitTransaction(payload);
  const txInfo = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`);
  const txData = await txInfo.json();
  if (!txData.success) throw new Error(txData.vm_status || "Token mint failed");
}


export default function EventsPage() {
  const { status, walletInfo } = useWallet()
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [buyingId, setBuyingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [resaleListings, setResaleListings] = useState<any[]>([])
  const [showResaleTickets, setShowResaleTickets] = useState(false)
  const [buyingResaleId, setBuyingResaleId] = useState<number | null>(null)
  const [groupBookingEvent, setGroupBookingEvent] = useState<Event | null>(null)
  const [isGroupBookingOpen, setIsGroupBookingOpen] = useState(false)
  const [isGroupBookingProcessing, setIsGroupBookingProcessing] = useState(false)

  useEffect(() => {
    async function loadEvents() {
      const [evts, listings] = await Promise.all([
        fetchAllEvents(),
        fetchResaleListings()
      ])
      setEvents(evts)
      setResaleListings(listings)
      setLoading(false)
    }
    loadEvents()
  }, [])

  async function fetchResaleListings(): Promise<any[]> {
    try {
      const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${MODULE_ADDR}/resource/${MODULE}::ResaleMarket`
      const res = await fetch(url)
      
      if (!res.ok) {
        console.log("ResaleMarket not found, returning empty list")
        return []
      }
      
      const data = await res.json()
      return data.data.listings || []
    } catch (error) {
      console.error('Error fetching resale listings:', error)
      return []
    }
  }

  async function buyResaleTicket(listingId: number) {
    if (!walletInfo) {
      alert("Please connect your wallet to buy a resale ticket.")
      return
    }

    setBuyingResaleId(listingId)
    try {
      if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
        throw new Error("Wallet not connected")
      }

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE}::buy_resale_ticket`,
        type_arguments: [],
        arguments: [listingId],
      }

      await window.petra.signAndSubmitTransaction(payload)
      alert("Resale ticket purchased successfully!")
      
      // Refresh listings
      const newListings = await fetchResaleListings()
      setResaleListings(newListings)
    } catch (error: any) {
      console.error("Failed to buy resale ticket:", error)
      alert("Failed to buy resale ticket: " + (error.message || error))
    } finally {
      setBuyingResaleId(null)
    }
  }

  async function handleGroupBooking(numTickets: number, walletAddresses: string[]) {
    if (!walletInfo || !groupBookingEvent) {
      alert("Please connect your wallet to make a group booking.")
      return
    }

    setIsGroupBookingProcessing(true)
    const collectionName = getUserCollectionName(walletInfo.address)
    
    try {
      // Create collection if it doesn't exist
      try {
        await createCollectionIfNotExists(walletInfo, collectionName)
      } catch (err: any) {
        // Collection might already exist, continue
        console.log("Collection creation skipped:", err.message)
      }

      // Mint NFTs for each wallet address
      for (let i = 0; i < numTickets; i++) {
        const targetAddress = walletAddresses[i]
        
        // For demo purposes, we'll mint to the current user's wallet
        // In a real implementation, you'd need to handle cross-wallet transfers
        await mintTicketNFT(groupBookingEvent, walletInfo, collectionName)
        
        console.log(`Minted ticket ${i + 1} for address: ${targetAddress}`)
      }

      alert(`Successfully booked ${numTickets} tickets for your group! Check your profile for the NFT tickets.`)
      setEvents(await fetchAllEvents())
      setIsGroupBookingOpen(false)
      setGroupBookingEvent(null)
    } catch (err: any) {
      console.error("Failed to process group booking:", err)
      alert("Failed to process group booking: " + (err.message || err))
    } finally {
      setIsGroupBookingProcessing(false)
    }
  }

  const filteredEvents = events.filter(ev =>
    (ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === "all" || ev.category === selectedCategory)
  )

  async function handleBuy(event: Event) {
    if (!walletInfo) {
      alert("Please connect your wallet to buy a ticket.");
      return;
    }
    setBuyingId(event.id);
    const collectionName = getUserCollectionName(walletInfo.address);
    try {
      try {
        await mintTicketNFT(event, walletInfo, collectionName);
      } catch (err: any) {
        // If minting fails because the collection does not exist, create it and try again
        if (err.message && err.message.toLowerCase().includes("collection does not exist")) {
          await createCollectionIfNotExists(walletInfo, collectionName);
          await mintTicketNFT(event, walletInfo, collectionName);
        } else {
          throw err;
        }
      }
      alert("Ticket purchased! Check your profile for your NFT ticket.");
      setEvents(await fetchAllEvents());
    } catch (err: any) {
      alert("Failed to buy ticket: " + (err.message || err));
    }
    setBuyingId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <h2 className="text-white text-2xl">Loading events...</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/ticklo-logo.png" alt="Ticklo Logo" width={48} height={48} />
              <span className="text-3xl font-bold text-white tracking-tight">Ticklo</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/80 hover:text-white font-medium text-lg">Home</Link>
              <span className="text-white font-medium text-lg">Events</span>
              <Link href="/organizer" className="text-white/80 hover:text-white font-medium text-lg">For Organizers</Link>
              <Link href="/profile" className="text-white/80 hover:text-white font-medium text-lg">Profile</Link>
              <Button
                onClick={() => {
                  const btn = document.querySelector('[data-wallet-button]') as HTMLButtonElement
                  btn?.click()
                }}
                className={`${status === "connected" && walletInfo
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  } text-white px-8 py-3 rounded-2xl shadow-lg`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {status === "connected" && walletInfo ? "Connected" : "Connect Wallet"}
              </Button>
            </div>
            <Link href="/" className="md:hidden">
              <Button variant="outline" className="border-white/20 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 text-center mb-12">
          <h1 className="text-7xl lg:text-9xl font-bold text-white leading-tight tracking-tight">
            Discover Amazing <span className="italic text-white">Events</span>
          </h1>
          <p className="text-2xl text-white/70 mt-6 max-w-3xl mx-auto">
            Find and book tickets for the most exciting events powered by Web3 technology
          </p>

          {/* Search & Filter */}
          <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/50 pl-12 py-4 rounded-2xl"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {["all", "Music", "Technology", "Art", "Sports", "Business"].map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "all" ? "All Events" : cat}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setShowResaleTickets(!showResaleTickets)}
              variant="outline"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent rounded-2xl"
            >
              <Tag className="w-4 h-4 mr-2" />
              {showResaleTickets ? "Hide" : "Show"} Resale Tickets
            </Button>
          </div>
        </div>
      </section>

      {/* Resale Tickets Section */}
      {showResaleTickets && (
        <section className="pb-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-white">Resale Tickets</h2>
              <Button
                onClick={() => {
                  fetchResaleListings().then(setResaleListings)
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {resaleListings.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                <Tag className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Resale Tickets Available</h3>
                <p className="text-white/70">Check back later for tickets listed by other users.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resaleListings.map((listing) => (
                  <ResaleTicketCard
                    key={listing.listing_id}
                    listing={listing}
                    onBuyResale={buyResaleTicket}
                    isBuying={buyingResaleId === listing.listing_id}
                    currentUserAddress={walletInfo?.address}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center text-white text-xl">No events found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((ev, idx) => (
                <Card
                  key={ev.id}
                  className="relative bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={ev.image_url || "/placeholder.svg"}
                      alt={ev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6 relative">
                    <Badge className="bg-indigo-600 text-white px-3 py-1 rounded-full mb-2">{ev.category}</Badge>
                    <h3 className="text-2xl font-bold text-white">{ev.name}</h3>
                    <p className="text-white/70 mt-2 line-clamp-2">{ev.description}</p>

                    <div className="mt-4 space-y-2 text-white/70 text-sm">
                      <div className="flex items-center"><Calendar className="mr-2" />{new Date(ev.date).toLocaleDateString()}</div>
                      <div className="flex items-center"><Clock className="mr-2" />{ev.time}</div>
                      <div className="flex items-center"><MapPin className="mr-2" />{ev.venue}</div>
                      <div className="flex items-center"><Star className="mr-2" />{ev.tickets_sold}/{ev.capacity} tickets</div>
                    </div>

                    <Badge className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full">{ev.price}</Badge>

                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold px-4 py-2 rounded-2xl shadow-lg"
                        onClick={() => handleBuy(ev)}
                        disabled={ev.tickets_sold >= ev.capacity || buyingId === ev.id}
                      >
                        {buyingId === ev.id ? "Buying..." : ev.tickets_sold >= ev.capacity ? "Sold Out" : "Buy Ticket"}
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-4 py-2 rounded-2xl shadow-lg"
                        onClick={() => {
                          setGroupBookingEvent(ev)
                          setIsGroupBookingOpen(true)
                        }}
                        disabled={ev.tickets_sold >= ev.capacity}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Group Booking Modal */}
      <GroupBookingModal
        event={groupBookingEvent}
        isOpen={isGroupBookingOpen}
        onClose={() => {
          setIsGroupBookingOpen(false)
          setGroupBookingEvent(null)
        }}
        onConfirm={handleGroupBooking}
        isProcessing={isGroupBookingProcessing}
      />
    </div>
  )
}
