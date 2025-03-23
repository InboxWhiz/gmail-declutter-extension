import { getOAuthToken } from "./auth.js";
import { parseSender, sleep } from "./utils.js";

export async function fetchAllSenders() {
  const token = await getOAuthToken();
  const senders = {};
  let nextPageToken = null;
  let totalFetched = 0;

  try {
    do {
      let url =
        "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500";
      if (nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
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
        continue;
      }

      const data = await response.json();
      if (!data.messages) break;

      const messageIds = data.messages.map((m) => m.id);
      totalFetched += messageIds.length;
      nextPageToken = data.nextPageToken || null;

      // Process messages in batches of 40
      for (let i = 0; i < messageIds.length; i += 40) {
        const batchIds = messageIds.slice(i, i + 40);

        // Fetch senders for each batch
        const batchResponses = await Promise.all(
          batchIds.map(async (id) => {
            const msgResponse = await fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            if (msgResponse.status === 429) {
              console.warn("Rate limit hit. Pausing...");
              await sleep(1000);
              return null;
            }

            return msgResponse.json();
          }),
        );

        // Update sender counts
        batchResponses.forEach((msgData) => {
          if (msgData && msgData.payload && msgData.payload.headers) {
            const fromHeader = msgData.payload.headers.find(
              (header) => header.name === "From",
            );
            if (fromHeader) {
              const sender = fromHeader.value;
              senders[sender] = (senders[sender] || 0) + 1;
            }
          }
        });
      }

      console.log(
        `Fetched ${messageIds.length} emails, total fetched: ${totalFetched}`,
      );
    } while (nextPageToken);

    // Parse and sort senders
    const parsedSenders = Object.entries(senders)
      .map(([sender, count]) => parseSender([sender, count]))
      .sort((a, b) => b[2] - a[2]);

    // Store in local storage
    chrome.storage.local.set({ senders: parsedSenders });
  } catch (err) {
    console.error("Error fetching senders:", err);
  }
}
