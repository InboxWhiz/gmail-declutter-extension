export interface PageInteractionRepo {
  /**
   * Retrieves the Gmail account associated with the currently active browser tab.
   *
   * @returns {Promise<string>} A promise that resolves to the email address string.
   * @throws Will reject the promise if there is no active tab or if a messaging error occurs.
   */
  getActiveTabEmailAccount(): Promise<string>;

  /**
   * Invokes a search for emails from the specified sender email addresses in the currently active Gmail tab.
   *
   * @param senderEmailAddresses - An array of sender email addresses to search for in Gmail.
   */
  searchEmailSenders(emails: string[]): void;
}
