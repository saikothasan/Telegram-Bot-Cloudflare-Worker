/**
 * Parameters for answerPreCheckoutQuery method
 */
export interface AnswerPreCheckoutQueryParams {
  /** Unique identifier for the query to be answered */
  pre_checkout_query_id: string;
  /** Specify True if everything is alright (goods are available, etc.) and the bot is ready to proceed with the order. Use False if there are any problems */
  ok: boolean;
  /** Required if ok is False. Error message in human readable form that explains the reason for failure to proceed with the checkout */
  error_message?: string;
}

