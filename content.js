/**
 * Media AutoLoop - content.js
 */

let loopState = {
  targetLoops: 0,
  currentLoop: 0,
  active: false
};

function syncState() {
  chrome.storage.local.get(["targetLoops", "currentLoop", "active"], (data) => {
    if (data) {
      loopState = {
        targetLoops: Number(data.targetLoops) || 0,
        currentLoop: Number(data.currentLoop) || 0,
        active: Boolean(data.active)
      };
    }
  });
}

syncState();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    syncState();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "STATE_UPDATED") {
    loopState = {
      targetLoops: Number(request.state.targetLoops) || 0,
      currentLoop: Number(request.state.currentLoop) || 0,
      active: Boolean(request.state.active)
    };
    sendResponse({ status: "acknowledged" });
  }
});

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
}

function handleMediaEnded(mediaEl) {
  if (!loopState.active || loopState.targetLoops <= 0) return;

  loopState.currentLoop += 1;

  if (loopState.currentLoop < loopState.targetLoops) {
    chrome.storage.local.set({ currentLoop: loopState.currentLoop });
    triggerReplay(mediaEl);
    setTimeout(() => triggerReplay(mediaEl), 150);
  } else {
    loopState.active = false;
    loopState.currentLoop = 0;
    chrome.storage.local.set({ active: false, currentLoop: 0, targetLoops: 0 });

  }
}

// Global ended event listener
document.addEventListener('ended', (event) => {
  const target = event.target;
  if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
    event.stopPropagation();
    handleMediaEnded(target);
  }
}, true);

// Timeupdate fallback to catch loops right before stream ends
let isHandlingEnd = false;
document.addEventListener('timeupdate', (event) => {
  const media = event.target;
  if (!media || !(media.tagName === 'VIDEO' || media.tagName === 'AUDIO')) return;

  if (loopState.active && media.duration > 0) {
    const remainingTime = media.duration - media.currentTime;
    if (remainingTime <= 0.3 && !isHandlingEnd) {
      isHandlingEnd = true;
      handleMediaEnded(media);
      setTimeout(() => { isHandlingEnd = false; }, 1000);
    }
  }
}, true);


