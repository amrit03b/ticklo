"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Menu, X } from "lucide-react"
import Image from "next/image"

interface NavbarProps {
  isWalletConnected: boolean
  onWalletConnect: () => void
}

export function Navbar({ isWalletConnected, onWalletConnect }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <a
              href="#events"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium text-lg"
            >
              Events
            </a>
            <a
              href="#features"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium text-lg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium text-lg"
            >
              How It Works
            </a>
            <Button
              onClick={onWalletConnect}
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-white/80 transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10">
            <div className="flex flex-col space-y-6">
              <a href="#events" className="text-white/80 hover:text-white transition-colors font-medium text-lg">
                Events
              </a>
              <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium text-lg">
                Features
              </a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors font-medium text-lg">
                How It Works
              </a>
              <Button
                onClick={onWalletConnect}
                className={`${
                  isWalletConnected
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                } text-white border-0 rounded-2xl px-8 py-3 font-semibold w-fit`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isWalletConnected ? "Connected" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
