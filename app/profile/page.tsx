"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/contexts/WalletContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, Tag, RefreshCw } from "lucide-react"
import { ResaleModal } from "@/components/resale-modal"

interface NftTicket {
  name: string
  description: string
  image_url: string
  collection: string
  token_id: string
}

async function fetchUserNfts(address: string): Promise<NftTicket[]> {
  const graphqlUrl = 'https://api.testnet.aptoslabs.com/v1/graphql';
  const graphqlQuery = {
    query: `
      query GetAccountNfts($address: String!) {
        current_token_ownerships_v2(
          where: {
            owner_address: {_eq: $address}
            amount: {_gt: "0"}
          }
        ) {
          token_data_id
          current_token_data {
            token_name
            description
            token_uri
            collection_id
          }
        }
      }
    `,
    variables: { address }
  };

  const graphqlRes = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphqlQuery)
  });

      if (graphqlRes.ok) {
      const graphqlData = await graphqlRes.json();
      console.log('GraphQL Response:', graphqlData);

      if (graphqlData.data?.current_token_ownerships_v2) {
        return graphqlData.data.current_token_ownerships_v2
          .map((token: any) => ({
            name: token?.current_token_data?.token_name || token?.token_data_id || "Event Ticket",
            description: token?.current_token_data?.description || "Event ticket NFT",
            image_url: token?.current_token_data?.token_uri || "/ticklo-logo.png",
            collection: token?.current_token_data?.description || "Ticklo Tickets",
            token_id: token?.token_data_id || `token_${Date.now()}`
          }));
      }
    }
  return [];
}

