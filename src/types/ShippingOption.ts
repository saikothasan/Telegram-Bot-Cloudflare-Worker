import type { LabeledPrice } from './LabeledPrice';

/**
 * This object represents one shipping option
 */
export interface ShippingOption {
  /** Shipping option identifier */
  id: string;
  /** Option title */
  title: string;
  /** List of price portions */
  prices: LabeledPrice[];
}

