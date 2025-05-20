import { getValidToken } from "./googleAuth";
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

/**
 * Fetches all unique email senders for a given Gmail account and counts their number of messages
 * The resulting sender data is stored for the specified account, in Chrome's local storage.
 *
 * @param accountEmail - The email address of the account for which senders are being fetched.
 * @returns A Promise that resolves when all senders have been fetched and stored.
 *
 * @remarks
 * - Progress is tracked and updated in Chrome's local storage under the key `fetchProgress`,
 * with the account email as the sub-key.
 * - Sender data is stored in Chrome's local storage using the `storeSenders` utility.
 */
export async function fetchAllSenders(accountEmail: string): Promise<void> {
  const authToken = await getValidToken(accountEmail);
  const senders: { [key: string]: SenderData } = {};
  let percentageComplete: number = 0;

  try {
    const allMessageIds = await fetchAllMessageIds(authToken);

    // Process messages in batches of 40
    for (let i = 0; i < allMessageIds.length; i += 40) {
      const batchIds = allMessageIds.slice(i, i + 40);
      const batchSenders: MessageData[] = await fetchMessageSendersBatch(
        authToken,
        batchIds
      );
      updateSenders(batchSenders, senders);

      // Send a message about progress
      percentageComplete += 40 / allMessageIds.length;
      chrome.storage.local.set({
        fetchProgress: { [accountEmail]: percentageComplete },
      });
    }

    console.log(
      `Fetched ${allMessageIds.length} emails. Found ${Object.keys(senders).length} unique senders.`
    );

    storeSenders(senders, accountEmail);
  } catch (err) {
    console.error("Error fetching senders:", err);
  }
}

/**
 * Fetches all message IDs from the user's mailbox by iteratively retrieving paginated results.
 *
 * @param authToken - The authentication token used to authorize API requests.
 * @returns A promise that resolves to an array of all message IDs as strings.
 */
async function fetchAllMessageIds(
  authToken: string,
  fetchPage = fetchMessageIdsPage
): Promise<string[]> {
  let nextPageToken = null;
  const allMessageIds: string[] = [];

  do {
    const { messageIds, nextPage } = await fetchPage(authToken, nextPageToken);
    allMessageIds.push(...messageIds);
    nextPageToken = nextPage;
  } while (nextPageToken);

  console.log(`Fetched ${allMessageIds.length} email IDs.`);
  return allMessageIds;
}

/**
 * Fetches a list of message IDs from the user's mailbox for a given page, handling rate limiting.
 *
 * @param token - The OAuth 2.0 access token used for authenticating the request.
 * @param pageToken - The token for the results page to retrieve, or `null` to fetch the first page.
 * @returns A promise that resolves to an object containing an array of message IDs and the next page token (or `null` if there are no more pages).
 *
 * @remarks
 * If the Gmail API rate limit is exceeded (HTTP 429), the function waits for 1 second and retries the request.
 */
async function fetchMessageIdsPage(
  token: string,
  pageToken: string | null
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
    return fetchMessageIdsPage(token, pageToken); // Retry
  }

  // Parse response
  const data = await response.json();
  return {
    messageIds:
      data.messages?.map((m: gapi.client.gmail.Message) => m.id) || [],
    nextPage: data.nextPageToken || null,
  };
}

/**
 * Fetches sender information for a batch of Gmail message IDs.
 *
 * @param token - The OAuth token used for authenticating Gmail API requests.
 * @param messageIds - An array of Gmail message IDs to fetch sender information for.
 * @returns A Promise that resolves to an array of `MessageData` objects, each containing
 *          sender information for the corresponding message ID.
 */
async function fetchMessageSendersBatch(
  token: string,
  messageIds: string[]
): Promise<MessageData[]> {
  return Promise.all(
    messageIds.map((id) => fetchMessageSenderSingle(token, id))
  );
}

/**
 * Fetches the sender's email and name for a single Gmail message using the Gmail API.
 *
 * @param token - The OAuth 2.0 access token for authenticating with the Gmail API.
 * @param messageId - The unique identifier of the Gmail message to fetch.
 * @returns A promise that resolves to a `MessageData` object containing the sender's email, name, and message ID.
 */
async function fetchMessageSenderSingle(
  token: string,
  messageId: string
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
    }
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
    (header: { name: string }) => header.name === "From"
  )?.value;

  // Parse the name and email from the sender
  const [email, name] = parseSender(sender);

  return { senderEmail: email, senderName: name, messageId };
}

/**
 * Updates the `allSenders` object with sender information from the provided list of messages.
 *
 * For each message in `messageList`, this function increments the sender's message count,
 * adds the sender's name to a set of names associated with the sender's email, and sets
 * the latest message ID if the sender is new.
 *
 * @param messageList - An array of message data objects containing sender information.
 * @param allSenders - An object mapping sender email addresses to their aggregated sender data.
 */
function updateSenders(
  messageList: MessageData[],
  allSenders: { [x: string]: SenderData }
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

/**
 * Stores a list of senders for a specific account in Chrome's local storage.
 *
 * @param senders - An object mapping sender email addresses to their corresponding SenderData.
 * @param accountEmail - The email address of the account to associate the stored senders with.
 */
function storeSenders(
  senders: { [s: string]: SenderData },
  accountEmail: string
): void {
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
  chrome.storage.local.set({ [accountEmail]: { senders: parsedSenders } });
}

export const exportForTest = {
  fetchAllMessageIds,
  fetchMessageIdsPage,
  fetchMessageSenderSingle,
  updateSenders,
  storeSenders,
};