// Fetch user NFTs using multiple API approaches
async function fetchUserTokensV2(address: string): Promise<NftTicket[]> {
  console.log('Fetching tokens for address:', address);
  
  try {
    // Option 1: Try the GraphQL endpoint first (most reliable for NFTs)
    const graphqlUrl = 'https://api.testnet.aptoslabs.com/v1/graphql';
    const graphqlQuery = {
      query: `
        query GetAccountNfts($address: String!) {
          current_token_ownerships_v2(
            where: {
              owner_address: {_eq: $address}
              amount: {_gt: "0"}
            }
          ) {
            token_data_id
            current_token_data {
              token_name
              description
              token_uri
              collection_id
              collection_name
            }
          }
        }
      `,
      variables: { address }
    };
    
    const graphqlRes = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery)
    });
    
    if (graphqlRes.ok) {
      const graphqlData = await graphqlRes.json();
      console.log('GraphQL Response:', graphqlData);
      
      if (graphqlData.data?.current_token_ownerships_v2) {
        return graphqlData.data.current_token_ownerships_v2
          .map((token: any) => ({
            name: token?.current_token_data?.token_name || "Event Ticket",
            description: token?.current_token_data?.description || "Event ticket NFT",
            image_url: token?.current_token_data?.token_uri || "/ticklo-logo.png",
            collection: token?.current_token_data?.collection_name || 
                       token?.current_token_data?.collection_id || "Ticklo Tickets",
            token_id: token?.token_data_id || `token_${Date.now()}`
          }));
      }
    }
    
    // Option 2: Try the indexer API endpoint
    const indexerUrl = `https://api.testnet.aptoslabs.com/v1/accounts/${address}/tokens`;
    const indexerRes = await fetch(indexerUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (indexerRes.ok) {
      const indexerData = await indexerRes.json();
      console.log('Indexer API Response:', indexerData);
      
      if (Array.isArray(indexerData)) {
        return indexerData
          .map((token: any) => ({
            name: token?.current_token_data?.token_name || 
                  token?.token_data?.token_name || 
                  token?.name || 
                  "Event Ticket",
            description: token?.current_token_data?.description || 
                        token?.token_data?.description || 
                        token?.description || 
                        "Event ticket NFT",
            image_url: token?.current_token_data?.token_uri || 
                      token?.token_data?.token_uri || 
                      token?.image_url || 
                      "/ticklo-logo.png",
            collection: token?.current_token_data?.collection_name || 
                       token?.token_data?.collection_name || 
                       token?.collection_name || 
                       "Ticklo Tickets",
            token_id: token?.token_data_id_hash || 
                     token?.current_token_data?.token_data_id_hash || 
                     token?.token_id || 
                     `token_${Date.now()}`
          }));
      }
    }
    
    // Option 3: Try the fullnode REST API
    const restUrl = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/resources`;
    const restRes = await fetch(restUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (restRes.ok) {
      const restData = await restRes.json();
      console.log('REST API Response:', restData);
      
      // Look for token store resources
      const tokenStores = restData.filter((resource: any) => 
        resource.type.includes('token::TokenStore') || 
        resource.type.includes('Token') ||
        resource.type.includes('NFT')
      );
      
      console.log('Found token stores:', tokenStores);
      
      // This would need more specific parsing based on your token structure
      // For now, return empty array if no specific tokens found
      return [];
    }
    
    // If all API calls fail, return empty array
    console.warn('All API endpoints failed or returned no data');
    return [];
    
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error; // Re-throw to handle in the calling function
  }
}

export default function ProfilePage() {
  const { walletInfo, status } = useWallet()
  const [tickets, setTickets] = useState<NftTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListing, setIsListing] = useState(false)
  const [resaleListings, setResaleListings] = useState<any[]>([])
  const [showResaleListings, setShowResaleListings] = useState(false)

  useEffect(() => {
    if (status === "connected" && walletInfo?.address) {
      setLoading(true)
      setError(null)
      Promise.all([
        fetchUserNfts(walletInfo.address),
        fetchResaleListings()
      ])
        .then(([nfts, listings]) => {
          setTickets(nfts)
          setResaleListings(listings)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error loading data:', err)
          setError('Failed to load data from API')
          setTickets([])
          setResaleListings([])
          setLoading(false)
        })
    }
  }, [status, walletInfo])

  async function fetchResaleListings(): Promise<any[]> {
    try {
      const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
      const MODULE_NAME = "new_event_manager"
      const MODULE = `${MODULE_ADDR}::${MODULE_NAME}`
      
      const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${MODULE_ADDR}/resource/${MODULE}::ResaleMarket`
      const res = await fetch(url)
      
      if (!res.ok) {
        // If ResaleMarket doesn't exist, try to initialize it
        console.log("ResaleMarket not found, attempting to initialize...")
        await initializeResaleMarket()
        return []
      }
      
      const data = await res.json()
      return data.data.listings || []
    } catch (error) {
      console.error('Error fetching resale listings:', error)
      return []
    }
  }

  async function initializeResaleMarket() {
    if (!walletInfo) {
      console.log("Wallet not connected, cannot initialize resale market")
      return
    }

    try {
      const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
      const MODULE_NAME = "new_event_manager"
      
      if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
        throw new Error("Wallet not connected")
      }

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDR}::${MODULE_NAME}::initialize_resale_market`,
        type_arguments: [],
        arguments: [],
      }

      await window.petra.signAndSubmitTransaction(payload)
      console.log("Resale market initialized successfully!")
    } catch (error: any) {
      console.error("Failed to initialize resale market:", error)
    }
  }

  async function listTicketForResale(resalePrice: number, ticket: NftTicket) {
    if (!walletInfo) {
      alert("Please connect your wallet to list a ticket for resale.")
      return
    }

    setIsListing(true)
    try {
      const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
      const MODULE_NAME = "new_event_manager"
      
      if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
        throw new Error("Wallet not connected")
      }

      // Extract event details from ticket name and description
      // In a real implementation, you might store more metadata in the NFT
      const eventName = ticket.name.replace(" Ticket", "").replace(" - ", " ")
      const eventDescription = ticket.description || "Event ticket"
      const eventImageUrl = ticket.image_url || "/ticklo-logo.png"
      
      // For now, we'll use default values for missing metadata
      // In production, you'd store this data in the NFT metadata
      const eventDate = "2024-12-31" // This should come from NFT metadata
      const eventTime = "19:00" // This should come from NFT metadata
      const eventVenue = "Event Venue" // This should come from NFT metadata
      const eventCategory = "Event" // This should come from NFT metadata
      
      // Try to extract original price from ticket name or use default
      // In production, this should come from NFT metadata or event data
      let originalPrice = 0.5 // Default price
      if (ticket.name.includes("0.5") || ticket.name.includes("0.5 APT")) {
        originalPrice = 0.5
      } else if (ticket.name.includes("1.0") || ticket.name.includes("1.0 APT")) {
        originalPrice = 1.0
      } else if (ticket.name.includes("2.0") || ticket.name.includes("2.0 APT")) {
        originalPrice = 2.0
      }

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDR}::${MODULE_NAME}::list_ticket_for_resale`,
        type_arguments: [],
        arguments: [
          ticket.token_id, // token_id
          eventName, // event_name
          eventDescription, // event_description
          eventImageUrl, // event_image_url
          Math.floor(originalPrice * 1e8), // original_price (in octas)
          Math.floor(resalePrice * 1e8), // resale_price (in octas)
          eventDate, // event_date
          eventTime, // event_time
          eventVenue, // event_venue
          eventCategory, // event_category
        ],
      }

      await window.petra.signAndSubmitTransaction(payload)
      alert("Ticket listed for resale successfully!")
      
      // Refresh listings
      const newListings = await fetchResaleListings()
      setResaleListings(newListings)
    } catch (error: any) {
      console.error("Failed to list ticket for resale:", error)
      alert("Failed to list ticket for resale: " + (error.message || error))
    } finally {
      setIsListing(false)
    }
  }

  async function cancelResaleListing(listingId: number) {
    if (!walletInfo) {
      alert("Please connect your wallet to cancel a resale listing.")
      return
    }

    try {
      const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a"
      const MODULE_NAME = "new_event_manager"
      
      if (!window.petra || typeof window.petra.signAndSubmitTransaction !== 'function') {
        throw new Error("Wallet not connected")
      }

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDR}::${MODULE_NAME}::cancel_resale_listing`,
        type_arguments: [],
        arguments: [listingId],
      }

      await window.petra.signAndSubmitTransaction(payload)
      alert("Resale listing cancelled successfully!")
      
      // Refresh listings
      const newListings = await fetchResaleListings()
      setResaleListings(newListings)
    } catch (error: any) {
      console.error("Failed to cancel resale listing:", error)
      alert("Failed to cancel resale listing: " + (error.message || error))
    }
  }

  const handleRetry = () => {
    if (walletInfo?.address) {
      setLoading(true)
      setError(null)
      Promise.all([
        fetchUserNfts(walletInfo.address),
        fetchResaleListings()
      ])
        .then(([nfts, listings]) => {
          setTickets(nfts)
          setResaleListings(listings)
          setLoading(false)
        })
        .catch(err => {
          console.error('Retry error:', err)
          setError('Failed to load data from API')
          setTickets([])
          setResaleListings([])
          setLoading(false)
        })
    }
  }

  return (
    <div className="min-h-screen bg-black py-16">
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
              <Link href="/events" className="text-white/80 hover:text-white font-medium text-lg">Events</Link>
              <Link href="/organizer" className="text-white/80 hover:text-white font-medium text-lg">For Organizers</Link>
              <span className="text-white font-medium text-lg">Profile</span>
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
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-32">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-bold text-white">My NFT Tickets</h1>
          {status === "connected" && walletInfo && (
            <div className="flex items-center space-x-4">
              <div className="text-white/70 text-sm">
                Wallet: {walletInfo.address?.slice(0, 6)}...{walletInfo.address?.slice(-4)}
              </div>
              <Button
                onClick={() => setShowResaleListings(!showResaleListings)}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
              >
                <Tag className="w-4 h-4 mr-2" />
                {showResaleListings ? "Hide" : "Show"} Resale Market
              </Button>
            </div>
          )}
        </div>
        
        {status !== "connected" ? (
          <div className="text-center py-16">
            <div className="text-white text-xl mb-4">Connect your wallet to view your tickets.</div>
            <Button
              onClick={() => {
                const btn = document.querySelector('[data-wallet-button]') as HTMLButtonElement
                btn?.click()
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-2xl shadow-lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="text-white text-xl">Loading your tickets...</div>
            <div className="mt-4 text-white/70">This may take a few moments</div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl mr-4"
            >
              Try Again
            </Button>
            <div className="mt-4 text-white/70 text-sm">
              Check console for detailed error information
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-white text-xl mb-4">No NFT tickets found in your wallet.</div>
            <div className="text-white/70 text-sm">
              NFT tickets will appear here after you purchase them from events.
            </div>
          </div>
        ) : (
          <>
            {/* Resale Market Section */}
            {showResaleListings && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Resale Market</h2>
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
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
                    <Tag className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Resale Listings</h3>
                    <p className="text-white/70">No tickets are currently listed for resale.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resaleListings.map((listing) => {
                      const isOwnListing = walletInfo?.address === listing.seller_address
                      return (
                        <div key={listing.listing_id} className="bg-white/5 border border-orange-500/20 rounded-3xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              Resale
                            </Badge>
                            <span className="text-white/70 text-sm">
                              {listing.resale_price / 1e8} APT
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{listing.event_name}</h3>
                          <p className="text-white/70 text-sm mb-4">{listing.event_description}</p>
                          <div className="text-white/60 text-xs mb-4">
                            <div>Seller: {listing.seller_address.slice(0, 6)}...{listing.seller_address.slice(-4)}</div>
                            <div>Original: {listing.original_price / 1e8} APT</div>
                          </div>
                          {isOwnListing && (
                            <Button
                              onClick={() => cancelResaleListing(listing.listing_id)}
                              variant="outline"
                              size="sm"
                              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                            >
                              Cancel Listing
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Tickets Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tickets.map((ticket) => (
                <Card key={ticket.token_id} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in">
                  <div className="relative h-48">
                    <Image
                      src={ticket.image_url && ticket.image_url !== "/placeholder.svg" ? ticket.image_url : "/ticklo-logo.png"}
                      alt={ticket.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to logo if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/ticklo-logo.png";
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold px-3 py-1">
                        NFT Ticket
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">{ticket.name}</h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{ticket.description || "Event ticket NFT"}</p>
                    <div className="flex items-center text-white/70 text-sm mb-2">
                      <span className="w-4 h-4 mr-2 text-white">🎟️</span>
                      <span>{ticket.collection}</span>
                    </div>
                    <div className="flex items-center text-white/70 text-xs mb-4">
                      <span className="w-4 h-4 mr-2 text-white">🆔</span>
                      <span className="break-all">{ticket.token_id?.slice(0, 20)}...</span>
                    </div>
                    
                    {/* Resale Modal */}
                    <ResaleModal
                      ticket={ticket}
                      eventDetails={{
                        name: ticket.name,
                        description: ticket.description,
                        image_url: ticket.image_url,
                        price: "0.5 APT", // Default price - in production this should come from NFT metadata
                        date: "2024-12-31",
                        time: "19:00",
                        venue: "Event Venue",
                        category: "Event"
                      }}
                      onListForResale={(price) => listTicketForResale(price, ticket)}
                      isListing={isListing}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}