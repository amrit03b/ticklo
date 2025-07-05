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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useWallet } from "@/contexts/WalletContext"

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

async function buyTicketOnChain(organizer: string, eventId: number, walletInfo: any) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
  const payload = {
    type: "entry_function_payload",
    function: `${MODULE}::buy_ticket`,
    type_arguments: [],
    arguments: [
      organizer, // organizer_addr: address
      eventId    // event_id: u64
    ],
  };
  const tx = await window.petra.signAndSubmitTransaction(payload);
  await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`);
}

export default function EventsPage() {
  const { status, walletInfo } = useWallet()
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [buyingId, setBuyingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      const evts = await fetchAllEvents()
      setEvents(evts)
      setLoading(false)
    }
    loadEvents()
  }, [])

  const filteredEvents = events.filter(ev =>
    (ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === "all" || ev.category === selectedCategory)
  )

  async function handleBuy(ev: Event) {
    if (!walletInfo) {
      alert("Connect your wallet first")
      return
    }
    setBuyingId(ev.id)
    try {
      await buyTicketOnChain(ev.organizer, ev.id, walletInfo)
      alert("Ticket purchased!")
      setEvents(await fetchAllEvents())
    } catch (err: any) {
      alert("Failed: " + (err.message || err))
    }
    setBuyingId(null)
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
          </div>
        </div>
      </section>

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

                    <Button
                      className="absolute bottom-4 right-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold px-4 py-2 rounded-2xl shadow-lg"
                      onClick={() => handleBuy(ev)}
                      disabled={ev.tickets_sold >= ev.capacity || buyingId === ev.id}
                    >
                      {buyingId === ev.id ? "Buying..." : ev.tickets_sold >= ev.capacity ? "Sold Out" : "Buy Ticket"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
