"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Search, Heart, Share2, ArrowLeft, Clock, Star, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  price: string
  image: string
  category: string
  trending: boolean
  featured: boolean
  attendees: number
  maxAttendees: number
  rating: number
  organizer: string
}

export default function EventsPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const events: Event[] = [
    {
      id: 1,
      title: "Neon Nights Festival",
      description:
        "Experience the ultimate electronic music festival with world-class DJs, stunning visuals, and an unforgettable atmosphere under the neon lights.",
      date: "2024-08-15",
      time: "20:00",
      location: "New York City",
      venue: "Cyber Arena",
      price: "0.5 APT",
      image: "/placeholder.svg?height=300&width=400",
      category: "Music",
      trending: true,
      featured: true,
      attendees: 1247,
      maxAttendees: 2000,
      rating: 4.8,
      organizer: "NeonEvents",
    },
    {
      id: 2,
      title: "Web3 Summit 2024",
      description:
        "Join industry leaders, developers, and innovators for the most comprehensive Web3 conference of the year. Learn about the latest trends in blockchain technology.",
      date: "2024-09-22",
      time: "09:00",
      location: "San Francisco",
      venue: "Tech Hub Convention Center",
      price: "1.2 APT",
      image: "/placeholder.svg?height=300&width=400",
      category: "Technology",
      trending: false,
      featured: true,
      attendees: 856,
      maxAttendees: 1500,
      rating: 4.9,
      organizer: "Web3Foundation",
    },
    {
      id: 3,
      title: "Digital Art Expo",
      description:
        "Discover the future of digital art and NFTs. Meet renowned digital artists, explore interactive installations, and witness the evolution of creative expression.",
      date: "2024-10-05",
      time: "14:00",
      location: "Los Angeles",
      venue: "Meta Gallery",
      price: "0.3 APT",
      image: "/placeholder.svg?height=300&width=400",
      category: "Art",
      trending: true,
      featured: false,
      attendees: 432,
      maxAttendees: 800,
      rating: 4.7,
      organizer: "DigitalArtsCollective",
    },
  ]

  const categories = ["all", "Music", "Technology", "Art", "Sports", "Business"]

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
                  onClick={() => setIsWalletConnected(!isWalletConnected)}
                  className={`${
                    isWalletConnected
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  } text-white border-0 rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isWalletConnected ? "Connected" : "Connect Wallet"}
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
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {event.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold px-3 py-1">
                            ⭐ Featured
                          </Badge>
                        )}
                        {event.trending && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold px-3 py-1 animate-pulse">
                            🔥 Trending
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
                          <span className="text-white/80 font-medium">{event.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                        {event.title}
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
                            {event.venue}, {event.location}
                          </span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <Users className="w-4 h-4 mr-3 text-white" />
                          <span className="font-medium">
                            {event.attendees}/{event.maxAttendees} attending
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
                        >
                          Book Now
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
