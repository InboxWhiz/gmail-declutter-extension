import { getOAuthToken } from "./auth";

export async function trashMultipleSenders(
  senders: string[],
  trashSenderFunc = trashSender,
) {
  let totalEmailsTrashed: number = 0;
  const token: chrome.identity.GetAuthTokenResult = await getOAuthToken();
  for (const sender of senders) {
    totalEmailsTrashed += await trashSenderFunc(token, sender);
  }
  return totalEmailsTrashed;
}

async function trashSender(
  token: chrome.identity.GetAuthTokenResult,
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
