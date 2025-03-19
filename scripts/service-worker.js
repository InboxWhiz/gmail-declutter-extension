// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Extension installed, loading email senders...");
//     chrome.identity.getAuthToken({ interactive: true }, (token) => {
//         if (token) {
//             fetchAllUnreadSenders(token);
//         }
//     });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchSenders") {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (token) {
                fetchAllUnreadSenders(token);
            }
        });
    }
});

async function fetchAllUnreadSenders(token) {
    let senders = {};
    let nextPageToken = null;
    let totalFetched = 0;

    try {
        do {
            let url = "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=is:unread";
            if (nextPageToken) {
                url += `&pageToken=${nextPageToken}`;
            }

            // Fetch unread emails for the page
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            // Handle rate limiting
            if (response.status === 429) {
                console.warn("Rate limit exceeded. Retrying...");
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
                continue;
            }

            let data = await response.json();
            if (!data.messages) break;

            let messageIds = data.messages.map(msg => msg.id);
            totalFetched += messageIds.length;
            nextPageToken = data.nextPageToken || null; // Set the next page token

            // Process messages in batches of 40
            for (let i = 0; i < messageIds.length; i += 40) {
                let batchIds = messageIds.slice(i, i + 40);

                // Fetch senders for each batch
                let batchResponses = await Promise.all(batchIds.map(async (id) => {
                    const msgResponse = await fetch(
                        `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    if (msgResponse.status === 429) {
                        console.warn("Rate limit hit. Pausing...");
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
                        return null;
                    }

                    return msgResponse.json();
                }));

                // Update sender counts
                batchResponses.forEach(msgData => {
                    if (msgData && msgData.payload && msgData.payload.headers) {
                        const fromHeader = msgData.payload.headers.find(header => header.name === "From");
                        if (fromHeader) {
                            const sender = fromHeader.value;
                            senders[sender] = (senders[sender] || 0) + 1;
                        }
                    }
                });

            }

            console.log(`Fetched ${messageIds.length} emails, total fetched: ${totalFetched}`);

        } while (nextPageToken); // Continue until all emails are fetched

        console.log(`Fetched a total of ${totalFetched} unread emails.`);

        // Parse and sort senders
        const parsedSenders = Object.entries(senders)
            .map(([sender, count]) => parseSender([sender, count]))
            .sort((a, b) => b[2] - a[2])

        // Store in local storage
        chrome.storage.local.set({ senders: parsedSenders });

    } catch (error) {
        console.error("Error fetching unread emails:", error);
    }
}

function parseSender(sender) {
    try {
        var name, email;
        if (sender[0].includes('<')) {
            name = sender[0].split('<')[0].trim();
            email = sender[0].split('<')[1].trim().slice(0, -1);
        } else {
            name = sender[0].split('@')[0].trim();
            email = sender[0];
        }
        const emailCount = sender[1];

        return [email, name, emailCount];
    } catch (error) {
        console.error("Error parsing sender:", sender, error);
    }
}