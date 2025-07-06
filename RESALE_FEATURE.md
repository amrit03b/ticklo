# Resale Functionality Implementation

## Overview

The resale functionality allows users to sell their event tickets directly through the Ticklo platform. Users can list their tickets for resale at the same price or less than the original purchase price, and other users can buy these resale tickets.

## Smart Contract Changes

### New Structs

1. **ResaleTicket**: Stores information about a ticket listed for resale
   - `listing_id`: Unique identifier for the listing
   - `token_id`: The NFT token ID
   - `event_name`, `event_description`, `event_image_url`: Event details
   - `original_price`, `resale_price`: Price information
   - `seller_address`: Address of the seller
   - `event_date`, `event_time`, `event_venue`, `event_category`: Event metadata

2. **ResaleMarket**: Global resource storing all resale listings
   - `listings`: Vector of ResaleTicket structs
   - `next_listing_id`: Counter for generating unique listing IDs

### New Functions

1. **`initialize_resale_market`**: Sets up the global resale market
2. **`list_ticket_for_resale`**: Lists a ticket for resale
3. **`buy_resale_ticket`**: Purchases a resale ticket
4. **`cancel_resale_listing`**: Cancels a resale listing
5. **`get_resale_listings`**: Returns all resale listings
6. **`get_resale_listings_by_seller`**: Returns listings by a specific seller

## Frontend Components

### 1. ResaleModal (`components/resale-modal.tsx`)
- Modal dialog for listing tickets for resale
- Form to set resale price (≤ original price)
- Preview of ticket and event details
- Validation for price constraints

### 2. ResaleTicketCard (`components/resale-ticket-card.tsx`)
- Card component displaying resale ticket listings
- Shows original vs resale price
- Displays seller information
- Buy button for purchasing resale tickets
- Special handling for own listings

## User Flow

### Listing a Ticket for Resale
1. User goes to Profile page
2. Views their NFT tickets
3. Clicks "List for Resale" button on a ticket
4. Sets resale price (≤ original price)
5. Confirms listing
6. Ticket appears in resale market

### Buying a Resale Ticket
1. User goes to Events page
2. Clicks "Show Resale Tickets" button
3. Views available resale tickets
4. Clicks "Buy Resale Ticket" on desired ticket
5. Confirms purchase
6. Receives ticket, seller receives payment

## Implementation Details

### Price Validation
- Resale price cannot exceed original price
- Minimum price validation (must be > 0)
- Price conversion between APT and octas (1 APT = 1e8 octas)

### Security Features
- Only ticket owner can list for resale
- Only listing owner can cancel listing
- Automatic payment transfer on purchase
- Listing removal after successful purchase

### UI/UX Features
- Clear distinction between original and resale tickets
- Price comparison and savings display
- Seller anonymity (shows truncated address)
- Loading states and error handling
- Responsive design for mobile and desktop

## Deployment Steps

1. **Compile the contract**:
   ```bash
   aptos move compile
   ```

2. **Deploy the contract**:
   ```bash
   aptos move publish
   ```

3. **Initialize the resale market**:
   ```bash
   aptos move run --function-id 0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::new_event_manager::initialize_resale_market
   ```

## Testing

### Manual Testing Steps
1. Create an event and buy a ticket
2. Go to Profile page and list the ticket for resale
3. Go to Events page and view resale tickets
4. Purchase a resale ticket from another account
5. Verify ticket transfer and payment

### Test Cases
- [ ] List ticket for resale
- [ ] Set resale price equal to original price
- [ ] Set resale price less than original price
- [ ] Attempt to set resale price higher than original (should fail)
- [ ] Buy resale ticket
- [ ] Cancel resale listing
- [ ] View resale listings
- [ ] Filter resale listings by seller

## Future Enhancements

1. **Auction System**: Allow bidding on resale tickets
2. **Price History**: Track price changes over time
3. **Notifications**: Alert users when tickets they're interested in are listed
4. **Escrow System**: Hold funds until event completion
5. **Reputation System**: Rate sellers and buyers
6. **Bulk Operations**: List multiple tickets at once
7. **Analytics**: Track resale market trends

## Error Codes

- `2001`: Resale price exceeds original price
- `2002`: Resale listing not found
- `2003`: Listing not found or not authorized to cancel

## API Endpoints

The frontend interacts with the smart contract through these functions:
- `list_ticket_for_resale`
- `buy_resale_ticket`
- `cancel_resale_listing`
- `get_resale_listings`
- `get_resale_listings_by_seller`

## Security Considerations

1. **Price Validation**: Enforced on-chain to prevent overpricing
2. **Ownership Verification**: Only ticket owners can list for resale
3. **Payment Security**: Direct transfer between buyer and seller
4. **Listing Management**: Only sellers can cancel their own listings
5. **Data Integrity**: All data stored on-chain for transparency 