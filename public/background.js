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
    chrome.tabs.create({ url: "https://mail.google.com/" }, function (tab) {
      // Wait for the tab to finish loading before sending the message
      function handleUpdated(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.sendMessage(tab.id, { action: "SHOW_TUTORIAL" });
          chrome.tabs.onUpdated.removeListener(handleUpdated);
        }
      }
      chrome.tabs.onUpdated.addListener(handleUpdated);
    });
  }
});

// Shows an uninstall survey when extension is removed
chrome.runtime.setUninstallURL("https://tally.so/r/w4yg5X");



// adding archiveAutomation content script 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'archiveEmails') {
    handleArchiveEmails(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async response
  }
  // ... existing handlers
});

async function handleArchiveEmails(data: { sender: string }) {
  const { sender } = data;
  
  try {
    // Query the active Gmail tab
    const tabs = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true,
      url: "*://mail.google.com/*"
    });
    
    if (!tabs[0]?.id) {
      throw new Error('No active Gmail tab found');
    }

    // Execute archive operation in content script
    const result = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'performArchive',
      sender: sender
    });

    return result;
  } catch (error) {
    console.error('Archive error:', error);
    throw error;
  }
}