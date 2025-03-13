// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Extension installed, requesting Gmail authentication...");
//     authenticateUser();
// });

// function authenticateUser() {
//     chrome.identity.getAuthToken({ interactive: true }, (token) => {
//         if (chrome.runtime.lastError) {
//             console.error("Auth error:", chrome.runtime.lastError);
//             return;
//         }
//         return token;
//     });
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "fetchTopSenders") {
//         chrome.identity.getAuthToken({ interactive: true }, (token) => {
//             if (token) {
//                 fetchAllUnreadEmails(token);
//             }
//         });
//     }
// });

// async function fetchAllUnreadEmails(token) {
//     let senderCounts = {};
//     let nextPageToken = null;
//     let totalFetched = 0;

//     try {
//         do {
//             let url = "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=is:unread";
//             if (nextPageToken) {
//                 url += `&pageToken=${nextPageToken}`;
//             }

//             // Fetch unread emails for the page
//             let response = await fetch(url, {
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 }
//             });

//             // Handle rate limiting
//             if (response.status === 429) {
//                 console.warn("Rate limit exceeded. Retrying...");
//                 await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
//                 continue;
//             }

//             let data = await response.json();
//             if (!data.messages) break;

//             let messageIds = data.messages.map(msg => msg.id);
//             totalFetched += messageIds.length;
//             nextPageToken = data.nextPageToken || null; // Set the next page token

//             // Process messages in batches of 10
//             for (let i = 0; i < messageIds.length; i += 10) {
//                 let batchIds = messageIds.slice(i, i + 10);

//                 // Fetch senders for each batch
//                 let batchResponses = await Promise.all(batchIds.map(async (id) => {
//                     const msgResponse = await fetch(
//                         `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From`,
//                         {
//                             method: "GET",
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                                 "Content-Type": "application/json"
//                             }
//                         }
//                     );

//                     if (msgResponse.status === 429) {
//                         console.warn("Rate limit hit. Pausing...");
//                         await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
//                         return null;
//                     }

//                     return msgResponse.json();
//                 }));

//                 // Update sender counts
//                 batchResponses.forEach(msgData => {
//                     if (msgData && msgData.payload && msgData.payload.headers) {
//                         const fromHeader = msgData.payload.headers.find(header => header.name === "From");
//                         if (fromHeader) {
//                             const sender = fromHeader.value;
//                             senderCounts[sender] = (senderCounts[sender] || 0) + 1;
//                         }
//                     }
//                 });

//             }

//             // Sort top senders
//             const sortedSenders = Object.entries(senderCounts)
//                 .sort((a, b) => b[1] - a[1])
//                 .slice(0, 10);

//             // Send updated sender counts to content script
//             chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//                 if (tabs.length > 0) {
//                     chrome.tabs.sendMessage(tabs[0].id, { action: "updateSenderCounts", senders: sortedSenders });
//                 }
//             });

//             console.log(`Fetched ${messageIds.length} emails, total fetched: ${totalFetched}`);

//         } while (nextPageToken); // Continue until all emails are fetched

//         console.log(`Fetched a total of ${totalFetched} unread emails.`);
        
//         // // Sort top senders
//         // const sortedSenders = Object.entries(senderCounts)
//         //     .sort((a, b) => b[1] - a[1])
//         //     .slice(0, 10);

//         console.log("Top senders:", sortedSenders);

//         // // Send results to content script
//         // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         //     if (tabs.length > 0) {
//         //         chrome.tabs.sendMessage(tabs[0].id, { action: "displayTopSenders", senders: sortedSenders });
//         //     }
//         // });

//     } catch (error) {
//         console.error("Error fetching unread emails:", error);
//     }
// }

// async function fetchGmailMessagesBatch() {
//     chrome.identity.getAuthToken({ interactive: true }, async (token) => {
//         if (chrome.runtime.lastError) {
//             console.error("Auth error:", chrome.runtime.lastError);
//             return;
//         }

//         try {
//             const response = await fetch(
//                 "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=300&q=is:unread",
//                 {
//                     method: "GET",
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json"
//                     }
//                 }
//             );
//             const data = await response.json();

//             if (data.messages) {
//                 console.log("Messages:", data.messages.length);

//                 const topSenders = await getTopSenders(data.messages, token);
//                 console.log("Top senders:", topSenders);
//             } else {
//                 console.log("No messages found.");
//             }
//         } catch (error) {
//             console.error("Error fetching messages:", error);
//         }
//     });
// }

// async function getTopSenders(messages, token) {
//     const senderCounts = {};

//     // Get all senders asynchronously
//     const senderPromises = messages.map(msg =>
//         getMessageSender(token, msg.id).then(sender => {
//             senderCounts[sender] = (senderCounts[sender] || 0) + 1;
//         })
//     );

//     await Promise.all(senderPromises); // Wait for all sender fetches

//     return Object.entries(senderCounts)
//         .sort((a, b) => b[1] - a[1]) // Sort senders by count
//         .slice(0, 5); // Take the top 5 senders
// }


// function getMessageSender(token, messageId) {
//     return fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (!data || !data.payload || !data.payload.headers) {
//             console.warn("Skipping message due to missing data", data);
//             return "Unknown Sender";
//         }
//         const sender = data.payload.headers.find(header => header.name === "From");
//         return sender ? sender.value : "Unknown Sender";
//     })
//     .catch(error => {
//         console.error("Error fetching sender info:", error);
//         return "Unknown Sender";
//     });
// }