// @ts-nocheck
// Background service worker for the extension
// Currently not doing anything, but could be used for:
// - Background location updates
// - Notifications
// - Badge updates

chrome.runtime.onInstalled.addListener(() => {
  console.log("feedmygf extension installed");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchRestaurant") {
    // Could handle API calls here instead of popup
    sendResponse({ success: true });
  }
});
