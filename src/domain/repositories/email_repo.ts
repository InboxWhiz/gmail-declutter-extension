import { Sender } from "../entities/sender";

/**
 * Repository interface for managing email operations.
 * Meant to provide a consistent API for interacting with email data,
 * interchangeable between using Gmail API and browser automation.
 */
export interface EmailRepo {
  /**
   * Fetches a list of all email senders along with their details.
   *
   * @returns A Promise that resolves to an array of Sender objects.
   */
  fetchSenders(): Promise<Sender[]>;

  /**
   * Deletes the specified senders by moving their emails to trash.
   *
   * @param senderEmailAddresses - An array of sender email addresses to be deleted.
   * @returns A Promise that resolves when the senders have been trashed.
   */
  deleteSenders(senderEmailAddresses: string[]): Promise<void>;

  /**
   * Attempts to unsubscribe the specified senders.
   *
   * @param senderEmailAddresses - An array of sender email addresses to be unsubscribed.
   * @returns A Promise that resolves to an array of failed email addresses.
   */
  unsubscribeSenders(senderEmailAddresses: string[]): Promise<string[]>;

  /**
   * Blocks the specified sender by their email address.
   * This creates a filter to automatically move emails from the sender to trash.
   *
   * @param senderEmailAddress - The email address of the sender to block.
   * @returns A promise that resolves when the sender has been blocked.
   */
  blockSender(senderEmailAddress: string): Promise<void>;
}
