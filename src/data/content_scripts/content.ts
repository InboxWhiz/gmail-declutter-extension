import { BrowserEmailService } from "../services/browser_email_service";
import { PageInteractionService } from "../services/page_interaction_service";

// Establish connection with the side panel
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "gmail-port");
  port.postMessage({ message: "Content script connected" });

  port.onMessage.addListener(function (msg) {
    console.log("sidepanel said: ", msg);

    if (msg.action === "FETCH_SENDERS") {
      fetchSenders(port);
    } else if (msg.action === "DELETE_SENDERS") {
      deleteSenders(port, msg.emails);
    } else if (msg.action === "UNSUBSCRIBE_SENDERS") {
      unsubscribeSenders(port, msg.emails);
    } else if (msg.action === "BLOCK_SENDER") {
      blockSender(port, msg.email);
    }
  });
});

async function fetchSenders(port: chrome.runtime.Port) {
  try {
    const senders = await BrowserEmailService.fetchSendersFromBrowser();
    const serialized = senders.map((sender) => ({
      email: sender.email,
      names: Array.from(sender.names), // convert Set -> array
      emailCount: sender.emailCount,
    }));
    port.postMessage({
      action: "FETCH_SENDERS_RESPONSE",
      success: true,
      data: serialized,
    });
  } catch (error) {
    port.postMessage({
      action: "FETCH_SENDERS_RESPONSE",
      success: false,
      error: (error as Error).message,
    });
  }
}

async function deleteSenders(port: chrome.runtime.Port, emails: string[]) {
  try {
    await BrowserEmailService.deleteSendersFromBrowser(emails);
    port.postMessage({
      action: "DELETE_SENDERS_RESPONSE",
      success: true,
    });
  } catch (error) {
    port.postMessage({
      action: "DELETE_SENDERS_RESPONSE",
      success: false,
      error: (error as Error).message,
    });
  }
}

async function unsubscribeSenders(port: chrome.runtime.Port, emails: string[]) {
  try {
    const failures =
      await BrowserEmailService.unsubscribeSendersFromBrowser(emails);
    if (failures.length > 0) {
      port.postMessage({
        action: "UNSUBSCRIBE_SENDERS_RESPONSE",
        success: false,
        failures,
      });
    } else {
      port.postMessage({
        action: "UNSUBSCRIBE_SENDERS_RESPONSE",
        success: true,
      });
    }
  } catch (error) {
    port.postMessage({
      action: "UNSUBSCRIBE_SENDERS_RESPONSE",
      success: false,
      error: (error as Error).message,
    });
  }
}

async function blockSender(port: chrome.runtime.Port, email: string) {
  try {
    await BrowserEmailService.blockSenderFromBrowser(email);
    port.postMessage({
      action: "BLOCK_SENDER_RESPONSE",
      success: true,
    });
  } catch (error) {
    port.postMessage({
      action: "BLOCK_SENDER_RESPONSE",
      success: false,
      error: (error as Error).message,
    });
  }
}

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
    PageInteractionService.searchEmailSenders(message.emails);
  }
});

// Show tutorial
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "SHOW_TUTORIAL") {
    PageInteractionService.displayTutorial();
  }
});

// Close tutorial
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "CLOSE_TUTORIAL") {
    PageInteractionService.closeTutorial();
  }
});
