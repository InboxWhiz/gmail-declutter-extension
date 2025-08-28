import { BrowserEmailService } from "../services/browser_email_service";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "FETCH_SENDERS") {
    (async () => {
      try {
        const senders = await BrowserEmailService.fetchSendersFromBrowser();
        const serialized = senders.map(sender => ({
          email: sender.email,
          names: Array.from(sender.names),  // convert Set -> array
          emailCount: sender.emailCount,
        }))
        sendResponse({ success: true, data: serialized });
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    })();
    return true; // Indicates that the message port will remain open for asynchronous response
  }
});

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