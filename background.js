// background.js

// Function to take screenshot
function takeScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(dataUrl);
      }
    });
  });
}

// Message listener for content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "takeScreenshot") {
    takeScreenshot()
      .then((dataUrl) => {
        sendResponse({ success: true, dataUrl: dataUrl });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error });
      });
    return true; // Indicates that the response will be sent asynchronously
  }
});

