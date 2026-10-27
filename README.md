# 🔁 Media Loop Counter — Firefox Extension

A lightweight Firefox extension that lets you loop HTML5 audio/video elements and YouTube videos **N times** — without relying on the browser's native infinite loop. Set a target count, hit play, and the extension handles the rest.

## ✨ Features

- 🎬 Loops any `<video>` or `<audio>` HTML5 element on any webpage
- ▶️ Works with YouTube (including autoplay bypass)
- 🔢 Set an exact loop count via the popup
- 📊 Live loop progress tracking in the popup status bar
- 🧠 State persisted via `browser.storage.local` across tab refreshes

## 📦 Installation (Firefox — Developer Mode)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click **"This Firefox"** → **"Load Temporary Add-on…"**
4. Select the `manifest.json` file from this folder

> For permanent installation, the extension can be submitted to [addons.mozilla.org (AMO)](https://addons.mozilla.org/).

## 🚀 Usage

1. Navigate to any page with a video or audio element (or YouTube)
2. Click the extension icon in the toolbar
3. Enter the desired loop count in the input field
4. Click **"Set Loops"**
5. The media will loop the specified number of times, then stop

## 🗂 Project Structure

```
autoLoop/
├── manifest.json      # Extension manifest (Firefox MV2)
├── background.js      # Event page — initializes and relays state
├── content.js         # Injected script — handles media end/loop logic
├── popup.html         # Popup UI layout
├── popup.js           # Popup UI logic
├── icons/             # Extension icons (16, 48, 128 px)
└── LICENSE            # MIT License
```

## 🛠 Tech Stack

- **Manifest Version:** 2 (Firefox-compatible)
- **APIs:** `browser.storage.local`, `browser.tabs`, `browser.runtime`
- **No external dependencies** — pure vanilla JavaScript

## 🤝 Contributing

Contributions, bug reports and feature requests are welcome!  
Please open an [issue](../../issues) or submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
