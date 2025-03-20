chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchSenders") {
        fetchAllUnreadSenders();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "trashSenders" && Array.isArray(request.senders)) {
        trashMultipleSenders(request.senders)
            .then(() => {
                sendResponse({ status: "success" });
            })
            .catch((err) => {
                sendResponse({ status: "error", error: err.message });
            });

        return true; // This keeps the message channel open
    }
});

async function getOAuthToken(interactive = true) {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, token => {
            if (chrome.runtime.lastError || !token) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(token);
        });
    });
}

async function fetchAllUnreadSenders() {
    let token = await getOAuthToken();
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

async function trashMultipleSenders(senders) {
    const token = await getOAuthToken();
    for (const sender of senders) {
        await trashSender(token, sender);
    }
}

async function trashSender(token, senderEmail) {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Step 1: Search for messages
    const searchUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(senderEmail)}&maxResults=500`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    if (!searchData.messages || searchData.messages.length === 0) {
        console.log('No messages found.');
        return;
    } else {
        console.log(`Found ${searchData.messages.length} messages from ${senderEmail}`);
    }

    const messageIds = searchData.messages.map(msg => msg.id);

    // // Step 2: Move each message to Trash
    // for (const id of messageIds) {
    //     await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
    //         method: 'POST',
    //         headers
    //     });
    // }

    // console.log(`Deleted ${messageIds.length} emails from ${senderEmail}`);
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