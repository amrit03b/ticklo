module 0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::new_event_manager {
    use std::string;
    use std::vector;
    use std::signer;
    use aptos_token::token;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    struct Event has copy, drop, store {
        id: u64,
        name: string::String,
        description: string::String,
        price: u64,
        date: string::String,
        time: string::String,
        venue: string::String,
        capacity: u64,
        category: string::String,
        status: string::String,
        tickets_sold: u64,
        image_url: string::String,
    }

    struct OrganizerEvents has key {
        events: vector<Event>,
        next_id: u64,
    }

    // New struct for resale tickets
    struct ResaleTicket has copy, drop, store {
        listing_id: u64,
        token_id: string::String,
        event_name: string::String,
        event_description: string::String,
        event_image_url: string::String,
        original_price: u64,
        resale_price: u64,
        seller_address: address,
        event_date: string::String,
        event_time: string::String,
        event_venue: string::String,
        event_category: string::String,
    }

    // Global resale market
    struct ResaleMarket has key {
        listings: vector<ResaleTicket>,
        next_listing_id: u64,
    }

    // Group booking structures
    struct GroupMember has copy, drop, store {
        address: address,
        has_signed: bool,
        signed_at: u64,
    }

    struct GroupBooking has copy, drop, store {
        booking_id: u64,
        event_id: u64,
        organizer_addr: address,
        group_size: u64,
        total_price: u64,
        members: vector<GroupMember>,
        created_at: u64,
        expires_at: u64,
        status: string::String, // "pending", "completed", "expired", "cancelled"
        creator_address: address,
    }

    // Global group bookings storage
    struct GroupBookings has key {
        bookings: vector<GroupBooking>,
        next_booking_id: u64,
    }

    public entry fun create_event(
        organizer: &signer,
        name: string::String,
        description: string::String,
        price: u64,
        date: string::String,
        time: string::String,
        venue: string::String,
        capacity: u64,
        category: string::String,
        status: string::String,
        image_url: string::String,
    ) acquires OrganizerEvents {
        let addr = signer::address_of(organizer);
        if (!exists<OrganizerEvents>(addr)) {
            move_to(organizer, OrganizerEvents {
                events: vector::empty<Event>(),
                next_id: 1,
            });
        };
        let oe = borrow_global_mut<OrganizerEvents>(addr);
        let id = oe.next_id;
        vector::push_back(&mut oe.events, Event {
            id, name, description, price, date, time, venue,
            capacity, category, status, tickets_sold: 0, image_url,
        });
        oe.next_id = id + 1;
    }

    fun find_and_remove_event(oe: &mut OrganizerEvents, event_id: u64, idx: u64) {
        let len = vector::length(&oe.events);
        if (idx >= len) {
            return;
        };
        if (vector::borrow(&oe.events, idx).id == event_id) {
            vector::swap_remove(&mut oe.events, idx);
            return;
        };
        find_and_remove_event(oe, event_id, idx + 1);
    }

    public entry fun delete_event(organizer: &signer, event_id: u64) acquires OrganizerEvents {
        let oe = borrow_global_mut<OrganizerEvents>(signer::address_of(organizer));
        find_and_remove_event(oe, event_id, 0);
    }

    public entry fun edit_event(
        organizer: &signer,
        event_id: u64,
        name: string::String,
        description: string::String,
        price: u64,
        date: string::String,
        time: string::String,
        venue: string::String,
        capacity: u64,
        category: string::String,
        status: string::String,
        image_url: string::String,
    ) acquires OrganizerEvents {
        let oe = borrow_global_mut<OrganizerEvents>(signer::address_of(organizer));
        let len = vector::length(&oe.events);
        let i = 0;
        while (i < len) {
            let ev = vector::borrow_mut(&mut oe.events, i);
            if (ev.id == event_id) {
                ev.name = name;
                ev.description = description;
                ev.price = price;
                ev.date = date;
                ev.time = time;
                ev.venue = venue;
                ev.capacity = capacity;
                ev.category = category;
                ev.status = status;
                ev.image_url = image_url;
                return;
            };
            i = i + 1;
        };
    }

    public entry fun buy_ticket(
        buyer: &signer,
        organizer_addr: address,
        event_id: u64,
    ) acquires OrganizerEvents {
        let oe = borrow_global_mut<OrganizerEvents>(organizer_addr);
        let len = vector::length(&oe.events);
        let i = 0;
        while (i < len) {
            let ev = vector::borrow_mut(&mut oe.events, i);
            if (ev.id == event_id) {
                assert!(ev.tickets_sold < ev.capacity, 1001);
                ev.tickets_sold = ev.tickets_sold + 1;

                let coll = string::utf8(b"Ticklo Tickets");
                let name = string::utf8(b"Event Ticket");
                let description = ev.description;
                let uri = ev.image_url;

                token::create_token_script(
                    buyer,                        // 1
                    coll,                         // 2
                    name,                         // 3
                    description,                  // 4
                    1,                            // 5
                    0,                            // 6
                    uri,                          // 7
                    signer::address_of(buyer),    // 8
                    0,                            // 9
                    0,                            // 10
                    vector::empty<bool>(),        // 11
                    vector::empty<string::String>(), // 12
                    vector::empty<vector<u8>>(),     // 13
                    vector::empty<string::String>(), // 14
                );
                return;
            };
            i = i + 1;
        };
    }

    public fun get_events(addr: address): vector<Event> acquires OrganizerEvents {
        if (exists<OrganizerEvents>(addr)) {
            borrow_global<OrganizerEvents>(addr).events
        } else {
            vector::empty<Event>()
        }
    }

    public entry fun create_ticklo_collection(user: &signer) {
        let coll = string::utf8(b"Ticklo Tickets");
        let desc = string::utf8(b"Event tickets for Ticklo");
        let uri = string::utf8(b"https://raw.githubusercontent.com/amrit03b/ticklo/main/public/ticklo-logo.png"); // non-empty logo URI

        // Create a mutable vector for `mutate_settings`
        let mutate_vec = vector::empty<bool>();
        vector::push_back(&mut mutate_vec, true);  // allow description mutability
        vector::push_back(&mut mutate_vec, true);  // allow URI mutability

        token::create_collection_script(
            user,
            coll,
            desc,
            uri,
            0u64,       // unlimited supply
            mutate_vec  // pass owned vector<bool>
        );
    }

    // Initialize resale market
    public entry fun initialize_resale_market(account: &signer) {
        if (!exists<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a)) {
            move_to(account, ResaleMarket {
                listings: vector::empty<ResaleTicket>(),
                next_listing_id: 1,
            });
        };
    }

    // List a ticket for resale
    public entry fun list_ticket_for_resale(
        seller: &signer,
        token_id: string::String,
        event_name: string::String,
        event_description: string::String,
        event_image_url: string::String,
        original_price: u64,
        resale_price: u64,
        event_date: string::String,
        event_time: string::String,
        event_venue: string::String,
        event_category: string::String,
    ) acquires ResaleMarket {
        assert!(resale_price <= original_price, 2001); // Resale price cannot exceed original price
        
        let market = borrow_global_mut<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let listing_id = market.next_listing_id;
        
        vector::push_back(&mut market.listings, ResaleTicket {
            listing_id,
            token_id,
            event_name,
            event_description,
            event_image_url,
            original_price,
            resale_price,
            seller_address: signer::address_of(seller),
            event_date,
            event_time,
            event_venue,
            event_category,
        });
        
        market.next_listing_id = listing_id + 1;
    }

    // Buy a resale ticket
    public entry fun buy_resale_ticket(
        buyer: &signer,
        listing_id: u64,
    ) acquires ResaleMarket {
        let market = borrow_global_mut<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&market.listings);
        let i = 0;
        
        while (i < len) {
            let listing = vector::borrow_mut(&mut market.listings, i);
            if (listing.listing_id == listing_id) {
                // Transfer APT from buyer to seller
                let buyer_coin = coin::withdraw<AptosCoin>(buyer, listing.resale_price);
                coin::deposit(listing.seller_address, buyer_coin);
                
                // Remove the listing
                vector::swap_remove(&mut market.listings, i);
                return;
            };
            i = i + 1;
        };
        abort 2002; // Listing not found
    }

    // Cancel a resale listing
    public entry fun cancel_resale_listing(
        seller: &signer,
        listing_id: u64,
    ) acquires ResaleMarket {
        let market = borrow_global_mut<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&market.listings);
        let i = 0;
        
        while (i < len) {
            let listing = vector::borrow(&market.listings, i);
            if (listing.listing_id == listing_id && listing.seller_address == signer::address_of(seller)) {
                vector::swap_remove(&mut market.listings, i);
                return;
            };
            i = i + 1;
        };
        abort 2003; // Listing not found or not authorized
    }

    // Get all resale listings
    public fun get_resale_listings(): vector<ResaleTicket> acquires ResaleMarket {
        if (exists<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a)) {
            borrow_global<ResaleMarket>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a).listings
        } else {
            vector::empty<ResaleTicket>()
        }
    }

    // Get resale listings by seller
    public fun get_resale_listings_by_seller(seller_addr: address): vector<ResaleTicket> acquires ResaleMarket {
        let all_listings = get_resale_listings();
        let seller_listings = vector::empty<ResaleTicket>();
        let i = 0;
        let len = vector::length(&all_listings);
        
        while (i < len) {
            let listing = vector::borrow(&all_listings, i);
            if (listing.seller_address == seller_addr) {
                vector::push_back(&mut seller_listings, *listing);
            };
            i = i + 1;
        };
        seller_listings
    }

    // Initialize group bookings storage
    public entry fun initialize_group_bookings(account: &signer) {
        if (!exists<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a)) {
            move_to(account, GroupBookings {
                bookings: vector::empty<GroupBooking>(),
                next_booking_id: 1,
            });
        };
    }

    // Create a new group booking
    public entry fun create_group_booking(
        creator: &signer,
        event_id: u64,
        organizer_addr: address,
        group_size: u64,
        member_addresses: vector<address>,
        current_timestamp: u64,
    ) acquires GroupBookings, OrganizerEvents {
        // Verify the event exists and has enough capacity
        let oe = borrow_global<OrganizerEvents>(organizer_addr);
        let len = vector::length(&oe.events);
        let i = 0;
        let event_found = false;
        let event_price = 0u64;
        
        while (i < len) {
            let ev = vector::borrow(&oe.events, i);
            if (ev.id == event_id) {
                assert!(ev.tickets_sold + group_size <= ev.capacity, 3001); // Not enough capacity
                event_price = ev.price;
                event_found = true;
                break;
            };
            i = i + 1;
        };
        assert!(event_found, 3002); // Event not found
        
        // Verify group size matches member count
        assert!(vector::length(&member_addresses) == group_size, 3003); // Group size mismatch
        
        // Create group members
        let members = vector::empty<GroupMember>();
        let j = 0;
        while (j < group_size) {
            let member_addr = *vector::borrow(&member_addresses, j);
            vector::push_back(&mut members, GroupMember {
                address: member_addr,
                has_signed: false,
                signed_at: 0,
            });
            j = j + 1;
        };
        
        // Calculate total price
        let total_price = event_price * group_size;
        
        // Create the group booking
        let storage = borrow_global_mut<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let booking_id = storage.next_booking_id;
        
        vector::push_back(&mut storage.bookings, GroupBooking {
            booking_id,
            event_id,
            organizer_addr,
            group_size,
            total_price,
            members,
            created_at: current_timestamp,
            expires_at: current_timestamp + 3600, // 1 hour expiry
            status: string::utf8(b"pending"),
            creator_address: signer::address_of(creator),
        });
        
        storage.next_booking_id = booking_id + 1;
    }

    // Join a group booking (sign the booking)
    public entry fun join_group_booking(
        member: &signer,
        booking_id: u64,
        current_timestamp: u64,
    ) acquires GroupBookings {
        let storage = borrow_global_mut<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&storage.bookings);
        let i = 0;
        
        while (i < len) {
            let booking = vector::borrow_mut(&mut storage.bookings, i);
            if (booking.booking_id == booking_id) {
                assert!(booking.status == string::utf8(b"pending"), 3004); // Booking not pending
                assert!(current_timestamp <= booking.expires_at, 3005); // Booking expired
                
                // Find and update the member
                let member_len = vector::length(&booking.members);
                let j = 0;
                while (j < member_len) {
                    let member_data = vector::borrow_mut(&mut booking.members, j);
                    if (member_data.address == signer::address_of(member)) {
                        assert!(!member_data.has_signed, 3006); // Already signed
                        member_data.has_signed = true;
                        member_data.signed_at = current_timestamp;
                        
                        // Check if all members have signed
                        let all_signed = true;
                        let k = 0;
                        while (k < member_len) {
                            let check_member = vector::borrow(&booking.members, k);
                            if (!check_member.has_signed) {
                                all_signed = false;
                                break;
                            };
                            k = k + 1;
                        };
                        
                        if (all_signed) {
                            booking.status = string::utf8(b"completed");
                        };
                        return;
                    };
                    j = j + 1;
                };
                abort 3007; // Member not found in booking
            };
            i = i + 1;
        };
        abort 3008; // Booking not found
    }

    // Cancel a group booking (only creator can cancel)
    public entry fun cancel_group_booking(
        creator: &signer,
        booking_id: u64,
    ) acquires GroupBookings {
        let storage = borrow_global_mut<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&storage.bookings);
        let i = 0;
        
        while (i < len) {
            let booking = vector::borrow_mut(&mut storage.bookings, i);
            if (booking.booking_id == booking_id) {
                assert!(booking.creator_address == signer::address_of(creator), 3009); // Not authorized
                assert!(booking.status == string::utf8(b"pending"), 3010); // Can only cancel pending bookings
                booking.status = string::utf8(b"cancelled");
                return;
            };
            i = i + 1;
        };
        abort 3011; // Booking not found
    }

    // Complete a group booking and mint NFTs for all members
    public entry fun complete_group_booking(
        creator: &signer,
        booking_id: u64,
    ) acquires GroupBookings, OrganizerEvents {
        let storage = borrow_global_mut<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&storage.bookings);
        let i = 0;
        
        while (i < len) {
            let booking = vector::borrow_mut(&mut storage.bookings, i);
            if (booking.booking_id == booking_id) {
                assert!(booking.status == string::utf8(b"completed"), 3012); // Booking not completed
                assert!(booking.creator_address == signer::address_of(creator), 3013); // Not authorized
                
                // Update event tickets sold
                let oe = borrow_global_mut<OrganizerEvents>(booking.organizer_addr);
                let event_len = vector::length(&oe.events);
                let j = 0;
                
                while (j < event_len) {
                    let ev = vector::borrow_mut(&mut oe.events, j);
                    if (ev.id == booking.event_id) {
                        ev.tickets_sold = ev.tickets_sold + booking.group_size;
                        break;
                    };
                    j = j + 1;
                };
                
                // Store completed booking for NFT claiming
                // We'll keep the booking but mark it as "ready_for_claiming"
                booking.status = string::utf8(b"ready_for_claiming");
                return;
            };
            i = i + 1;
        };
        abort 3014; // Booking not found
    }

    // Get all group bookings
    public fun get_group_bookings(): vector<GroupBooking> acquires GroupBookings {
        if (exists<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a)) {
            borrow_global<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a).bookings
        } else {
            vector::empty<GroupBooking>()
        }
    }

    // Get group bookings by creator
    public fun get_group_bookings_by_creator(creator_addr: address): vector<GroupBooking> acquires GroupBookings {
        let all_bookings = get_group_bookings();
        let creator_bookings = vector::empty<GroupBooking>();
        let i = 0;
        let len = vector::length(&all_bookings);
        
        while (i < len) {
            let booking = vector::borrow(&all_bookings, i);
            if (booking.creator_address == creator_addr) {
                vector::push_back(&mut creator_bookings, *booking);
            };
            i = i + 1;
        };
        creator_bookings
    }

    // Get group bookings by member
    public fun get_group_bookings_by_member(member_addr: address): vector<GroupBooking> acquires GroupBookings {
        let all_bookings = get_group_bookings();
        let member_bookings = vector::empty<GroupBooking>();
        let i = 0;
        let len = vector::length(&all_bookings);
        
        while (i < len) {
            let booking = vector::borrow(&all_bookings, i);
            let member_len = vector::length(&booking.members);
            let j = 0;
            while (j < member_len) {
                let member = vector::borrow(&booking.members, j);
                if (member.address == member_addr) {
                    vector::push_back(&mut member_bookings, *booking);
                    break;
                };
                j = j + 1;
            };
            i = i + 1;
        };
        member_bookings
    }

    // Claim NFT for a completed group booking
    public entry fun claim_group_booking_nft(
        member: &signer,
        booking_id: u64,
    ) acquires GroupBookings, OrganizerEvents {
        let storage = borrow_global_mut<GroupBookings>(@0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a);
        let len = vector::length(&storage.bookings);
        let i = 0;
        
        while (i < len) {
            let booking = vector::borrow_mut(&mut storage.bookings, i);
            if (booking.booking_id == booking_id) {
                assert!(booking.status == string::utf8(b"ready_for_claiming"), 3015); // Booking not ready for claiming
                
                // Check if member is in the booking and has signed
                let member_len = vector::length(&booking.members);
                let j = 0;
                let member_found = false;
                let member_has_signed = false;
                let member_has_claimed = false;
                
                while (j < member_len) {
                    let member_data = vector::borrow(&booking.members, j);
                    if (member_data.address == signer::address_of(member)) {
                        member_found = true;
                        member_has_signed = member_data.has_signed;
                        // Check if member has claimed by looking at signed_at timestamp
                        // If signed_at is 0xFFFFFFFF, it means the member has claimed
                        member_has_claimed = (member_data.signed_at == 0xFFFFFFFF);
                        break;
                    };
                    j = j + 1;
                };
                
                assert!(member_found, 3016); // Member not found in booking
                assert!(member_has_signed, 3017); // Member has not signed the booking
                assert!(!member_has_claimed, 3019); // Member has already claimed
                
                // Get event details for NFT minting
                let oe = borrow_global<OrganizerEvents>(booking.organizer_addr);
                let event_len = vector::length(&oe.events);
                let k = 0;
                let event_description = string::utf8(b"");
                let event_image_url = string::utf8(b"");
                
                while (k < event_len) {
                    let ev = vector::borrow(&oe.events, k);
                    if (ev.id == booking.event_id) {
                        event_description = ev.description;
                        event_image_url = ev.image_url;
                        break;
                    };
                    k = k + 1;
                };
                
                // Mint NFT for the member
                let coll = string::utf8(b"Ticklo Tickets");
                let name = string::utf8(b"Group Event Ticket");
                let description = event_description;
                let uri = event_image_url;

                token::create_token_script(
                    member,                        // 1
                    coll,                         // 2
                    name,                         // 3
                    description,                  // 4
                    1,                            // 5
                    0,                            // 6
                    uri,                          // 7
                    signer::address_of(member),   // 8
                    0,                            // 9
                    0,                            // 10
                    vector::empty<bool>(),        // 11
                    vector::empty<string::String>(), // 12
                    vector::empty<vector<u8>>(),     // 13
                    vector::empty<string::String>(), // 14
                );
                
                // Mark member as claimed by setting signed_at to special value
                let m = 0;
                while (m < member_len) {
                    let member_data = vector::borrow_mut(&mut booking.members, m);
                    if (member_data.address == signer::address_of(member)) {
                        member_data.signed_at = 0xFFFFFFFF; // Mark as claimed
                        break;
                    };
                    m = m + 1;
                };
                
                // Check if all members have claimed their NFTs
                let all_claimed = true;
                let n = 0;
                while (n < member_len) {
                    let member_data = vector::borrow(&booking.members, n);
                    if (member_data.signed_at != 0xFFFFFFFF) {
                        all_claimed = false;
                        break;
                    };
                    n = n + 1;
                };
                
                // If all claimed, remove the booking
                if (all_claimed) {
                    vector::swap_remove(&mut storage.bookings, i);
                };
                
                return;
            };
            i = i + 1;
        };
        abort 3018; // Booking not found
    }

}
