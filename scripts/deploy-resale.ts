#!/usr/bin/env tsx

import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

const MODULE_ADDR = "0x70beae59414f2e9115a4eaace4edd0409643069b056c8996def20d6e8d322f1a";
const MODULE_NAME = "new_event_manager";

async function deployContract() {
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  
  // You would need to provide the private key for deployment
  // const privateKey = process.env.PRIVATE_KEY;
  // const account = new AptosAccount(new Uint8Array(Buffer.from(privateKey, 'hex')));
  
  console.log("Deploying updated contract with resale functionality...");
  console.log("Module Address:", MODULE_ADDR);
  console.log("Module Name:", MODULE_NAME);
  
  // In a real deployment, you would:
  // 1. Compile the Move contract
  // 2. Deploy it using the Aptos CLI or SDK
  // 3. Initialize the resale market
  
  console.log("To deploy this contract:");
  console.log("1. Use 'aptos move compile' to compile the contract");
  console.log("2. Use 'aptos move publish' to deploy the contract");
  console.log("3. Call 'initialize_resale_market' function to set up the resale market");
  
  console.log("\nContract functions available:");
  console.log("- initialize_resale_market(account: &signer)");
  console.log("- list_ticket_for_resale(seller: &signer, token_id: String, ...)");
  console.log("- buy_resale_ticket(buyer: &signer, listing_id: u64)");
  console.log("- cancel_resale_listing(seller: &signer, listing_id: u64)");
  console.log("- get_resale_listings(): vector<ResaleTicket>");
  console.log("- get_resale_listings_by_seller(seller_addr: address): vector<ResaleTicket>");
}

async function initializeResaleMarket() {
  console.log("To initialize the resale market, call:");
  console.log(`aptos move run --function-id ${MODULE_ADDR}::${MODULE_NAME}::initialize_resale_market`);
}

deployContract().catch(console.error); 