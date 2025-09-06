import { Sender } from "../../domain/entities/sender";
import { EmailRepo } from "../../domain/repositories/email_repo";
import { PortManager } from "../ports/port_manager";

export class BrowserEmailRepo implements EmailRepo {
  async fetchSenders(): Promise<Sender[]> {
    const port = PortManager.gmailPort;
    if (!port) return Promise.reject("Port not connected");

    // Send message
    port.postMessage({ action: "FETCH_SENDERS" });

    // Wait for response
    return await new Promise<Sender[]>((resolve, reject) => {
      const listener = (msg: any) => {
        if (msg.action === "FETCH_SENDERS_RESPONSE") {
          port.onMessage.removeListener(listener);

          if (msg.success) {
            const senders = msg.data as Sender[];
            senders.sort((a, b) => b.emailCount - a.emailCount);
            resolve(senders);
          } else {
            console.error(
              `Error fetching senders from content script: ${msg.error}`,
            );
            reject(new Error(msg.error));
          }
        }
      };
      port.onMessage.addListener(listener);
    });
  }

  async deleteSenders(senderEmailAddresses: string[]): Promise<void> {
    console.log("About to delete senders: ", senderEmailAddresses);
    return await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "DELETE_SENDERS",
              emails: senderEmailAddresses,
            },
            (response) => {
              console.log(`response to deleting: ${JSON.stringify(response)}`);
              resolve();
            },
          );
        } else {
          console.error("No active tab found.");
        }
      });
    });
  }

  async unsubscribeSenders(senderEmailAddresses: string[]): Promise<string[]> {
    return await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "UNSUBSCRIBE_SENDERS",
              emails: senderEmailAddresses,
            },
            (response) => {
              console.log(
                `response to unsubscribing: ${JSON.stringify(response)}`,
              );
              resolve(response.failures || []);
            },
          );
        } else {
          console.error("No active tab found.");
          resolve(senderEmailAddresses);
        }
      });
    });
  }

  async blockSender(senderEmailAddress: string): Promise<void> {
    return await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "BLOCK_SENDER",
              email: senderEmailAddress,
            },
            (response) => {
              console.log(`response to blocking: ${JSON.stringify(response)}`);
              resolve();
            },
          );
        } else {
          console.error("No active tab found.");
        }
      });
    });
  }
}
