export interface Sender {
  name: string;
  email: string;
  count: number;
}

/**
 * Represents the available unsubscribe options for a single email sender.
 *
 * @property posturl - The URL to send an HTTP POST request to unsubscribe, or null if not available.
 * @property mailto - The mailto link to send an unsubscribe email, or null if not available.
 * @property clickurl - The URL to visit in order to unsubscribe, or null if not available.
 */
export interface UnsubscribeData {
  posturl: string | null;
  mailto: string | null;
  clickurl: string | null;
}

/**
 * Represents data related to a number of email senders that cannot be automatically unsubscribed from.
 *
 * @property linkOnlySenders - An array of tuples, where each tuple contains:
 *   - The sender's email address as a string.
 *   - The corresponding clickable unsubscribe link as a string.
 *   Used for senders that provide an unsubscribe link but require manual action.
 *
 * @property noUnsubscribeOptionSenders - An array of email addresses (strings) for senders
 *   that do not provide any unsubscribe option.
 */
export interface ManualUnsubscribeData {
  linkOnlySenders: [string, string][];
  noUnsubscribeOptionSenders: string[];
}
