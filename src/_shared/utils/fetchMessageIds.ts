import { sleep } from "./utils";

/**
 * Fetches all message IDs from the user's mailbox by iteratively retrieving paginated results.
 *
 * @param token - The authentication token used for authorizing the Gmail API request.
 * @param senderEmail - Optional parameter: The email address of the sender whose messages are to be retrieved.
 * @param deps - Optional dependency overrides for testing.
 * @returns A promise that resolves to an array of message IDs (as strings).
 */
export async function fetchMessageIds(
  token: chrome.identity.GetAuthTokenResult,
  senderEmail?: string,
  deps?: {
    fetchMessageIdsPage?: () => Promise<{
      messageIds: string[];
      nextPage: string | null;
    }>;
  },
): Promise<string[]> {
  const { fetchMessageIdsPage: _fetchMessageIdsPage = fetchMessageIdsPage } =
    deps || {};

  let nextPageToken = null;
  const allMessageIds: string[] = [];

  do {
    const { messageIds, nextPage } = await _fetchMessageIdsPage(
      token,
      nextPageToken,
      senderEmail,
    );
    allMessageIds.push(...messageIds);
    nextPageToken = nextPage;
  } while (nextPageToken);

  console.log(`Fetched ${allMessageIds.length} email IDs.`);
  return allMessageIds;
}

/**
 * Fetches a list of message IDs sent by a specific sender for a given page, handling rate limiting.
 *
 * @param token - The OAuth 2.0 access token used for authenticating the request.
 * @param pageToken - The token for the results page to retrieve, or `null` to fetch the first page.
 * @param senderEmail - Optional parameter: The email address of the sender whose messages are to be searched.
 * @returns A promise that resolves to an object containing an array of message IDs and the next page token (or `null` if there are no more pages).
 *
 * @remarks
 * If the Gmail API rate limit is exceeded (HTTP 429), the function waits for 1 second and retries the request.
 */
async function fetchMessageIdsPage(
  token: chrome.identity.GetAuthTokenResult,
  pageToken: string | null,
  senderEmail?: string,
): Promise<{ messageIds: string[]; nextPage: string | null }> {
  // Construct the URL with the sender's email and pagination token
  let url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500`;
  if (senderEmail) {
    url += `&q=from:${encodeURIComponent(senderEmail)}`;
  }
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
    return fetchMessageIdsPage(token, pageToken, senderEmail); // Retry
  }

  const data = await response.json();
  console.log(`Found ${data.messages.length} messages from ${senderEmail}`);

  // Parse response
  return {
    messageIds: data.messages.map((m: gapi.client.gmail.Message) => m.id) || [],
    nextPage: data.nextPageToken || null,
  };
}

export const exportForTest = {
  fetchMessageIdsPage,
};
