import { getOAuthToken } from "./auth.js";
import { parseSender, sleep } from "./utils.js";

export async function fetchAllSenders() {
  const authToken = await getOAuthToken();
  const senders = {};

  let nextPageToken = null;
  let allMessageIds = [];

  try {
    // Fetch all message IDs
    do {
      const { messageIds, nextPage } = await fetchMessageIds(
        authToken,
        nextPageToken
      );
      allMessageIds.push(...messageIds);
      nextPageToken = nextPage;
    } while (nextPageToken);

    // Process messages in batches of 40
    for (let i = 0; i < allMessageIds.length; i += 40) {
      const batchIds = allMessageIds.slice(i, i + 40);
      const batchSenders = await fetchMessageSendersBatch(authToken, batchIds);
      updateSenderCounts(batchSenders, senders);
    }

    console.log(
      `Fetched ${allMessageIds.length} emails. Found ${Object.keys(senders).length} unique senders.`
    );

    storeSenders(senders);
  } catch (err) {
    console.error("Error fetching senders:", err);
  }
}

async function fetchMessageIds(token, pageToken) {
  let url =
    "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500";
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  // Fetch emails for the page
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Handle rate limiting
  if (response.status === 429) {
    console.warn("Rate limit exceeded. Retrying...");
    await sleep(1000);
    return fetchMessageIds(token, pageToken); // Retry
  }

  // Parse response
  const data = await response.json();
  return {
    messageIds: data.messages?.map((m) => m.id) || [],
    nextPage: data.nextPageToken || null,
  };
}

async function fetchMessageSendersBatch(token, messageIds) {
  return Promise.all(
    messageIds.map((id) => fetchMessageSenderSingle(token, id))
  );
}

async function fetchMessageSenderSingle(token, messageId) {
  // Fetch message metadata
  const response = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Handle rate limiting
  if (response.status === 429) {
    console.warn("Rate limit hit. Pausing...");
    await sleep(1000);
    return await fetchMessageSenderSingle(token, messageId); // Retry
  }

  // Extract sender from response
  const msgData = await response.json();
  const sender = msgData.payload?.headers?.find(
    (header) => header.name === "From"
  )?.value;
  return sender || "Unknown Sender";
}

function updateSenderCounts(sendersList, allSenders) {
  sendersList.forEach((sender) => {
    allSenders[sender] = (allSenders[sender] || 0) + 1;
  });
}

function storeSenders(senders) {
  // Parse and sort senders by email count
  const parsedSenders = Object.entries(senders)
    .map(([sender, count]) => parseSender([sender, count]))
    .sort((a, b) => b[2] - a[2]);

  // Store in local storage
  chrome.storage.local.set({ senders: parsedSenders });
}

export const exportForTest = {
  fetchMessageIds,
  fetchMessageSenderSingle,
  updateSenderCounts,
  storeSenders,
};
