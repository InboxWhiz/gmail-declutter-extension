import { PageInteractionService } from "../services/page_interaction_service";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "GET_EMAIL_ACCOUNT") {
    const value = PageInteractionService.getActiveTabEmailAccount();
    sendResponse({ result: value });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SEARCH_EMAIL_SENDERS") {
    console.log("Received message to search email senders:", message.emails);
    PageInteractionService.searchEmailSenders(message.emails);
  }
});