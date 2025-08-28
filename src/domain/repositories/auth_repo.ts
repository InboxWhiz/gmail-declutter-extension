export interface AuthRepo {
    /**
     * Retrieves the Gmail account associated with the currently active browser tab.
     *
     * @returns {Promise<string>} A promise that resolves to the email address string.
     * @throws Will reject the promise if there is no active tab or if a messaging error occurs.
     */
    getActiveTabEmailAccount(): Promise<string>;
}