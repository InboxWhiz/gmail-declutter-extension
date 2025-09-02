import { BrowserEmailService } from "../services/browser_email_service";
import { PageInteractionService } from "../services/page_interaction_service";

// Fetch senders
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "FETCH_SENDERS") {
    (async () => {
      try {
        const senders = await BrowserEmailService.fetchSendersFromBrowser();
        const serialized = senders.map((sender) => ({
          email: sender.email,
          names: Array.from(sender.names), // convert Set -> array
          emailCount: sender.emailCount,
        }));
        sendResponse({ success: true, data: serialized });
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});

// Delete senders
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "DELETE_SENDERS") {
    (async () => {
      try {
        await BrowserEmailService.deleteSendersFromBrowser(message.emails);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});

// Unsubscribe senders
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "UNSUBSCRIBE_SENDERS") {
    (async () => {
      try {
        const failures =
          await BrowserEmailService.unsubscribeSendersFromBrowser(
            message.emails,
          );
        if (failures.length > 0) {
          sendResponse({ success: false, failures });
        } else {
          sendResponse({ success: true });
        }
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});

// Block sender
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "BLOCK_SENDER") {
    (async () => {
      try {
        await BrowserEmailService.blockSenderFromBrowser(message.email);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});

// Get email account
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "GET_EMAIL_ACCOUNT") {
    const value = PageInteractionService.getActiveTabEmailAccount();
    sendResponse({ result: value });
  }
});

// Search email senders
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SEARCH_EMAIL_SENDERS") {
    console.log("Received message to search email senders:", message.emails);
    PageInteractionService.searchEmailSenders(message.emails);
  }
});

// Show tutorial
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "SHOW_TUTORIAL") {
    console.log("Received message to show tutorial");
    PageInteractionService.displayTutorial();
  }
});

// Close tutorial
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "CLOSE_TUTORIAL") {
    console.log("Received message to close tutorial");
    PageInteractionService.closeTutorial();
  }
});
