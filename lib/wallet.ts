export interface WalletInfo {
  address: string
  balance: string
  network: string
  isConnected: boolean
  walletName: string
}

export interface WalletError {
  code: string
  message: string
}

// Supported wallet types
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'aptos' | 'petra'

// Wallet connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Global wallet state
export interface WalletState {
  status: ConnectionStatus
  walletInfo: WalletInfo | null
  error: WalletError | null
  isConnecting: boolean
}

// Wallet provider interface
export interface WalletProvider {
  name: string
  type: WalletType
  isAvailable: () => boolean
  connect: () => Promise<WalletInfo>
  disconnect: () => Promise<void>
  getBalance: () => Promise<string>
  getAddress: () => Promise<string>
  getNetwork: () => Promise<string>
}

// Detect if we're in a browser environment
export const isBrowser = typeof window !== 'undefined'

// Detect if MetaMask is available
export const isMetaMaskAvailable = (): boolean => {
  if (!isBrowser) return false
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
}

// Detect if WalletConnect is available
export const isWalletConnectAvailable = (): boolean => {
  if (!isBrowser) return false
  return true // WalletConnect is always available as it can be injected
}

// Detect if Coinbase Wallet is available
export const isCoinbaseWalletAvailable = (): boolean => {
  if (!isBrowser) return false
  return typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet
}

// Detect if Phantom is available
export const isPhantomAvailable = (): boolean => {
  if (!isBrowser) return false
  return typeof window.ethereum !== 'undefined' && window.ethereum.isPhantom
}

// Detect if Aptos wallet is available
export const isAptosWalletAvailable = (): boolean => {
  if (!isBrowser) return false
  return typeof window.aptos !== 'undefined'
}

// Detect if Petra wallet is available
export const isPetraWalletAvailable = (): boolean => {
  if (!isBrowser) return false
  return typeof window.petra !== 'undefined' || typeof window.aptos !== 'undefined'
}

// Get all available wallets
export const getAvailableWallets = (): WalletType[] => {
  return ['petra'];
}

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format balance for display
export const formatBalance = (balance: string, decimals: number = 18): string => {
  if (!balance) return '0'
  const num = parseFloat(balance) / Math.pow(10, decimals)
  return num.toFixed(4)
}

// Convert APT to wei (assuming 8 decimals for Aptos)
export const aptToWei = (apt: string): string => {
  return (parseFloat(apt) * Math.pow(10, 8)).toString()
}

// Convert wei to APT
export const weiToApt = (wei: string): string => {
  return (parseFloat(wei) / Math.pow(10, 8)).toFixed(4)
}

// Generate a mock wallet for demo purposes
export const generateMockWallet = (): WalletInfo => {
  const mockAddresses = [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x8ba1f109551bD432803012645Hac136c772c3c7c',
    '0x147B8eb97fD247D06C4006D269c90C1908Fb5D54',
    '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB'
  ]
  
  const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
  const randomBalance = (Math.random() * 10 + 0.1).toFixed(4)
  
  return {
    address: randomAddress,
    balance: randomBalance,
    network: 'Aptos Mainnet',
    isConnected: true,
    walletName: 'Demo Wallet'
  }
}

// Connect to Petra wallet
export const connectPetraWallet = async (): Promise<WalletInfo> => {
  if (!isBrowser) throw new Error('Petra wallet is not available in this environment');
  try {
    if (typeof window.petra !== 'undefined') {
      // Connect and get account
      const account = await window.petra.connect();
      if (!account || !account.address) throw new Error('No account returned from Petra');
      // Optionally, check isConnected
      if (typeof window.petra.isConnected === 'function') {
        const connected = await window.petra.isConnected();
        if (!connected) throw new Error('Petra wallet is not connected');
      }
      const balance = await fetchAptosBalance(account.address);
      return {
        address: account.address,
        balance,
        network: 'Aptos Testnet',
        isConnected: true,
        walletName: 'Petra Wallet'
      };
    } else if (typeof window.aptos !== 'undefined') {
      const account = await window.aptos.account();
      if (!account || !account.address) throw new Error('No account returned from Aptos');
      const balance = await fetchAptosBalance(account.address);
      return {
        address: account.address,
        balance,
        network: 'Aptos Testnet',
        isConnected: true,
        walletName: 'Aptos Wallet'
      };
    } else {
      throw new Error('Petra wallet is not installed');
    }
  } catch (error) {
    console.error('Petra wallet connection error:', error);
    throw new Error('Failed to connect to Petra wallet');
  }
};

// Error messages
export const WALLET_ERRORS = {
  NOT_AVAILABLE: {
    code: 'WALLET_NOT_AVAILABLE',
    message: 'Wallet is not available. Please install the wallet extension.'
  },
  CONNECTION_FAILED: {
    code: 'CONNECTION_FAILED',
    message: 'Failed to connect to wallet. Please try again.'
  },
  USER_REJECTED: {
    code: 'USER_REJECTED',
    message: 'Connection was rejected by user.'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network error occurred. Please check your connection.'
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred. Please try again.'
  }
} as const

export async function fetchAptosBalance(address: string): Promise<string> {
  if (!address || typeof address !== "string") {
    console.warn("fetchAptosBalance called with invalid address:", address);
    return "0.0000";
  }
  const cleanAddress = address.trim();
  console.log("Fetching balance for address:", cleanAddress);

  const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${cleanAddress}/resources`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Aptos API error: ${response.status} ${response.statusText} for address ${cleanAddress}`);
    return "0.0000";
  }

  let resources;
  try {
    resources = await response.json();
  } catch (e) {
    console.error("Failed to parse Aptos API response as JSON", e);
    return "0.0000";
  }

  const coinStore = resources.find((r: any) =>
    r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  );
  const raw = coinStore ? coinStore.data.coin.value : "0";
  return (parseInt(raw, 10) / 1e8).toFixed(4);
} 