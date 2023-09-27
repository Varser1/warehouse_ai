import axios, { AxiosResponse } from "axios";
import {
  ChainOfferResponse,
  WarehouseOffer,
  WarehouseOfferResponse,
} from "./types";

const {
  GAME_SERVER,
  WAREHOUSE_ERP_SERVER,
  CHATGPT_API_URL,
  CHATGPT_API_KEY,
  PRIVATE_KEY,
  BOT_WALLET_ADDRESS,
} = process.env;

// Function to fetch offers from game server - offers that are on chain
export const fetchChainOffers = async (): Promise<
  AxiosResponse<ChainOfferResponse[]>
> => {
  return axios.get<ChainOfferResponse[]>(`${GAME_SERVER}/getOffers`, {
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      privateKey: PRIVATE_KEY,
    },
  });
};

// Function to fetch offers from warehouse server - direct offers
export const fetchWarehouseOffers = async (): Promise<
  AxiosResponse<WarehouseOfferResponse>
> => {
  return axios.get<WarehouseOfferResponse>(
    `${WAREHOUSE_ERP_SERVER}/offer/get`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Function to analyze warehouse offer using GPT
export const analyzeWarehouseOffer = async (offer: WarehouseOffer) => {
  if (
    !CHATGPT_API_URL ||
    !BOT_WALLET_ADDRESS ||
    offer.addressSeller.toLowerCase() !== BOT_WALLET_ADDRESS.toLowerCase() ||
    offer.state !== "RECEIVED"
  ) {
    return;
  }
  const gptResponse = await axios.post(
    CHATGPT_API_URL,
    {
      prompt: `Analyze new offer for seller: ${offer.addressSeller}, Price: ${
        offer.price
      }, Expiry Date: ${
        offer.expiryDate ? new Date(offer.expiryDate).toLocaleString() : "NAN"
      }`,
      max_tokens: 150,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHATGPT_API_KEY}`,
      },
    }
  );

  const analysisResult = gptResponse.data.choices[0].text.trim();

  // Logic to accept or reject offer.....
  //   await axios.post(`${GAME_SERVER}/acceptOffer`, {
  //     analysisResult,
  //     offerId: offer.id,
  //   });
};

// Function to analyze offer using GPT
export const analyzeChainOffer = async (offer: ChainOfferResponse) => {
  if (
    !CHATGPT_API_URL ||
    !BOT_WALLET_ADDRESS ||
    offer.buyer.toLowerCase() !== BOT_WALLET_ADDRESS.toLowerCase() ||
    offer.state !== 0
  ) {
    return;
  }

  const gptResponse = await axios.post(
    CHATGPT_API_URL,
    {
      prompt: `Analyze new offer with ID: ${offer.id}, Seller: ${
        offer.seller
      }, Price: ${offer.price}, Expiry Date: ${new Date(
        offer.expiryTimestamp
      ).toLocaleString()}`,
      max_tokens: 150,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHATGPT_API_KEY}`,
      },
    }
  );

  const analysisResult = gptResponse.data.choices[0].text.trim();

  // Logic to accept or reject offer.....
};
