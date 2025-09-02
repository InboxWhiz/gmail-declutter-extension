import { Sender } from "../entities/sender";

export interface StorageRepo {
  /**
   * Stores a list of senders for a specific account.
   *
   * @param senders - An object mapping sender email addresses to their corresponding SenderData.
   * @param accountEmail - The email address of the account to associate the stored senders with.
   */
  storeSenders(senders: Sender[], accountEmail: string): Promise<void>;

  /**
   * Retrieves a list of senders for a specific account.
   *
   * @param accountEmail - The email address of the account to retrieve the stored senders for.
   */
  readSenders(accountEmail: string): Promise<Sender[]>;

  /**
   * Deletes a list of senders for a specific account.
   *
   * @param senderEmails - An array of email addresses of the senders to delete.
   * @param accountEmail - The email address of the account to associate the deletion with.
   */
  deleteSenders(senderEmails: string[], accountEmail: string): Promise<void>;
}
