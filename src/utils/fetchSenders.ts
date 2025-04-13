import { getOAuthToken } from "./auth";
import { parseSender, sleep } from "./utils";

export async function fetchAllSenders(): Promise<void> {
  const authToken = await getOAuthToken();
  const senders = {};

  let nextPageToken = null;
  const allMessageIds = [];

  try {
    // Fetch all message IDs
    do {
      const { messageIds, nextPage } = await fetchMessageIds(
        authToken,
        nextPageToken,
      );
      allMessageIds.push(...messageIds);
      nextPageToken = nextPage;
    } while (nextPageToken);
    console.log(
      `Fetched ${allMessageIds.length} email IDs. Getting senders...`,
    );

    // Process messages in batches of 40
    for (let i = 0; i < allMessageIds.length; i += 40) {
      const batchIds = allMessageIds.slice(i, i + 40);
      const batchSenders = await fetchMessageSendersBatch(authToken, batchIds);
      updateSenderCounts(batchSenders, senders);
    }

    console.log(
      `Fetched ${allMessageIds.length} emails. Found ${Object.keys(senders).length} unique senders.`,
    );

    storeSenders(senders);
  } catch (err) {
    console.error("Error fetching senders:", err);
  }
}

async function fetchMessageIds(
  token: chrome.identity.GetAuthTokenResult,
  pageToken: string | null,
): Promise<{ messageIds: string[]; nextPage: string | null }> {
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
    messageIds:
      data.messages?.map((m: gapi.client.gmail.Message) => m.id) || [],
    nextPage: data.nextPageToken || null,
  };
}

export async function fetchMessageSendersBatch(
  token: chrome.identity.GetAuthTokenResult,
  messageIds: string[],
): Promise<any[]> {
  return Promise.all(
    messageIds.map((id) => fetchMessageSenderSingle(token, id)),
  );
}

async function fetchMessageSenderSingle(
  token: chrome.identity.GetAuthTokenResult,
  messageId: string,
): Promise<any> {
  // Fetch message metadata
  const response = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
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
    (header: { name: string }) => header.name === "From",
  )?.value;
  return parseSender(sender);
}

function updateSenderCounts(
  sendersList: any[],
  allSenders: { [x: string]: { count: number; name: Set<any> } },
): void {
  sendersList.forEach((sender) => {
    if (allSenders[sender[0]]) {
      allSenders[sender[0]].count += 1;
      allSenders[sender[0]]["name"].add(sender[1]);
    } else {
      allSenders[sender[0]] = {
        count: 1,
        name: new Set([sender[1]]),
      };
    }
  });
}

function storeSenders(senders: {
  [s: string]: { name: Set<string>; count: number };
}) {
  // Parse and sort senders by email count
  const parsedSenders = Object.entries(senders)
    .map(([email, { name, count }]) => [
      email,
      Array.from(name).sort((a, b) => a.length - b.length)[0],
      count,
    ]) // Shortest name
    .sort((a, b) => Number(b[2]) - Number(a[2])); // Sort by count in descending order

  // Store in local storage
  chrome.storage.local.set({ senders: parsedSenders });
}

export const exportForTest = {
  fetchMessageIds,
  fetchMessageSenderSingle,
  updateSenderCounts,
  storeSenders,
};
