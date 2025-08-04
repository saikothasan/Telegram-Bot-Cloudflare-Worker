/**
 * Describes why a request was unsuccessful
 */
export interface ResponseParameters {
  /** The group has been migrated to a supergroup with the specified identifier */
  migrate_to_chat_id?: number;
  /** In case of exceeding flood control, the number of seconds left to wait before the request can be repeated */
  retry_after?: number;
}

