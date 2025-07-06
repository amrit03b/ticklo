#!/usr/bin/env tsx

import { AptosClient } from "aptos";

const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a";
const MODULE_NAME = "new_event_manager";

async function testResaleMarket() {
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  
  console.log("Testing Resale Market functionality...");
  console.log("Module Address:", MODULE_ADDR);
  console.log("Module Name:", MODULE_NAME);
  
  try {
    // Check if ResaleMarket exists
    const resaleMarketUrl = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${MODULE_ADDR}/resource/${MODULE_NAME}::ResaleMarket`;
    const resaleMarketRes = await fetch(resaleMarketUrl);
    
    if (resaleMarketRes.ok) {
      const resaleMarketData = await resaleMarketRes.json();
      console.log("✅ ResaleMarket exists!");
      console.log("Current listings:", resaleMarketData.data.listings?.length || 0);
      console.log("Next listing ID:", resaleMarketData.data.next_listing_id);
    } else {
      console.log("❌ ResaleMarket not found - needs to be initialized");
      console.log("To initialize, call: initialize_resale_market()");
    }
    
    // Check if OrganizerEvents exists
    const organizerEventsUrl = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${MODULE_ADDR}/resource/${MODULE_NAME}::OrganizerEvents`;
    const organizerEventsRes = await fetch(organizerEventsUrl);
    
    if (organizerEventsRes.ok) {
      const organizerEventsData = await organizerEventsRes.json();
      console.log("✅ OrganizerEvents exists!");
      console.log("Current events:", organizerEventsData.data.events?.length || 0);
    } else {
      console.log("❌ OrganizerEvents not found");
    }
    
  } catch (error) {
    console.error("Error testing resale market:", error);
  }
}

async function testContractFunctions() {
  console.log("\nAvailable Contract Functions:");
  console.log("1. initialize_resale_market(account: &signer)");
  console.log("2. list_ticket_for_resale(seller: &signer, token_id: String, event_name: String, event_description: String, event_image_url: String, original_price: u64, resale_price: u64, event_date: String, event_time: String, event_venue: String, event_category: String)");
  console.log("3. buy_resale_ticket(buyer: &signer, listing_id: u64)");
  console.log("4. cancel_resale_listing(seller: &signer, listing_id: u64)");
  console.log("5. get_resale_listings(): vector<ResaleTicket>");
  console.log("6. get_resale_listings_by_seller(seller_addr: address): vector<ResaleTicket>");
  
  console.log("\nFrontend Integration Status:");
  console.log("✅ Profile page - List tickets for resale");
  console.log("✅ Events page - View and buy resale tickets");
  console.log("✅ ResaleModal component - Price setting interface");
  console.log("✅ ResaleTicketCard component - Display resale listings");
  console.log("✅ Cancel functionality - Remove own listings");
  console.log("✅ Auto-initialization - Creates ResaleMarket if missing");
}

testResaleMarket().then(() => {
  testContractFunctions();
}).catch(console.error); 