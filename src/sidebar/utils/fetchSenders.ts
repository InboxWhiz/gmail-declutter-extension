import { getOAuthToken } from "./auth";
import { parseSender, sleep } from "./utils";

interface SenderData {
  name: Set<string>;
  count: number;
  latestMessageId: string;
}

interface MessageData {
  senderEmail: string;
  senderName: string;
  messageId: string;
}

export async function fetchAllSenders(): Promise<void> {
  const authToken = await getOAuthToken();
  const senders: { [key: string]: SenderData } = {};

  let nextPageToken = null;
  const allMessageIds: string[] = [];
  let percentageComplete: number = 0;

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
      const batchSenders: MessageData[] = await fetchMessageSendersBatch(
        authToken,
        batchIds,
      );
      updateSenders(batchSenders, senders);

      // Send a message about progress
      percentageComplete += 40 / allMessageIds.length;
      chrome.storage.local.set({ fetchProgress: percentageComplete });
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
): Promise<MessageData[]> {
  return Promise.all(
    messageIds.map((id) => fetchMessageSenderSingle(token, id)),
  );
}

async function fetchMessageSenderSingle(
  token: chrome.identity.GetAuthTokenResult,
  messageId: string,
): Promise<MessageData> {
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

  // Handle 403 error
  if (response.status === 403) {
    console.warn("Error. Pausing...");
    await sleep(1000);
    return await fetchMessageSenderSingle(token, messageId); // Retry
  }

  // Extract sender from response
  const msgData = await response.json();
  const sender = msgData.payload?.headers?.find(
    (header: { name: string }) => header.name === "From",
  )?.value;

  // Parse the name and email from the sender
  const [email, name] = parseSender(sender);

  return { senderEmail: email, senderName: name, messageId };
}

function updateSenders(
  messageList: MessageData[],
  allSenders: { [x: string]: SenderData },
): void {
  messageList.forEach((message) => {
    if (allSenders[message.senderEmail]) {
      allSenders[message.senderEmail].count += 1;
      allSenders[message.senderEmail]["name"].add(message.senderName);
    } else {
      allSenders[message.senderEmail] = {
        count: 1,
        name: new Set([message.senderName]),
        latestMessageId: message.messageId,
      };
    }
  });
}

function storeSenders(senders: { [s: string]: SenderData }) {
  // Parse and sort senders by email count
  const parsedSenders = Object.entries(senders)
    .map(([email, { name, count, latestMessageId }]) => [
      email,
      Array.from(name).sort((a, b) => a.length - b.length)[0], // Shortest name
      count,
      latestMessageId,
    ])
    .sort((a, b) => Number(b[2]) - Number(a[2])); // Sort by count in descending order

  // Store in local storage
  chrome.storage.local.set({ senders: parsedSenders });
}

export const exportForTest = {
  fetchMessageIds,
  fetchMessageSenderSingle,
  updateSenders,
  storeSenders,
};
