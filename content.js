// Function to send message to background script to take screenshot
function requestScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "takeScreenshot" }, (response) => {
      if (response && response.success) {
        resolve(response.dataUrl);
      } else {
        reject(response.error);
      }
    });
  });
}

// Function to call the API with the base64 image data
function callDarkPatternDetectionAPI(base64Data) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    base64_image: base64Data,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://dark-dgir.onrender.com/detectDarkPattern",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      // Extracting DarkPattern value and Explanation from the respon

      return result;
    })
    .catch((error) => error);
}

// Function to store data in the database
function storeInDatabase(url, explanation) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "website-url": url,
    "website-info": explanation,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://dark-database.onrender.com/api/websites", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

// Example of using the screenshot functionality

document.addEventListener("DOMContentLoaded", function () {
  const screenshotButton = document.getElementById("screenshotButton");
  const loadingIndicator = document.getElementById("loadingIndicator");

  screenshotButton.addEventListener("click", async function () {
    loadingIndicator.style.display = "block"; // Show loading spinner
    try {
      // Get the active tab URL
      chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
        var currentTab = tabs[0];
        var url = currentTab.url;

        // Request screenshot
        try {
          const dataUrl = await requestScreenshot();
          var parts = dataUrl.split(',');
          var base64Data = parts[1];

          // Call the API with the base64 data
          const result = await callDarkPatternDetectionAPI(base64Data);
          
          // Hide the loading indicator immediately before showing the popup message
          loadingIndicator.style.display = "none";

          // Display the Explanation in an alert message
          alert(result);

          // Store in database if DarkPattern is 1
          if (result[0] === '1') {
            storeInDatabase(url, result);
          }
        } catch (error) {
          alert("Error: " + error);
        }
      });
    } catch (error) {
      alert("Error: " + error);
    }
  });
});
