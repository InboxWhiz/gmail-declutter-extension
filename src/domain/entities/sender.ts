/**
 * Represents an email sender with their identification and frequency information.
 *
 * @property {string} email - The email address of the sender
 * @property {Set<string>} names - All known display names of the sender
 * @property {number} emailCount - The number of emails received from this sender
 */
export interface Sender {
  email: string;
  names: Set<string>;
  emailCount: number;
}
