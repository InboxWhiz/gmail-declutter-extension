import { Sender } from "../../domain/entities/sender";
import { EmailRepo } from "../../domain/repositories/email_repo";

export class BrowserEmailRepo implements EmailRepo {
  async fetchSenders(): Promise<Sender[]> {
    const response = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "FETCH_SENDERS",
            },
            (response) => {
              console.log(`response: ${JSON.stringify(response)}`);
              resolve(response.data);
            },
          );
        } else {
          console.error("No active tab found.");
          resolve(null);
        }
      });
    });
    const senders = response as Sender[];
    console.log(`senders: ${senders}`);
    senders.sort((a, b) => b.emailCount - a.emailCount);
    return senders;
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
