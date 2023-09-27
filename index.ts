import express from "express";
import dotenv from "dotenv";
import {
  analyzeChainOffer,
  analyzeWarehouseOffer,
  fetchChainOffers,
  fetchWarehouseOffers,
} from "./utils";

dotenv.config();

const PORT = 4000;
const INTERVAL_MS = 5000;

const app = express();

const { GAME_SERVER, CHATGPT_API_URL, CHATGPT_API_KEY, BOT_WALLET_ADDRESS } =
  process.env;

if (
  !GAME_SERVER ||
  !CHATGPT_API_URL ||
  !CHATGPT_API_KEY ||
  !BOT_WALLET_ADDRESS
) {
  throw new Error(
    "Missing essential environment variables: GAME_SERVER, CHATGPT_API_URL, CHATGPT_API_KEY, BOT_WALLET_ADDRESS"
  );
}

// Periodically Check Offers and Analyze Them
setInterval(async () => {
  try {
    const [chainOffersResponse, warehouseOffersResponse] = await Promise.all([
      fetchChainOffers(),
      fetchWarehouseOffers(),
    ]);

    if (
      chainOffersResponse.status !== 200 ||
      warehouseOffersResponse.status !== 200
    ) {
      console.error("Request failed for fetching offers", {
        chainOffersStatus: chainOffersResponse.status,
        warehouseOffersStatus: warehouseOffersResponse.status,
      });
      return;
    }

    const chainOffers = chainOffersResponse.data;
    const warehouseOffers = warehouseOffersResponse.data;

    await Promise.all([
      ...warehouseOffers.offers.map(analyzeWarehouseOffer),
      ...chainOffers.map(analyzeChainOffer),
    ]);
  } catch (error) {
    console.error(
      "Error in checking offers and communicating with APIs",
      error
    );
  }
}, INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
