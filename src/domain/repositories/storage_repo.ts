import { Sender } from "../entities/sender";

export interface StorageRepo {
    /**
     * Stores a list of senders for a specific account.
     *
     * @param senders - An object mapping sender email addresses to their corresponding SenderData.
     * @param accountEmail - The email address of the account to associate the stored senders with.
     */
    storeSenders(
        senders: Sender[],
        accountEmail: string,
    ): void
}