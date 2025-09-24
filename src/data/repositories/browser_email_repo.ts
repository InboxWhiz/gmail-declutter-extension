import { Sender } from "../../domain/entities/sender";
import { EmailRepo } from "../../domain/repositories/email_repo";
import { PortManager } from "../ports/port_manager";
import { FetchProgress } from "../services/browser_email_service";

export class BrowserEmailRepo implements EmailRepo {
  private onProgressCallback?: (progress: FetchProgress) => void;

  setProgressCallback(callback: (progress: FetchProgress) => void) {
    this.onProgressCallback = callback;
  }

  async fetchSenders(): Promise<Sender[]> {
    const port = PortManager.gmailPort;
    if (!port) return Promise.reject("Port not connected");

    port.postMessage({ action: "FETCH_SENDERS" });

    return await new Promise<Sender[]>((resolve, reject) => {
      const listener = (msg: any) => {
        if (msg.action === "FETCH_PROGRESS" && this.onProgressCallback) {
          this.onProgressCallback(msg.progress);
        } else if (msg.action === "FETCH_SENDERS_RESPONSE") {
          port.onMessage.removeListener(listener);

          if (msg.success) {
            const senders = msg.data as Sender[];
            senders.sort((a, b) => b.emailCount - a.emailCount);
            resolve(senders);
          } else {
            reject(new Error(msg.error));
          }
        }
      };
      port.onMessage.addListener(listener);
    });
  }

  async cancelFetch(): Promise<void> {
    const port = PortManager.gmailPort;
    if (!port) return;
    port.postMessage({ action: "CANCEL_FETCH" });
  }

  async deleteSenders(senderEmailAddresses: string[]): Promise<void> {
    const port = PortManager.gmailPort;
    if (!port) return Promise.reject("Port not connected");

    // Send message
    port.postMessage({
      action: "DELETE_SENDERS",
      emails: senderEmailAddresses,
    });

    // Wait for response
    return await new Promise<void>((resolve, reject) => {
      const listener = (msg: any) => {
        if (msg.action === "DELETE_SENDERS_RESPONSE") {
          port.onMessage.removeListener(listener);

          if (msg.success) {
            resolve();
          } else {
            console.error(
              `Error deleting senders from content script: ${msg.error}`,
            );
            reject(new Error(msg.error));
          }
        }
      };
      port.onMessage.addListener(listener);
    });
  }

  async unsubscribeSenders(senderEmailAddresses: string[]): Promise<string[]> {
    const port = PortManager.gmailPort;
    if (!port) return Promise.reject("Port not connected");

    // Send message
    port.postMessage({
      action: "UNSUBSCRIBE_SENDERS",
      emails: senderEmailAddresses,
    });

    // Wait for response
    return await new Promise<string[]>((resolve, reject) => {
      const listener = (msg: any) => {
        if (msg.action === "UNSUBSCRIBE_SENDERS_RESPONSE") {
          port.onMessage.removeListener(listener);

          if (msg.success) {
            resolve(msg.failures as string[]);
          } else {
            console.error(
              `Error unsubscribing senders from content script: ${msg.error}`,
            );
            reject(new Error(msg.error));
          }
        }
      };
      port.onMessage.addListener(listener);
    });
  }

  async blockSender(senderEmailAddress: string): Promise<void> {
    const port = PortManager.gmailPort;
    if (!port) return Promise.reject("Port not connected");

    // Send message
    port.postMessage({
      action: "BLOCK_SENDER",
      email: senderEmailAddress,
    });

    // Wait for response
    return await new Promise<void>((resolve, reject) => {
      const listener = (msg: any) => {
        if (msg.action === "BLOCK_SENDER_RESPONSE") {
          port.onMessage.removeListener(listener);

          if (msg.success) {
            resolve();
          } else {
            console.error(
              `Error blocking sender from content script: ${msg.error}`,
            );
            reject(new Error(msg.error));
          }
        }
      };
      port.onMessage.addListener(listener);
    });
  }
}
