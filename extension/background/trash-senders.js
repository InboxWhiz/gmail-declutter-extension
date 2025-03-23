import { getOAuthToken } from "./auth.js";

export async function trashMultipleSenders(senders) {
  const token = await getOAuthToken();
  for (const sender of senders) {
    await trashSender(token, sender);
  }
}

async function trashSender(token, senderEmail) {
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
    return;
  } else {
    console.log(
      `Found ${searchData.messages.length} messages from ${senderEmail}`,
    );
  }

  const messageIds = searchData.messages.map((msg) => msg.id);

  // Step 2: Move each message to Trash
  for (const id of messageIds) {
    await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
      {
        method: "POST",
        headers,
      },
    );
  }

  console.log(`Deleted ${messageIds.length} emails from ${senderEmail}`);
}
