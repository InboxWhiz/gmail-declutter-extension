import { BrowserEmailRepo } from "../repositories/browser_email_repo";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "FETCH_SENDERS") {
    (async () => {
      try {
        const browserEmailRepo = new BrowserEmailRepo();
        const senders = await browserEmailRepo.fetchSenders();
        const serialized = senders.map(sender => ({
          email: sender.email,
          names: Array.from(sender.names),  // convert Set -> array
          emailCount: sender.emailCount,
        }))
        sendResponse({ success: true, data: serialized });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});