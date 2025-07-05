"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/WalletContext"
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Upload,
  Ticket,
  Wallet,
  ArrowLeft,
  Plus,
  Edit3,
  Eye,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { WalletModal } from "@/components/wallet-modal"
import { uploadImageToPinata } from "@/lib/utils"

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
  organizer: string // for filtering
}

// Helper types
interface OnChainEvent {
  id: string | number;
  name: string;
  description: string;
  price: string | number;
  date: string;
  time: string;
  venue: string;
  capacity: string | number;
  category: string;
}

interface NewEvent {
  name: string
  description: string
  image_url: string
  price: string
  date: string
  time: string
  venue: string
  capacity: string
  status: string
  category: string
}

const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
const MODULE_NAME = "new_event_manager"
const MODULE = `${MODULE_ADDR}::${MODULE_NAME}`

const APTOS_MODULE = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::new_event_manager";

async function createEventOnChain(walletInfo: any, newEvent: NewEvent) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
  const payload = {
    type: "entry_function_payload",
    function: `${APTOS_MODULE}::new_create_event`,
    type_arguments: [],
    arguments: [
      newEvent.name,
      newEvent.description,
      Math.round(Number(newEvent.price) * 1e8), // price in Octas
      newEvent.date,
      newEvent.time,
      newEvent.venue,
      Number(newEvent.capacity),
      newEvent.category,
    ],
  };
  const tx = await window.petra.signAndSubmitTransaction(payload);
  // Wait for confirmation
  await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`);
}

async function fetchEventsForOrganizer(address: string): Promise<Event[]> {
  const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/resource/${APTOS_MODULE}::OrganizerEvents`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data.events || []).map((e: OnChainEvent, i: number): Event => ({
    id: Number(e.id),
    name: e.name,
    description: e.description,
    image_url: "/placeholder.svg?height=200&width=300", // No image on-chain
    price: `${(Number(e.price) / 1e8).toFixed(2)} APT`,
    date: e.date,
    time: e.time,
    venue: e.venue,
    capacity: Number(e.capacity),
    tickets_sold: 0, // Not tracked on-chain yet
    status: "completed", // Default for now
    category: e.category,
    organizer: address,
  }));
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

async function createTickloCollection(walletInfo: any) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
  const payload = {
    type: "entry_function_payload",
    function: `${MODULE}::create_ticklo_collection`,
    type_arguments: [],
    arguments: [],
  };
  await window.petra.signAndSubmitTransaction(payload);
}

function getUserCollectionName(address: string) {
  return `Ticklo Tickets - ${address.slice(0, 6)}`;
}

async function doesCollectionExistAptos(address: string, collectionName: string): Promise<boolean> {
  const url = `https://indexer-testnet.staging.gcp.aptosdev.com/v1/accounts/${address}/collections`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return (data?.collections || data)?.some?.((col: any) => col.collection_name === collectionName);
  } catch {
    return false;
  }
}

async function createAptosCollection(walletInfo: any, collectionName: string) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) {
    throw new Error("Wallet not connected");
  }

  const payload = {
    type: "entry_function_payload",
    function: "0x3::token::create_collection_script",
    type_arguments: [],
    arguments: [
      collectionName,
      "Event tickets for Ticklo",
      "https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png",
      1000, // maximum number of tokens in the collection
      walletInfo.address, // royalty receiver address
      100, // denominator
      10,  // numerator (10% royalty)
      {
        description: true,
        uri: true,
        maximum: true
      }
    ],
  };

  await window.petra.signAndSubmitTransaction(payload);
}


async function mintAptosTicketNFT(event: Event, walletInfo: any, collectionName: string) {
  if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
  const payload = {
  type: "entry_function_payload",
  function: "0x3::token::create_token_script",
  type_arguments: [],
  arguments: [
    collectionName,
    `${event.name} Ticket`,
    event.description || "Event Ticket",
    1, // supply
    0, // max amount of mints per address
    event.image_url || "https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png",
    walletInfo.address, // royalty address
    0, // royalty points numerator
    [], // property_keys
    [], // property_values
    [], // property_types
  ],
};

  await window.petra.signAndSubmitTransaction(payload);
}

