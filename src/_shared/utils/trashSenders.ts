import { getValidToken } from "./chromeAuth";
import { fetchMessageIds } from "./fetchMessageIds";

/**
 * Trashes emails from multiple senders.
 *
 * @param senders - An array of sender email addresses whose emails should be trashed.
 * @param accountEmail - The email address of the user wanting to trash the emails.
 * @param trashSenderFunc - (Optional) A function to trash emails from a single sender. Defaults to `trashSender`.
 * @returns The total number of emails trashed across all specified senders.
 */
export async function trashMultipleSenders(
  senders: string[],
  accountEmail: string,
  trashSenderFunc = trashSender,
) {
  let totalEmailsTrashed = 0;
  const token = await getValidToken(accountEmail);
  for (const sender of senders) {
    totalEmailsTrashed += await trashSenderFunc(token, sender);
  }
  return totalEmailsTrashed;
}

/**
 * Moves all emails from a specified sender to the Trash in the user's Gmail account.
 *
 * @param token - The OAuth 2.0 access token for authenticating with the Gmail API.
 * @param senderEmail - The email address of the sender whose messages should be trashed.
 * @returns A promise that resolves to the number of emails moved to Trash.
 *
 * @remarks
 * - Searches for up to 500 messages from the specified sender.
 * - Each found message is moved to the Trash using the Gmail API.
 * - If no messages are found, returns 0.
 */
async function trashSender(
  token: chrome.identity.GetAuthTokenResult,
  senderEmail: string,
): Promise<number> {
  // Step 1: Get all message IDs of the sender
  const messageIds = await fetchMessageIds(token, senderEmail);
  if (messageIds.length === 0) return 0; // No emails to trash

  // Step 2: Move each message to Trash
  for (const id of messageIds) {
    await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }

  console.log(`Deleted ${messageIds.length} emails from ${senderEmail}`);
  return messageIds.length; // Return the number of emails trashed
}

export const exportForTest = { trashSender };
