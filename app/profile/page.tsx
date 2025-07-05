"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/contexts/WalletContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

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
        .filter((token: any) => {
          // Log the token for debugging
          console.log('Token object:', token);
          const desc = token?.current_token_data?.description?.toLowerCase() || "";
          const name = token?.current_token_data?.token_name?.toLowerCase() || "";
          return desc.includes("ticklo") || name.includes("ticklo");
        })
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
          .filter((token: any) => {
            const collectionName = token?.current_token_data?.collection_name || 
                                 token?.current_token_data?.collection_id;
            return collectionName === "Ticklo Tickets" || 
                   collectionName?.toLowerCase().includes("ticket");
          })
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
          .filter((token: any) => {
            const collectionName = token?.current_token_data?.collection_name || 
                                 token?.token_data?.collection_name ||
                                 token?.collection_name;
            return collectionName === "Ticklo Tickets" || 
                   collectionName?.toLowerCase().includes("ticket");
          })
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

  useEffect(() => {
    if (status === "connected" && walletInfo?.address) {
      setLoading(true)
      setError(null)
      fetchUserNfts(walletInfo.address)
        .then(nfts => {
          setTickets(nfts)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error loading NFTs:', err)
          setError('Failed to load NFTs from API')
          setTickets([])
          setLoading(false)
        })
    }
  }, [status, walletInfo])

  const handleRetry = () => {
    if (walletInfo?.address) {
      setLoading(true)
      setError(null)
      fetchUserNfts(walletInfo.address)
        .then(nfts => {
          setTickets(nfts)
          setLoading(false)
        })
        .catch(err => {
          console.error('Retry error:', err)
          setError('Failed to load NFTs from API')
          setTickets([]) // Set empty array on error
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
            <div className="text-white/70 text-sm">
              Wallet: {walletInfo.address?.slice(0, 6)}...{walletInfo.address?.slice(-4)}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket, idx) => (
              <Card key={ticket.token_id + idx} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 card-shadow group animate-fade-in">
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
                  <div className="flex items-center text-white/70 text-xs">
                    <span className="w-4 h-4 mr-2 text-white">🆔</span>
                    <span className="break-all">{ticket.token_id?.slice(0, 20)}...</span>
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