import { fetchAllSenders } from "./fetch-senders.js";
import { trashMultipleSenders } from "./trash-senders.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchSenders") {
    fetchAllSenders();
  }

  if (message.action === "trashSenders" && Array.isArray(message.senders)) {
    trashMultipleSenders(message.senders)
      .then(() => sendResponse({ status: "success" }))
      .catch((err) => sendResponse({ status: "error", error: err.message }));

    return true; // Keep channel open
  }
});
