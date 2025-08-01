/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ManualUnsubscribeData, Sender } from "../../types/types";

export interface Actions {
  /**
   * Determines whether the user is has a valid OAuth token stored for their email address.
   *
   * @param getEmailAccount - Optional function to retrieve the current Gmail account email address.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user is logged in
   * and using the correct account, or `false` otherwise.
   */
  isLoggedIn(getEmailAccount?: () => Promise<string>): Promise<boolean>;

  /**
   * Initiates the Google sign-in process for the specified email address.
   * This function forces interactive authentication by removing any old token from the cache.
   *
   * @param expectedEmailAddress - The email address that the authenticated user is expected to have.
   * @param deps - Optional dependency overrides for testing.
   * @throws {Error} If the authenticated user's email does not match the expected email address.
   */
  signInWithGoogle(expectedEmailAddress: string): Promise<void>;

  /**
   * Retrieves the Gmail account associated with the currently active browser tab.
   *
   * @returns {Promise<string>} A promise that resolves to the email address string.
   * @throws Will reject the promise if there is no active tab or if a messaging error occurs.
   */
  getEmailAccount(): Promise<string>;

  /**
   * Invokes a search for emails from the specified sender email addresses in the currently active Gmail tab.
   *
   * This method queries the active tab in the current window and sends a message to the content script
   * with the type "SEARCH_EMAIL_SENDERS" and the provided list of sender email addresses.
   *
   * @param senderEmailAddresses - An array of sender email addresses to search for in Gmail.
   */
  searchEmailSenders(emails: string[]): void;

  /**
   * Deletes the specified senders by moving their emails to trash using the Gmail API,
   * and then removes the corresponding senders from local storage.
   *
   * @param senderEmailAddresses - An array of sender email addresses to be deleted.
   * @param getEmailAccount - Optional function to retrieve the current Gmail account email address.
   * @returns A Promise that resolves when the senders have been trashed and removed from local storage.
   */
  deleteSenders(
    senderEmailAddresses: string[],
    getEmailAccount?: () => Promise<string>,
  ): Promise<void>;

  /**
   * Retrieves all senders from local storage, optionally fetching new data from the server.
   *
   * If `fetchNew` is true, the function will fetch the latest senders from the server before retrieving them from local storage.
   * If the "senders" key does not exist in local storage, it will attempt to fetch and store them, then retry retrieval.
   * Filters out senders whose email addresses end with "@gmail.com".
   *
   * @param fetchNew - Whether to fetch new senders from the server before retrieving from local storage. Defaults to `false`.
   * @param getEmailAccount - Optional function to retrieve the current Gmail account email address.
   * @returns A promise that resolves to an array of `Sender` objects.
   * @throws If there is an error accessing Chrome's storage API.
   */
  getAllSenders(
    fetchNew?: boolean,
    getEmailAccount?: () => Promise<string>,
  ): Promise<Sender[]>;

  /**
   * Retrieves the current fetch progress from Chrome's local storage and invokes the provided callback with the progress value.
   *
   * @param setProgressCallback - A callback function that receives the current progress as a number (decimals 0-1).
   * @param getEmailAccount - Optional function to retrieve the current Gmail account email address.
   * @returns A promise that resolves to the current fetch progress value. If no progress is found, resolves to 0.
   */
  checkFetchProgress(
    setProgressCallback: (progress: number) => void,
    getEmailAccount?: () => Promise<string>,
  ): Promise<number>;

  /**
   * Attempts to automatically unsubscribe from the given list of email addresses.
   *
   * This function reads the last email message from each sender and tries to perform an automatic unsubscribe action.
   * If an automatic unsubscribe is not possible (e.g., only a click URL is available or no unsubscribe
   * information is found at all), the sender is added to the appropriate result list for further handling.
   *
   * @param senderEmailAddresses - An array of sender email addresses to attempt to unsubscribe from.
   * @param deps - Optional dependency overrides for testing.
   * @returns A promise that resolves to a `ManualUnsubscribeData` object containing:
   *   - `linkOnlySenders`: An array of tuples with sender email and click URL for senders that require manual action.
   *   - `noUnsubscribeOptionSenders`: An array of sender emails for which no unsubscribe method was found.
   */
  unsubscribeSendersAuto(
    senderEmailAddresses: string[],
    deps?: {
      getEmailAccount?: Function;
      getLatestMessageIds?: Function;
      getMultipleUnsubscribeData?: Function;
      unsubscribeUsingMailTo?: Function;
      unsubscribeUsingPostUrl?: Function;
    },
  ): Promise<ManualUnsubscribeData>;

  /**
   * Blocks the specified sender by their email address using the Gmail API.
   * This creates a filter to automatically move emails from the sender to trash.
   *
   * @param senderEmailAddress - The email address of the sender to block.
   * @returns A promise that resolves when the sender has been blocked.
   */
  blockSender(senderEmailAddress: string): Promise<void>;
}
