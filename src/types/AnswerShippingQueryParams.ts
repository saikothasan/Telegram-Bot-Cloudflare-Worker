import type { ShippingOption } from './ShippingOption';

/**
 * Parameters for answerShippingQuery method
 */
export interface AnswerShippingQueryParams {
  /** Unique identifier for the query to be answered */
  shipping_query_id: string;
  /** Pass True if delivery to the specified address is possible and False if there are any problems */
  ok: boolean;
  /** Required if ok is True. A JSON-serialized array of available shipping options */
  shipping_options?: ShippingOption[];
  /** Required if ok is False. Error message in human readable form that explains why it is impossible to complete the order */
  error_message?: string;
}

