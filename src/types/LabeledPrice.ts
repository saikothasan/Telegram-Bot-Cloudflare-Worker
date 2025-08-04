/**
 * This object represents a portion of the price for goods or services
 */
export interface LabeledPrice {
  /** Portion label */
  label: string;
  /** Price of the product in the smallest units of the currency (integer, not float/double) */
  amount: number;
}

