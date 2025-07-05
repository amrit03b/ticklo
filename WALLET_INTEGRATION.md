# Wallet Integration Documentation

## Overview

The Ticklo platform now features a fully functional Web3 wallet integration system that supports multiple wallet types and provides a seamless user experience for connecting, managing, and transacting with wallets.

## Features

### 🔗 **Multi-Wallet Support**
- **Petra Wallet** - Official Aptos blockchain wallet (Recommended)
- **MetaMask** - Ethereum wallet with browser extension
- **WalletConnect** - Universal wallet connection via QR codes
- **Coinbase Wallet** - Coinbase's Web3 wallet
- **Phantom** - Solana wallet (with Ethereum support)
- **Aptos Wallet** - Generic Aptos blockchain wallet

### 💰 **Wallet Management**
- **Connection Status** - Real-time wallet connection state
- **Balance Display** - Show wallet balance in APT tokens
- **Address Formatting** - Truncated address display for UI
- **Network Detection** - Automatic network identification
- **Persistent Connection** - Remember wallet connection across sessions

### 🎫 **Transaction Support**
- **Ticket Purchases** - Buy event tickets with APT tokens
- **Token Transfers** - Send APT tokens to other addresses
- **Event Creation** - Create events on the blockchain
- **Transaction History** - Track transaction status and hashes

## Architecture

### Core Components

#### 1. **Wallet Context (`contexts/WalletContext.tsx`)**
- Global wallet state management
- Connection/disconnection logic
- Error handling and recovery
- Persistent storage with localStorage

#### 2. **Wallet Utilities (`lib/wallet.ts`)**
- Wallet detection and availability checks
- Address and balance formatting
- APT token conversion utilities
- Mock wallet generation for demo
- Petra wallet connection utilities

#### 3. **Petra Wallet Adapter (`lib/petra-wallet.ts`)**
- Official Petra wallet integration
- Transaction signing and submission
- Event listeners for wallet state changes
- Connection management and cleanup

#### 4. **Wallet Modal (`components/wallet-modal.tsx`)**
- User-friendly wallet selection interface
- Connection status display
- Balance and network information
- Error messaging and recovery
- Petra wallet prioritization

#### 5. **Wallet Status (`components/wallet-status.tsx`)**
- Compact wallet status indicators
- Connection state visualization
- Balance refresh functionality

#### 6. **Transaction Hook (`hooks/useWalletTransaction.ts`)**
- Transaction state management
- Ticket purchase functionality
- Token transfer capabilities
- Event creation on blockchain

## Usage Examples

### Basic Wallet Connection

```tsx
import { useWallet } from '@/contexts/WalletContext'

function MyComponent() {
  const { status, walletInfo, connect, disconnect } = useWallet()
  
  return (
    <div>
      {status === 'connected' ? (
        <div>
          <p>Connected: {walletInfo?.address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### Transaction Handling

```tsx
import { useWalletTransaction } from '@/hooks/useWalletTransaction'

function TicketPurchase({ eventId, price }) {
  const { buyTicket, transactionState } = useWalletTransaction()
  
  const handlePurchase = async () => {
    const result = await buyTicket(eventId, price, 1)
    if (result.success) {
      console.log('Ticket purchased!', result.txHash)
    }
  }
  
  return (
    <button 
      onClick={handlePurchase}
      disabled={transactionState.isProcessing}
    >
      {transactionState.isProcessing ? 'Processing...' : 'Buy Ticket'}
    </button>
  )
}
```

### Wallet Status Display

```tsx
import { WalletStatus } from '@/components/wallet-status'

function Header() {
  return (
    <header>
      <WalletStatus showDetails={true} />
    </header>
  )
}
```

## Implementation Details

### State Management

The wallet system uses React Context with a reducer pattern for predictable state updates:

```typescript
interface WalletState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  walletInfo: WalletInfo | null
  error: WalletError | null
  isConnecting: boolean
}
```

### Persistence

Wallet connections are persisted using localStorage:

```typescript
// Save connection
localStorage.setItem('ticklo-wallet-connection', JSON.stringify(walletInfo))

// Restore connection
const savedWallet = localStorage.getItem('ticklo-wallet-connection')
```

### Error Handling

Comprehensive error handling for common wallet scenarios:

- Wallet not available
- Connection failures
- User rejection
- Network errors
- Transaction failures

### Mock Implementation

For demo purposes, the system includes mock wallet functionality:

- Random wallet addresses
- Simulated balance updates
- Mock transaction hashes
- Realistic connection delays

### Petra Wallet Integration

The system includes full Petra wallet support:

- **Official Adapter** - Uses `petra-plugin-wallet-adapter` for real integration
- **Fallback Support** - Falls back to basic Petra connection if adapter fails
- **Event Listeners** - Real-time connection state monitoring
- **Auto-Disconnect** - Automatically handles external wallet disconnections
- **Transaction Support** - Full transaction signing and submission capabilities

## Security Considerations

### Client-Side Security
- No private keys stored in the application
- Wallet connections use standard Web3 protocols
- Transaction signing handled by wallet providers
- Secure localStorage usage for connection persistence

### Best Practices
- Always verify wallet connection before transactions
- Handle connection errors gracefully
- Provide clear user feedback for all operations
- Implement proper loading states

## Future Enhancements

### Planned Features
- **Real Blockchain Integration** - Connect to actual Aptos blockchain
- **Smart Contract Integration** - Deploy and interact with ticket contracts
- **NFT Ticket Support** - Issue tickets as NFTs
- **Multi-Chain Support** - Support for Ethereum, Polygon, and other chains
- **Advanced Analytics** - Transaction history and analytics
- **Gas Optimization** - Smart gas estimation and optimization

### Technical Improvements
- **Web3Modal v3** - Upgrade to latest Web3Modal version
- **Wallet Adapter** - Implement Aptos wallet adapter
- **Transaction Batching** - Batch multiple transactions
- **Off-Chain Data** - IPFS integration for event metadata

## Troubleshooting

### Common Issues

1. **Wallet Not Detected**
   - Ensure wallet extension is installed
   - Check if wallet is unlocked
   - Verify browser compatibility

2. **Connection Fails**
   - Check network connectivity
   - Verify wallet permissions
   - Clear browser cache and retry

3. **Transaction Errors**
   - Ensure sufficient balance
   - Check network congestion
   - Verify transaction parameters

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('ticklo-debug', 'true')
```

## API Reference

### Wallet Context Methods

- `connect(walletType?)` - Connect to wallet
- `disconnect()` - Disconnect wallet
- `refreshBalance()` - Update wallet balance
- `clearError()` - Clear error state

### Transaction Hook Methods

- `buyTicket(eventId, price, quantity)` - Purchase event ticket
- `transferTokens(toAddress, amount)` - Transfer APT tokens
- `createEvent(eventData)` - Create new event
- `resetTransaction()` - Reset transaction state

### Utility Functions

- `formatAddress(address)` - Format address for display
- `formatBalance(balance, decimals)` - Format balance
- `aptToWei(apt)` - Convert APT to wei
- `weiToApt(wei)` - Convert wei to APT

## Contributing

When contributing to the wallet integration:

1. Follow the existing code patterns
2. Add proper TypeScript types
3. Include error handling
4. Test with multiple wallet types
5. Update documentation

## License

This wallet integration is part of the Ticklo platform and follows the same licensing terms. 