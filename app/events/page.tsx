"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Search, Heart, Share2, ArrowLeft, Clock, Star, Wallet } from "lucide-react"
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
    arguments: [walletInfo.address, organizer, eventId],
  }
  const tx = await window.petra.signAndSubmitTransaction(payload)
  await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`)
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { status, walletInfo } = useWallet()
  const [events, setEvents] = useState<Event[]>([])
  const [buyingId, setBuyingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchAllEvents().then(evts => {
      setEvents(evts)
      setIsLoading(false)
    })
  }, [])

  const categories = ["all", "Music", "Technology", "Art", "Sports", "Business"]

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  async function handleBuy(event: Event) {
    if (!walletInfo) {
      alert("Please connect your wallet to buy a ticket.")
      return
    }
    setBuyingId(event.id)
    try {
      await buyTicketOnChain(event.organizer, event.id, walletInfo)
      alert("Ticket purchased! Check your profile for your NFT ticket.")
      // Optionally refetch events to update tickets_sold
      setEvents(await fetchAllEvents())
    } catch (err: any) {
      alert("Failed to buy ticket: " + (err.message || err))
    }
    setBuyingId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center grid-background">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto animate-pulse">
              <Image
                src="/ticklo-logo.png"
                alt="Ticklo Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">Loading Events...</h1>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden grid-background">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/95"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src="/ticklo-logo.png"
                    alt="Ticklo Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">Ticklo</span>
              </Link>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium text-lg">
                  Home
                </Link>
                <span className="text-white font-medium text-lg">Events</span>
                <Link
                  href="/organizer"
                  className="text-white/80 hover:text-white transition-colors font-medium text-lg"
                >
                  For Organizers
                </Link>
                <Button
                  onClick={() => {
                    // This will be handled by the navbar wallet button
                    const walletButton = document.querySelector('[data-wallet-button]') as HTMLButtonElement
                    if (walletButton) {
                      walletButton.click()
                    }
                  }}
                  className={`${
                    status === 'connected' && walletInfo
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  } text-white border-0 rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {status === 'connected' && walletInfo ? "Connected" : "Connect Wallet"}
                </Button>
              </div>

              {/* Mobile Back Button */}
              <Link href="/" className="md:hidden">
                <Button variant="outline" className="border-white/20 text-white bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-7xl lg:text-9xl font-bold text-white mb-8 leading-tight tracking-tight">
                Discover Amazing{" "}
                <span className="relative">
                  <span className="text-white italic animate-text-shimmer">Events</span>
                  <div className="absolute -inset-2 bg-white/5 blur-xl -z-10 rounded-lg animate-pulse"></div>
                </span>
              </h1>
              <p className="text-2xl text-white/70 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
                Find and book tickets for the most exciting events powered by Web3 technology
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto mb-16 animate-fade-in delay-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-6 h-6" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl pl-12 pr-4 py-4 text-lg"
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      } rounded-2xl px-6 py-3 font-semibold whitespace-nowrap`}
                    >
                      {category === "all" ? "All Events" : category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="pb-24">
          <div className="container mx-auto px-6">
            {filteredEvents.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-16 text-center card-shadow">
                <CardContent className="p-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">No Events Found</h3>
                  <p className="text-white/70 text-lg">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map((event, index) => (
                  <Card
                    key={event.id}
                    className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in"
                    style={{
                      animationDelay: `${index * 200}ms`,
                    }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={event.image_url || "/placeholder.svg"}
                        alt={event.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {event.status === "completed" && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold px-3 py-1">
                            Completed
                          </Badge>
                        )}
                        {event.status === "ongoing" && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold px-3 py-1 animate-pulse">
                            Ongoing
                          </Badge>
                        )}
                        {event.status === "upcoming" && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold px-3 py-1 animate-pulse">
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold px-4 py-2 text-lg">
                          {event.price}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          className="bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30 rounded-full p-2"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30 rounded-full p-2"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-white/10 text-white rounded-full px-3 py-1 font-medium">
                          {event.category}
                        </Badge>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="text-white/80 font-medium">{event.tickets_sold}/{event.capacity} tickets sold</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                        {event.name}
                      </h3>

                      <p className="text-white/70 text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-white/70 text-sm">
                          <Calendar className="w-4 h-4 mr-3 text-white" />
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <Clock className="w-4 h-4 mr-3 text-white" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <MapPin className="w-4 h-4 mr-3 text-white" />
                          <span className="font-medium">
                            {event.venue}, {event.venue}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                          by <span className="text-white font-medium">{event.organizer}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105"
                          disabled={event.tickets_sold >= event.capacity || !walletInfo || buyingId === event.id}
                          onClick={() => handleBuy(event)}
                        >
                          {event.tickets_sold >= event.capacity ? "Sold Out" : buyingId === event.id ? "Buying..." : walletInfo ? "Buy Ticket" : "Connect Wallet to Buy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
