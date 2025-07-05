"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import {
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  Award,
  DollarSign,
  Search,
  CreditCard,
  Ticket,
  Zap,
  Twitter,
  Github,
  Plus,
  Sparkles,
  Wallet,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function TickloHomepage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    // Loading animation - shorter duration
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, entry.target.id]))
            }
          })
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
      )

      // Observe all sections
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref)
      })

      return () => observer.disconnect()
    }

    if (!isLoading) {
      const cleanup = setupObserver()
      return cleanup
    }
  }, [isLoading])

  const upcomingEvents = [
    {
      id: 1,
      title: "Neon Nights Festival",
      date: "Aug 15, 2024",
      location: "Cyber Arena, NYC",
      price: "0.5 APT",
      image: "/placeholder.svg?height=200&width=300",
      trending: true,
    },
    {
      id: 2,
      title: "Web3 Summit 2024",
      date: "Sep 22, 2024",
      location: "Tech Hub, SF",
      price: "1.2 APT",
      image: "/placeholder.svg?height=200&width=300",
      trending: false,
    },
    {
      id: 3,
      title: "Digital Art Expo",
      date: "Oct 5, 2024",
      location: "Meta Gallery, LA",
      price: "0.3 APT",
      image: "/placeholder.svg?height=200&width=300",
      trending: true,
    },
  ]

  const features = [
    {
      icon: Users,
      title: "Squad Booking",
      description: "Rally your crew and split the bill seamlessly",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: RefreshCw,
      title: "Fair Resale",
      description: "Transparent ticket trading without exploitation",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "NFT Collectibles",
      description: "Earn exclusive attendance badges and rewards",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: DollarSign,
      title: "Instant Refunds",
      description: "Automatic refunds for cancelled events",
      color: "from-orange-500 to-red-500",
    },
  ]

  const steps = [
    {
      icon: Search,
      title: "Discover Events",
      description: "Browse curated experiences",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Users,
      title: "Invite Friends",
      description: "Create your event squad",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay with cryptocurrency",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: Ticket,
      title: "Receive NFT",
      description: "Get your digital ticket",
      color: "from-orange-400 to-red-500",
    },
  ]

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
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">Ticklo</h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <span className="text-white/70 text-lg">Loading your experience...</span>
          </div>
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
        <div
          className="absolute w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl transition-all duration-700 ease-out animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10">
        <Navbar
          isWalletConnected={isWalletConnected}
          onWalletConnect={() => setIsWalletConnected(!isWalletConnected)}
        />

        {/* Hero Section */}
        <section
          id="hero"
          ref={(el) => (sectionRefs.current.hero = el)}
          className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 min-h-screen flex items-center animate-fade-in"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-slide-in">
                <Sparkles className="w-5 h-5 text-white mr-3 animate-pulse" />
                <span className="text-white text-base font-medium">Web3 Ticketing Revolution</span>
              </div>

              <h1 className="text-7xl lg:text-9xl font-bold text-white mb-8 leading-tight tracking-tight animate-slide-in delay-200">
                Experience{" "}
                <span className="relative">
                  <span className="text-white italic animate-text-shimmer">Events.</span>
                  <div className="absolute -inset-2 bg-white/5 blur-xl -z-10 rounded-lg animate-pulse"></div>
                </span>
                <br />
                <span className="text-6xl lg:text-8xl text-white/90 font-light italic">Effortlessly.</span>
              </h1>

              <p className="text-2xl text-white/70 mb-10 leading-relaxed font-light max-w-3xl mx-auto animate-slide-in delay-400">
                Discover and book tickets powered by <span className="text-white font-medium">Aptos blockchain</span>.
                Create groups, split payments, and earn exclusive rewards in the future of event experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-in delay-600">
                <Link href="/events">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-2xl px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl card-shadow group"
                  >
                    <span className="relative z-10 flex items-center">
                      🚀 Browse Events
                      <div className="ml-2 w-0 group-hover:w-6 transition-all duration-300 overflow-hidden">
                        <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
                      </div>
                    </span>
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Learn More
                </Button>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full animate-float blur-sm"></div>
              <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full animate-float-delayed blur-sm"></div>
              <div className="absolute bottom-20 left-20 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full animate-float blur-sm"></div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section id="events" ref={(el) => (sectionRefs.current.events = el)} className="py-24 bg-white/[0.01]">
          <div className="container mx-auto px-6">
            <div
              className={`text-center mb-20 transition-all duration-1000 ${
                visibleSections.has("events") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
              }`}
            >
              <h2 className="text-6xl font-bold text-white mb-6">
                🔥 <span className="text-white italic">Hot Events</span>
              </h2>
              <p className="text-2xl text-white/70 font-light">Don't miss out on these extraordinary experiences</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {upcomingEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in"
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-6 right-6 flex gap-3">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold px-4 py-2 animate-pulse">
                        {event.price}
                      </Badge>
                      {event.trending && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold animate-bounce px-4 py-2">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-white/70 mb-3">
                      <Calendar className="w-5 h-5 mr-3 text-white" />
                      <span className="text-base font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center text-white/70">
                      <MapPin className="w-5 h-5 mr-3 text-white" />
                      <span className="text-base font-medium">{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={(el) => (sectionRefs.current.features = el)} className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-6xl font-bold text-white mb-6">
                ⚡ Why <span className="text-white italic">Ticklo</span> Excels?
              </h2>
              <p className="text-2xl text-white/70 font-light">
                The future of event ticketing, reimagined for the digital age
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <CardContent className="p-0 text-center">
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-base font-light leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          ref={(el) => (sectionRefs.current["how-it-works"] = el)}
          className="py-24 bg-white/[0.01]"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-6xl font-bold text-white mb-6">
                🎯 How It <span className="text-white italic">Works</span>
              </h2>
              <p className="text-2xl text-white/70 font-light">Four elegant steps to your perfect event experience</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-center group animate-fade-in"
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <div className="relative mb-10">
                    <div
                      className={`w-28 h-28 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-125 transition-transform duration-300 shadow-2xl`}
                    >
                      <step.icon className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 text-black rounded-full flex items-center justify-center text-lg font-bold animate-bounce">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-white/70 font-light text-lg leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wallet Preview Section */}
        <section id="wallet" ref={(el) => (sectionRefs.current.wallet = el)} className="py-24">
          <div className="container mx-auto px-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-12 lg:p-16 hover:bg-white/10 transition-all duration-1000 card-shadow animate-fade-in">
              <CardContent className="p-0 text-center">
                {isWalletConnected ? (
                  <div>
                    <h2 className="text-5xl font-bold text-white mb-12">
                      🎮 Your <span className="text-white italic">Dashboard</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="bg-white/5 rounded-3xl p-8 border border-white/20 card-shadow animate-fade-in">
                        <h3 className="text-2xl font-bold text-white mb-6">🎫 Your Tickets</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-white/80 animate-slide-in">
                            <span className="font-medium text-lg">Neon Nights Festival</span>
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold px-4 py-2 animate-pulse">
                              Active
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-white/80 animate-slide-in delay-100">
                            <span className="font-medium text-lg">Web3 Summit 2024</span>
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold px-4 py-2 animate-pulse">
                              Upcoming
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-8 border border-white/20 card-shadow animate-fade-in delay-200">
                        <h3 className="text-2xl font-bold text-white mb-6">🏆 Badges Earned</h3>
                        <div className="flex justify-center space-x-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            <Award className="w-10 h-10 text-white" />
                          </div>
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce delay-100 shadow-lg">
                            <Zap className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-5xl font-bold text-white mb-6">
                      🔗 Connect Wallet to View Your <span className="text-white italic">Events</span>
                    </h2>
                    <p className="text-white/70 mb-12 font-light text-xl leading-relaxed max-w-2xl mx-auto">
                      Access your tickets, badges, and complete event history in one elegant dashboard
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-2xl px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl group"
                      onClick={() => setIsWalletConnected(true)}
                    >
                      <Wallet className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="footer"
          ref={(el) => (sectionRefs.current.footer = el)}
          className="py-20 bg-white/[0.01] border-t border-white/10"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in">
              <div className="text-5xl font-bold text-white mb-6 italic">Ticklo</div>
              <div className="flex justify-center space-x-8">
                <a
                  href="#"
                  className="text-white/70 hover:text-white transition-colors hover:scale-125 transform duration-300"
                >
                  <Twitter className="w-8 h-8" />
                </a>
                <a
                  href="#"
                  className="text-white/70 hover:text-white transition-colors hover:scale-125 transform duration-300"
                >
                  <Github className="w-8 h-8" />
                </a>
              </div>
            </div>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-1000 card-shadow animate-fade-in delay-200">
              <CardContent className="p-0 text-center">
                <h3 className="text-4xl font-bold text-white mb-6">
                  👋 Want to host your own event on <span className="text-white italic">Ticklo</span>?
                </h3>
                <p className="text-white/70 mb-8 font-light text-xl leading-relaxed max-w-2xl mx-auto">
                  Join thousands of event organizers creating extraordinary experiences on our platform
                </p>
                <Link href="/organizer">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 rounded-2xl px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl group"
                  >
                    <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />🚀 List
                    Your Event
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="text-center text-white/50 text-lg mt-12 font-light animate-fade-in delay-400">
              © 2024 Ticklo. All rights reserved. Built with 💜 for the Web3 community.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
