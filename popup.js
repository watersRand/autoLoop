// Function to read local storage and render UI
function updateUI() {
  chrome.storage.local.get(["targetLoops", "currentLoop", "active"], (data) => {
    const statusDiv = document.getElementById('status');
    const loopsInput = document.getElementById('loops');

    if (data.active) {
      statusDiv.innerText = `Looping: ${data.currentLoop || 0} / ${data.targetLoops} done`;
    } else {
      statusDiv.innerText = "Status: Idle";
    }

    // Keep the input field synced with target count if active
    if (data.targetLoops && data.targetLoops > 0 && document.activeElement !== loopsInput) {
      loopsInput.value = data.targetLoops;
    }
  });
}

// 1. Listen for dynamic storage updates while popup is open
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    updateUI();
  }
});

// 2. Handle button click action
document.getElementById('startBtn').addEventListener('click', async () => {
  const count = parseInt(document.getElementById('loops').value, 10) || 0;
  const statusDiv = document.getElementById('status');

  if (count <= 0) {
    statusDiv.innerText = "Please enter a number > 0";
    return;
  }

  
chrome.runtime.sendMessage({ action: "SET_LOOP", count: count }, (response) => {
    if (chrome.runtime.lastError) {
      statusDiv.innerText = "Error communicating with extension";
      console.error("Communication error:", chrome.runtime.lastError.message);
    } else {
      updateUI();
      statusDiv.innerText = `Looping set to ${count}`;
    }
  });
});
// 3. Initial UI populate on popup load
document.addEventListener('DOMContentLoaded', updateUI);