export default function OrganizerPage() {
  const [currentPage, setCurrentPage] = useState<"home" | "create" | "past">("home")
  const { status, walletInfo } = useWallet()
  const [events, setEvents] = useState<Event[]>([])
  const [buyingId, setBuyingId] = useState<number | null>(null)

  const [newEvent, setNewEvent] = useState<NewEvent>({
    name: "",
    description: "",
    image_url: "",
    price: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    status: "upcoming",
    category: "",
  })

  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ["Music", "Technology", "Art", "Sports", "Business"]

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'connected' && walletInfo?.address) {
      fetchEventsForOrganizer(walletInfo.address).then(setEvents)
    }
  }, [status, walletInfo])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== 'connected' || !walletInfo) {
      alert("Please connect your wallet first")
      return
    }
    try {
      await createEventOnChain(walletInfo, newEvent)
      setNewEvent({
        name: "",
        description: "",
        image_url: "",
        price: "",
        date: "",
        time: "",
        venue: "",
        capacity: "",
        status: "upcoming",
        category: "",
      })
      setCurrentPage("past")
      // Refetch events from chain
      const chainEvents = await fetchEventsForOrganizer(walletInfo.address)
      setEvents(chainEvents)
    } catch (err: any) {
      alert("Failed to create event on chain: " + (err.message || err))
    }
  }

  const organzerBenefits = [
    {
      icon: Ticket,
      title: "Fair Resale with Built-in Royalties",
      description: "Earn from every resale transaction while preventing scalping",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: DollarSign,
      title: "Instant, Automated Refunds",
      description: "Smart contracts handle refunds automatically when events are cancelled",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: BarChart3,
      title: "Loyalty Insights via Attendance NFTs",
      description: "Track attendee engagement and build lasting relationships",
      color: "from-purple-500 to-pink-500",
    },
  ]

  async function handleImageUpload(file: File): Promise<string> {
    return await uploadImageToPinata(file)
  }

  async function createOrEditEventOnChain(walletInfo: any, event: NewEvent, editId?: number) {
    if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
    const payload = {
      type: "entry_function_payload",
      function: editId !== undefined
        ? `${MODULE}::edit_event`
        : `${MODULE}::create_event`,
      type_arguments: [],
      arguments: editId !== undefined
        ? [
            editId,
            event.name,
            event.description,
            Math.round(Number(event.price) * 1e8),
            event.date,
            event.time,
            event.venue,
            Number(event.capacity),
            event.category,
            event.status,
            event.image_url,
          ]
        : [
            event.name,
            event.description,
            Math.round(Number(event.price) * 1e8),
            event.date,
            event.time,
            event.venue,
            Number(event.capacity),
            event.category,
            event.status,
            event.image_url,
          ],
    }
    const tx = await window.petra.signAndSubmitTransaction(payload)
    await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`)
  }

  async function deleteEventOnChain(walletInfo: any, eventId: number) {
    if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function' || !walletInfo) throw new Error("Wallet not connected");
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE}::delete_event`,
      type_arguments: [],
      arguments: [eventId],
    }
    const tx = await window.petra.signAndSubmitTransaction(payload)
    await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${tx.hash}`)
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

  async function fetchAllEvents(): Promise<Event[]> {
    // Only fetch from the new contract
    const organizers = [MODULE_ADDR];
    let allEvents: Event[] = [];
    for (const addr of organizers) {
      const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${addr}/resource/${MODULE}::OrganizerEvents`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
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
      }));
      allEvents = allEvents.concat(events);
    }
    return allEvents;
  }

  async function handleBuy(event: Event) {
    if (!walletInfo) {
      alert("Please connect your wallet to buy a ticket.");
      return;
    }
    setBuyingId(event.id);
    try {
      const collectionName = getUserCollectionName(walletInfo.address);
      const exists = await doesCollectionExistAptos(walletInfo.address, collectionName);
      if (!exists) {
        await createAptosCollection(walletInfo, collectionName);
      }
      await mintAptosTicketNFT(event, walletInfo, collectionName);
      alert("Ticket purchased! Check your profile for your NFT ticket.");
      setEvents(await fetchAllEvents());
    } catch (err: any) {
      alert("Failed to buy ticket: " + (err.message || err));
    }
    setBuyingId(null);
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
              <div className="flex items-center space-x-3">
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
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setCurrentPage("home")}
                  className={`text-lg font-medium transition-colors ${
                    currentPage === "home" ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("create")}
                  className={`text-lg font-medium transition-colors ${
                    currentPage === "create" ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  Create Event
                </button>
                <button
                  onClick={() => setCurrentPage("past")}
                  className={`text-lg font-medium transition-colors ${
                    currentPage === "past" ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  My Events
                </button>
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
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

              {/* Back to Main Site */}
              <Link href="/" className="md:hidden">
                <Button variant="outline" className="border-white/20 text-white bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="pt-20">
          {currentPage === "home" && (
            <section className="py-24 min-h-screen flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                  <h1 className="text-7xl lg:text-9xl font-bold text-white mb-8 leading-tight tracking-tight animate-fade-in">
                    Start Creating Your{" "}
                    <span className="relative">
                      <span className="text-white italic">Events</span>
                      <div className="absolute -inset-2 bg-white/5 blur-xl -z-10 rounded-lg animate-pulse"></div>
                    </span>
                    <br />
                    <span className="text-6xl lg:text-8xl text-white/90 font-light italic">on Ticklo.</span>
                  </h1>

                  <p className="text-2xl text-white/70 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
                    Join thousands of event organizers using Web3 technology to create extraordinary experiences with
                    transparent, secure, and innovative ticketing solutions.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                    <Button
                      size="lg"
                      onClick={() => setCurrentPage("create")}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-2xl px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl card-shadow"
                    >
                      <Plus className="w-6 h-6 mr-3" />
                      Create Your First Event
                    </Button>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                  {organzerBenefits.map((benefit, index) => (
                    <Card
                      key={index}
                      className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in"
                      style={{
                        animationDelay: `${index * 200}ms`,
                      }}
                    >
                      <CardContent className="p-0 text-center">
                        <div
                          className={`w-24 h-24 bg-gradient-to-br ${benefit.color} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}
                        >
                          <benefit.icon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                        <p className="text-white/70 text-base font-light leading-relaxed">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {currentPage === "create" && (
            <section className="py-24">
              <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-white mb-6">
                      Create New <span className="text-white italic">Event</span>
                    </h1>
                    <p className="text-xl text-white/70 font-light">
                      Fill in the details below to create your next amazing event
                    </p>
                  </div>

                  <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-8 lg:p-12 card-shadow">
                    <CardContent className="p-0">
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        let imageUrl = newEvent.image_url;
                        if (imageFile) {
                          try {
                            imageUrl = await handleImageUpload(imageFile);
                          } catch (err) {
                            alert("Image upload failed");
                            setIsSubmitting(false);
                            return;
                          }
                        }
                        const eventToSubmit = { ...newEvent, image_url: imageUrl };
                        try {
                          if (editingEvent) {
                            await createOrEditEventOnChain(walletInfo, eventToSubmit, editingEvent.id);
                          } else {
                            await createOrEditEventOnChain(walletInfo, eventToSubmit);
                          }
                          setNewEvent({
                            name: "",
                            description: "",
                            image_url: "",
                            price: "",
                            date: "",
                            time: "",
                            venue: "",
                            capacity: "",
                            status: "upcoming",
                            category: "",
                          });
                          setImageFile(null);
                          setEditingEvent(null);
                          setCurrentPage("past");
                          setEvents(await fetchAllEvents());
                        } catch (err: any) {
                          alert("Failed to submit event: " + (err.message || err));
                        }
                        setIsSubmitting(false);
                      }} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-white text-lg font-medium">
                              Event Name
                            </Label>
                            <Input
                              id="name"
                              value={newEvent.name}
                              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                              placeholder="Enter event name"
                              required
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-white text-lg font-medium">
                              Ticket Price (APT)
                            </Label>
                            <Input
                              id="price"
                              value={newEvent.price}
                              onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                              placeholder="0.5 APT"
                              required
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-white text-lg font-medium">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            placeholder="Describe your event..."
                            required
                            rows={4}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-white text-lg font-medium">
                            Event Category
                          </Label>
                          <select
                            id="category"
                            value={newEvent.category}
                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                            required
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="" className="bg-black text-white">
                              Select a category
                            </option>
                            {categories.map((category) => (
                              <option key={category} value={category} className="bg-black text-white">
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image_upload" className="text-white text-lg font-medium">
                            Event Image Upload
                          </Label>
                          <input
                            id="image_upload"
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                              }
                            }}
                            className="block w-full text-white bg-white/10 border-white/20 rounded-xl p-4 text-lg"
                          />
                          {imageFile && (
                            <div className="mt-2">
                              <Image src={URL.createObjectURL(imageFile)} alt="Preview" width={200} height={120} className="rounded-xl" />
                            </div>
                          )}
                          {!imageFile && newEvent.image_url && (
                            <div className="mt-2">
                              <Image src={newEvent.image_url} alt="Current" width={200} height={120} className="rounded-xl" />
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label htmlFor="date" className="text-white text-lg font-medium">
                              Date
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                              required
                              className="bg-white/10 border-white/20 text-white rounded-xl p-4 text-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="time" className="text-white text-lg font-medium">
                              Time
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              value={newEvent.time}
                              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                              required
                              className="bg-white/10 border-white/20 text-white rounded-xl p-4 text-lg"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label htmlFor="venue" className="text-white text-lg font-medium">
                              Venue
                            </Label>
                            <Input
                              id="venue"
                              value={newEvent.venue}
                              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                              placeholder="Event venue location"
                              required
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="capacity" className="text-white text-lg font-medium">
                              Capacity
                            </Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={newEvent.capacity}
                              onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                              placeholder="Maximum attendees"
                              required
                              min="1"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl p-4 text-lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-white text-lg font-medium">
                            Event Status
                          </Label>
                          <select
                            id="status"
                            value={newEvent.status}
                            onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                            required
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="" className="bg-black text-white">
                              Select a status
                            </option>
                            <option value="upcoming" className="bg-black text-white">
                              Upcoming
                            </option>
                            <option value="ongoing" className="bg-black text-white">
                              Ongoing
                            </option>
                            <option value="completed" className="bg-black text-white">
                              Completed
                            </option>
                          </select>
                        </div>

                        <div className="pt-8">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-2xl py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (editingEvent ? "Updating..." : "Creating...") : (editingEvent ? "Update Event" : "Create Event")}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {currentPage === "past" && (
            <section className="py-24">
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <h1 className="text-6xl font-bold text-white mb-6">
                    My <span className="text-white italic">Events</span>
                  </h1>
                  <p className="text-xl text-white/70 font-light">
                    Manage and track all your created events in one place
                  </p>
                </div>

                {events.length === 0 ? (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-16 text-center card-shadow">
                    <CardContent className="p-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Plus className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">No Events Yet</h3>
                      <p className="text-white/70 text-lg mb-8">
                        You haven't created any events yet. Start by creating your first event!
                      </p>
                      <Button
                        onClick={() => setCurrentPage("create")}
                        size="lg"
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-2xl px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                      <Card
                        key={event.id}
                        className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in"
                        style={{
                          animationDelay: `${index * 200}ms`,
                        }}
                      >
                        <div className="relative h-48">
                          <Image
                            src={event.image_url || "/placeholder.svg"}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                              event.status === "completed"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                : event.status === "ongoing"
                                ? "bg-gradient-to-r from-orange-500 to-red-500"
                                : "bg-gradient-to-r from-blue-500 to-indigo-500"
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-white mb-3">{event.name}</h3>
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">{event.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-white/70 text-sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                {new Date(event.date).toLocaleDateString()} at {event.time}
                              </span>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <span className="w-4 h-4 mr-2 text-white">🏷️</span>
                              <span>{event.category}</span>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <Users className="w-4 h-4 mr-2" />
                              <span>
                                {event.tickets_sold}/{event.capacity} tickets sold
                              </span>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>{event.price}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {Math.round((event.tickets_sold / event.capacity) * 100)}%
                            </div>
                          </div>

                          {walletInfo && event.organizer === walletInfo.address && (
                            <div className="flex space-x-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setNewEvent({
                                    name: event.name,
                                    description: event.description,
                                    image_url: event.image_url,
                                    price: event.price.replace(" APT", ""),
                                    date: event.date,
                                    time: event.time,
                                    venue: event.venue,
                                    capacity: String(event.capacity),
                                    status: event.status,
                                    category: event.category,
                                  });
                                  setCurrentPage("create");
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="border-white/20 text-white hover:bg-red-500/20 bg-transparent"
                                onClick={async () => {
                                  if (!window.confirm("Are you sure you want to delete this event?")) return;
                                  setIsSubmitting(true);
                                  try {
                                    await deleteEventOnChain(walletInfo, event.id);
                                    // Poll until the event is removed from the blockchain
                                    let removed = false;
                                    for (let i = 0; i < 10; i++) {
                                      const updatedEvents = await fetchAllEvents();
                                      if (!updatedEvents.find(e => e.id === event.id)) {
                                        setEvents(updatedEvents);
                                        removed = true;
                                        break;
                                      }
                                      await new Promise(res => setTimeout(res, 1000));
                                    }
                                    if (!removed) {
                                      setEvents(await fetchAllEvents());
                                    }
                                  } catch (err: any) {
                                    alert("Failed to delete event: " + (err.message || err));
                                  }
                                  setIsSubmitting(false);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </div>
    </div>
  )
}
