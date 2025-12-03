// Content script - runs on all pages
// Currently not doing anything, but could be used for:
// - Detecting addresses on pages
// - Adding context menu items
// - Injecting UI elements

// Example: Detect if user is on Google Maps
if (window.location.hostname.includes("google.com/maps")) {
  console.log("feedmygf: detected Google Maps");
  // Could add a button to find restaurants near current map location
}
