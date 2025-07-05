module 0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::new_event_manager {
    use std::string;
    use std::vector;
    use std::signer;
    use aptos_token::token;

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
}
