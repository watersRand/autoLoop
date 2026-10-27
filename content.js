/**
 * Media AutoLoop - content.js
 * Reliably loops HTML5 audio/video elements and YouTube players N times.
 */

let loopState = {
  targetLoops: 0,
  currentLoop: 0,
  active: false
};

// State Synchronization from chrome.storage
function syncState() {
  chrome.storage.local.get(["targetLoops", "currentLoop", "active"], (data) => {
    if (data) {
      loopState = {
        targetLoops: Number(data.targetLoops) || 0,
        currentLoop: Number(data.currentLoop) || 0,
        active: Boolean(data.active)
      };
      if (loopState.active) {
        disableAutoplay();
      }
    }
  });
}

// Initial state sync on load
syncState();

// Listen for storage updates (e.g., when modified via Popup)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    syncState();
  }
});

/**
 * Disables YouTube's built-in "Next Video" autoplay switch
 */
function disableAutoplay() {
  const autoplayToggle = document.querySelector('.ytp-autonav-toggle-button');
  if (autoplayToggle && autoplayToggle.getAttribute('aria-checked') === 'true') {
    autoplayToggle.click();
    console.log("[AutoLoop] Native YouTube Autoplay toggled OFF.");
  }
}

/**
 * Triggers video rewind and forces play execution
 */
function triggerReplay(mediaEl) {
  const video = mediaEl || document.querySelector('video') || document.querySelector('audio');

  if (video) {
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("[AutoLoop] Playback recovery pending user interaction:", err.message);
      });
    }
  }

  // YouTube specific fallback via player container focus & keypress '0'
  const playerContainer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
  if (playerContainer) {
    playerContainer.focus();
    playerContainer.dispatchEvent(new KeyboardEvent('keydown', { key: '0', keyCode: 48, bubbles: true }));
  }
}

/**
 * Executes loop counter logic and determines if replay or stop is needed
 */
function handleMediaEnded(mediaEl) {
  if (!loopState.active || loopState.targetLoops <= 0) return;

  loopState.currentLoop += 1;
  console.log(`[AutoLoop] Progress: ${loopState.currentLoop}/${loopState.targetLoops}`);

  if (loopState.currentLoop < loopState.targetLoops) {
    chrome.storage.local.set({ currentLoop: loopState.currentLoop });
    disableAutoplay();
    
    // Immediate reset and secondary check to handle DOM render delays
    triggerReplay(mediaEl);
    setTimeout(() => triggerReplay(mediaEl), 150);
  } else {
    // Target reached: Reset state
    loopState.active = false;
    loopState.currentLoop = 0;
    chrome.storage.local.set({ active: false, currentLoop: 0 , targetLoops:0 });
    console.log("[AutoLoop] Completed requested loop sequence.");
  }
}

/**
 * Primary Listener: Event-capture on standard ended signal
 */
document.addEventListener('ended', (event) => {
  const target = event.target;
  if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
    event.stopPropagation();
    console.log("[AutoLoop] Native ended event detected.");
    handleMediaEnded(target);
  }
}, true);

/**
 * Secondary Listener: Timeupdate polling threshold check to catch end-of-stream
 * before YouTube's native autoplay overrides the current page.
 */
let isHandlingEnd = false;
document.addEventListener('timeupdate', (event) => {
  const media = event.target;
  if (!media || !(media.tagName === 'VIDEO' || media.tagName === 'AUDIO')) return;

  if (loopState.active && media.duration > 0) {
    const remainingTime = media.duration - media.currentTime;
    // Catch playback within 0.25s of the end
    if (remainingTime <= 0.25 && !isHandlingEnd) {
      isHandlingEnd = true;
      console.log("[AutoLoop] End of duration detected via timeupdate.");
      handleMediaEnded(media);

      setTimeout(() => {
        isHandlingEnd = false;
      }, 1000);
    }
  }
}, true);

/**
 * Message handler for extension requests
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SET_LOOP") {
    const count = parseInt(request.count, 10) || 0;
    
    loopState = {
      targetLoops: count,
      currentLoop: 0,
      active: count > 0
    };

    chrome.storage.local.set(loopState, () => {
      console.log("[AutoLoop] Configured new loop sequence:", loopState);
      if (loopState.active) {
        disableAutoplay();
      }
      sendResponse({ status: "success", state: loopState });
    });
    return true; // Keep channel open for async response
  }
});

console.log("[AutoLoop] Content script loaded successfully.");
