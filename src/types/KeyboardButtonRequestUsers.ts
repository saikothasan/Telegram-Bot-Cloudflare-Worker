/**
 * This object defines the criteria used to request suitable users
 */
export interface KeyboardButtonRequestUsers {
  /** Signed 32-bit identifier of the request */
  request_id: number;
  /** Pass True to request bots, pass False to request regular users */
  user_is_bot?: boolean;
  /** Pass True to request premium users, pass False to request non-premium users */
  user_is_premium?: boolean;
  /** The maximum number of users to be selected; 1-10. Defaults to 1 */
  max_quantity?: number;
  /** Pass True to request the users' first and last name */
  request_name?: boolean;
  /** Pass True to request the users' username */
  request_username?: boolean;
  /** Pass True to request the users' photo */
  request_photo?: boolean;
}

