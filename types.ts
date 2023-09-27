export type ChainOfferResponse = {
  id: string;
  seller: string;
  price: number;
  state: number;
  expiryTimestamp: number;
  buyer: string;
};

export type WarehouseOfferResponse = {
  address: string;
  offers: WarehouseOffer[];
};

export type WarehouseOffer = {
  price: number;
  expiryDate?: number;
  state?: string;
  addressSeller: string;
};
