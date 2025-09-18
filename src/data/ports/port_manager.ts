export class PortManager {
  static gmailPort: chrome.runtime.Port | null = null;

  static async openPort() {
    const [currentTab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (currentTab && currentTab.id) {
      const port = chrome.tabs.connect(currentTab.id, { name: "gmail-port" });
      this.gmailPort = port;

      this.gmailPort.postMessage({ message: "Sidepanel connected" });
      this.gmailPort.onMessage.addListener((msg) => {
        console.log("content script said: ", msg);
      });
    }
  }
}
