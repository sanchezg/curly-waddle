// Register the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-measurement",
    title: "Convert measurement",
    contexts: ["selection"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-measurement") {
    // Execute a script in the current tab to read the selection and convert it
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: convertSelectedMeasurement
    });
  }
});

// This function runs in the context of the page
function convertSelectedMeasurement() {
  // Get the selected text
  const selectedText = window.getSelection().toString().trim();
  
  // Basic pattern to match a number and a unit
  const regex = /([\d.]+)\s*(ft|lb|lbs|in)/i;
  const match = selectedText.match(regex);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    let convertedValue, convertedUnit, originalUnit, conversionFactor;
    
    // Decide which conversion to perform
    if (unit === "ft") {
      conversionFactor = 0.3048;
      convertedValue = value * conversionFactor;
      originalUnit = "ft";
      convertedUnit = "m";
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
    
    // Display the result, rounded to two decimal places
    alert(`${value} ${originalUnit} is approximately ${convertedValue.toFixed(2)} ${convertedUnit}`);
  } else {
    alert("Selected text does not appear to be a valid measurement.");
  }
}
