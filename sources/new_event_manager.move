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

}
