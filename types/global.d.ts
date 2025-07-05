declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
      isPhantom?: boolean
      request?: (args: any) => Promise<any>
      on?: (event: string, callback: (params: any) => void) => void
      removeListener?: (event: string, callback: (params: any) => void) => void
    }
    aptos?: {
      connect?: () => Promise<any>
      disconnect?: () => Promise<void>
      account?: () => Promise<any>
      balance?: () => Promise<any>
      network?: () => Promise<any>
    }
    petra?: {
      connect?: () => Promise<any>
      disconnect?: () => Promise<void>
      account?: () => Promise<any>
      balance?: () => Promise<any>
      network?: () => Promise<any>
      isConnected?: () => Promise<boolean>
      signAndSubmitTransaction?: (transaction: any) => Promise<any>
      signTransaction?: (transaction: any) => Promise<any>
    }
  }
}

export {} 