// Register the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-measurement",
    title: "Convert measurement",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-measurement") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: convertSelectedMeasurement
    });
  }
});

// This function is injected into the webpage and executed in its context.
function convertSelectedMeasurement() {
  // Helper function to create and position a popup near the selection.
  function showPopup(message) {
    // Create a new div element for the popup.
    let popup = document.createElement("div");
    popup.innerText = message;

    // Determine the position based on the current text selection.
    let selection = window.getSelection();
    let rect;
    if (selection.rangeCount > 0) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    }

    // Apply inline styles to the popup.
    popup.style.position = "absolute";
    // Position below the selected text if we obtained coordinates,
    // otherwise fallback to a default position.
    if (rect) {
      popup.style.top = (rect.top + window.scrollY + 20) + "px";
      popup.style.left = (rect.left + window.scrollX) + "px";
    } else {
      popup.style.top = "20px";
      popup.style.left = "20px";
    }
    popup.style.background = "lightyellow";
    popup.style.color = "black";
    popup.style.padding = "10px 15px";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    popup.style.zIndex = 10000;

    // Append the popup to the body.
    document.body.appendChild(popup);

    // Remove the popup after 3 seconds.
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }

  // Obtain the user-selected text from the page.
  const selectedText = window.getSelection().toString().trim();

  // Regular expression to match numbers with "ft" or "lb"/"lbs".
  const regex = /([\d.]+)\s*(ft|mi|miles|lb|lbs|in)/i;
  const match = selectedText.match(regex);

  if (!match) {
    showPopup("Selected text is not a valid measurement.");
    return;
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  let convertedValue, convertedUnit, originalUnit, conversionFactor;

  // Conversion logic based on the detected unit.
  if (unit === "ft") {
    conversionFactor = 0.3048;
    convertedValue = value * conversionFactor;
    originalUnit = "ft";
    convertedUnit = "m";
  } else if (unit === "mi" || unit === "miles") {
    conversionFactor = 1.60934;
    convertedValue = value * conversionFactor;
    originalUnit = "mi";
    convertedUnit = "km";
  } else if (unit === "lb" || unit === "lbs") {
    conversionFactor = 0.453592;
    convertedValue = value * conversionFactor;
    originalUnit = "lb";
    convertedUnit = "kg";
  } else if (unit === "in") {
    conversionFactor = 2.54;
    convertedValue = value * conversionFactor;
    originalUnit = "in";
    convertedUnit = "cm";
  }

  // Format the conversion result and display it in a popup.
  const resultMessage = `${value} ${originalUnit} ≈ ${convertedValue.toFixed(2)} ${convertedUnit}`;
  showPopup(resultMessage);
}
