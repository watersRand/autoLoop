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
    return true; 
  }
 
  if ( request.action === "SET_LOOP") {
	  const count = parseInt(request.count,10) || 0;
	  const newState = {
		  targetLoops: count,
		  currentLoop: 0,
		  active: count > 0
	  };

	  chrome.storage.local.set(newState,() => {
		  chrome.tabs.query({}, (tabs) => {
			  tabs.forEach((tab) => {
				  chrome.tabs.sendMessage(tab.id, { action: "STATE_UPDATED", state:newState }).catch(() => {});
			  });
		  });
		  sendResponse({status: "success", state: newState });
	  });
	  return true;
  }
});
