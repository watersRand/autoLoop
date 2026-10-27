// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ targetLoops: 0, currentLoop: 0, active: false });
});

// Relay updates from popup to content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_STATE") {
    chrome.storage.local.get(["targetLoops", "currentLoop", "active"], (data) => {
      sendResponse(data);
    });
    return true; // Keep channel open for async response
  }
});
