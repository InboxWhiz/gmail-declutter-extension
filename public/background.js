const GMAIL_ORIGIN = "https://mail.google.com";

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  if (url.origin === GMAIL_ORIGIN) {
    // Enables the side panel and disables popup on Gmail pages
    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidebar/index.html",
      enabled: true,
    });
    await chrome.action.setPopup({ tabId, popup: "" });
  } else {
    // Disables the side panel and enables popup on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
    chrome.action.setPopup({ tabId, popup: "popup/index.html" });
  }
});

// Shows a tutorial when the extension is installed
chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "https://mail.google.com/" }, function (tab) {});
  }
});
