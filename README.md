# Ticklo - Web3 Event Ticketing Platform

A decentralized event ticketing platform built on Aptos blockchain, featuring NFT tickets, group bookings, and a resale market.

## 👨‍💻 Developer Contact

**Developer:** Amrit  
**Email:** amrit03b@gmail.com  
**GitHub:** [amrit03b](https://github.com/amrit03b)  
**Project Repository:** [ticklo](https://github.com/amrit03b/ticklo)

## 🏗️ Deployed Contract Address

**Module Address:** `0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a`  
**Module Name:** `new_event_manager`  
**Network:** Aptos Testnet  
**Explorer:** [Aptos Explorer](https://explorer.aptoslabs.com/account/0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a?network=testnet)

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context + useReducer
- **Wallet Integration:** Petra Wallet Adapter

### Blockchain
- **Platform:** Aptos Blockchain
- **Language:** Move
- **Network:** Aptos Testnet
- **Token Standard:** Aptos Token Standard

### External Services
- **Wallet:** Petra Wallet (Browser Extension)
- **Indexer:** Aptos Indexer API
- **RPC:** Aptos Fullnode API
- **Image Storage:** IPFS/Pinata

## 🚀 Features

- **Event Management:** Create, edit, and delete events
- **NFT Tickets:** Mint unique NFT tickets for events
- **Group Booking:** Book multiple tickets with different wallet addresses
- **Resale Market:** List and buy tickets on secondary market
- **Wallet Integration:** Seamless Petra wallet connection
- **Real-time Updates:** Live data from Aptos blockchain
- **Responsive Design:** Mobile-first user experience

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Petra Wallet browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amrit03b/ticklo.git
   cd ticklo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   NEXT_PUBLIC_APTOS_NETWORK=testnet
   NEXT_PUBLIC_MODULE_ADDRESS=0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a
   NEXT_PUBLIC_MODULE_NAME=new_event_manager
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Smart Contract Setup

1. **Install Aptos CLI**
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Initialize Aptos**
   ```bash
   aptos init --profile testnet --network testnet
   ```

3. **Deploy the contract**
   ```bash
   aptos move compile
   aptos move publish --named-addresses new_event_manager=0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a
   ```

4. **Initialize resale market**
   ```bash
   aptos move run --function-id 0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::new_event_manager::initialize_resale_market
   ```

## 🎯 Usage

### For Event Organizers
1. Connect your Petra wallet
2. Navigate to "For Organizers" page
3. Create events with details, pricing, and capacity
4. Manage your events and track ticket sales

### For Event Attendees
1. Connect your Petra wallet
2. Browse events on the homepage or events page
3. Purchase individual tickets or use group booking
4. View your NFT tickets in your profile
5. List tickets for resale if needed

### Group Booking
1. Select an event and click "Group" button
2. Choose number of tickets (2-10)
3. Enter wallet addresses for each ticket recipient
4. Confirm the booking to mint NFTs for all members

## 📁 Project Structure

```
ticklo/
├── app/                    # Next.js app directory
│   ├── events/            # Events listing page
│   ├── profile/           # User profile with NFTs
│   ├── organizer/         # Event creation/management
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation
│   ├── wallet-modal.tsx  # Wallet connection
│   └── group-booking-modal.tsx # Group booking
├── contexts/             # React contexts
│   └── WalletContext.tsx # Wallet state management
├── lib/                  # Utility functions
│   ├── wallet.ts         # Wallet utilities
│   └── petra-wallet.ts   # Petra wallet adapter
├── sources/              # Smart contracts
│   └── new_event_manager.move
└── public/               # Static assets
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript check

# Smart Contract
pnpm deploy       # Deploy smart contract
pnpm test         # Test smart contract
```

## 🌐 Live Demo

**Frontend:** [https://ticklo.vercel.app](https://ticklo.vercel.app)  
**Testnet Explorer:** [Aptos Explorer](https://explorer.aptoslabs.com/account/0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a?network=testnet)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) for the blockchain platform
- [Petra Wallet](https://petra.app/) for wallet integration
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for the Web3 community**
