import { Provider, Size } from "../domain/types";

export const PRICE_TABLE: Record<Provider, Record<Size, number>> = {
  LP: { S: 150, M: 490, L: 690 },
  MR: { S: 200, M: 300, L: 400 },
};

// 10eur in cents, easy to adjust in a single place
export const MONTHLY_DISCOUNT_CAP = 1000; 
