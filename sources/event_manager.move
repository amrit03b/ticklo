module 0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a::event_manager {
    use std::string;
    use std::vector;
    use std::signer;

    struct Event has copy, drop, store {
        id: u64,
        name: string::String,
        description: string::String,
        price: u64, // in Octas (1 APT = 10^8 Octas)
        date: string::String,
        time: string::String,
        venue: string::String,
        capacity: u64,
        category: string::String,
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
    ) {
        let addr = signer::address_of(organizer);
        if (!exists<OrganizerEvents>(addr)) {
            move_to(organizer, OrganizerEvents { events: vector::empty<Event>(), next_id: 1 });
        }
        let organizer_events = borrow_global_mut<OrganizerEvents>(addr);
        let event = Event {
            id: organizer_events.next_id,
            name,
            description,
            price,
            date,
            time,
            venue,
            capacity,
            category,
        };
        vector::push_back(&mut organizer_events.events, event);
        organizer_events.next_id = organizer_events.next_id + 1;
    }

    public fun get_events(addr: address): vector<Event> acquires OrganizerEvents {
        if (exists<OrganizerEvents>(addr)) {
            let org = borrow_global<OrganizerEvents>(addr);
            org.events
        } else {
            vector::empty<Event>()
        }
    }
} 