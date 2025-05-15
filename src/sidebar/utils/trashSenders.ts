import { getValidToken } from "../../_shared/utils/googleAuth";

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
  token: string,
  senderEmail: string,
) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Step 1: Search for messages
  const searchUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(senderEmail)}&maxResults=500`;
  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await searchRes.json();

  if (!searchData.messages || searchData.messages.length === 0) {
    console.log("No messages found.");
    return 0; // To indicate no emails were found;
  } else {
    console.log(
      `Found ${searchData.messages.length} messages from ${senderEmail}`,
    );
  }

  const messageIds = searchData.messages.map(
    (msg: gapi.client.gmail.Message) => msg.id,
  );

  // Step 2: Move each message to Trash
  for (const id of messageIds) {
    await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
      {
        method: "POST",
        headers,
      },
    );
  }

  console.log(`Deleted ${messageIds.length} emails from ${senderEmail}`);
  return messageIds.length; // Return the number of emails trashed
}

export const exportForTest = { trashSender };
