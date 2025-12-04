// @ts-nocheck
// API endpoint - automatically detects environment
const API_URL = "https://feedmygf-seven.vercel.app/api/trpc"; // Update this to your production URL

// Get DOM elements
const distanceInput = document.getElementById("distance");
const ratingInput = document.getElementById("rating");
const priceInput = document.getElementById("price");
const cuisineSelect = document.getElementById("cuisine");
const selectedCuisinesContainer = document.getElementById("selected-cuisines");
const findBtn = document.getElementById("find-btn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const error = document.getElementById("error");

// Track selected cuisines
let selectedCuisines = [];

// Update display values
distanceInput.addEventListener("input", (e) => {
  document.getElementById("distance-value").textContent =
    `${e.target.value} km`;
});

ratingInput.addEventListener("input", (e) => {
  document.getElementById("rating-value").textContent = `${e.target.value} ⭐`;
});

priceInput.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  document.getElementById("price-value").textContent = "$".repeat(value);
});

// Handle cuisine selection
cuisineSelect.addEventListener("change", (e) => {
  const cuisine = e.target.value;
  if (cuisine && !selectedCuisines.includes(cuisine)) {
    selectedCuisines.push(cuisine);
    renderSelectedCuisines();
  }
  e.target.value = ""; // Reset dropdown
});

// Render selected cuisine tags
function renderSelectedCuisines() {
  if (selectedCuisines.length === 0) {
    selectedCuisinesContainer.innerHTML = "";
    return;
  }

  selectedCuisinesContainer.innerHTML = selectedCuisines
    .map(
      (cuisine) =>
        `<span class="cuisine-tag">${cuisine}<button class="remove-cuisine" data-cuisine="${cuisine}">×</button></span>`,
    )
    .join("");

  // Add remove handlers
  document.querySelectorAll(".remove-cuisine").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cuisineToRemove = e.target.getAttribute("data-cuisine");
      selectedCuisines = selectedCuisines.filter((c) => c !== cuisineToRemove);
      renderSelectedCuisines();
    });
  });
}

// Find restaurant button
findBtn.addEventListener("click", async () => {
  try {
    // Hide previous results
    result.classList.add("hidden");
    error.classList.add("hidden");
    loading.classList.remove("hidden");
    findBtn.disabled = true;

    // Get current location
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    // Reverse geocode to get place ID
    const placeData = await reverseGeocode(latitude, longitude);

    // Search for restaurant
    const restaurant = await searchRestaurant({
      placeId: placeData.id,
      distance: parseInt(distanceInput.value),
      rating: parseFloat(ratingInput.value),
      priceLevel: parseInt(priceInput.value),
      cuisines: selectedCuisines, // Send array of selected cuisines
    });

    // Display result
    displayRestaurant(restaurant);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch (err) {
    showError(err.message || "Failed to find restaurant");
  } finally {
    loading.classList.add("hidden");
    findBtn.disabled = false;
  }
});

// Get current position
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Reverse geocode coordinates
async function reverseGeocode(latitude, longitude) {
  const response = await fetch(`${API_URL}/place.reverseGeocode?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      0: {
        json: { latitude, longitude },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to get location");
  }

  const data = await response.json();
  return data[0]?.result?.data?.json;
}

// Search for restaurant
async function searchRestaurant(params) {
  const response = await fetch(`${API_URL}/place.searchRestaurants?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      0: {
        json: params,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "No restaurants found");
  }

  const data = await response.json();
  return data[0]?.result?.data?.json;
}

// Display restaurant
function displayRestaurant(restaurant) {
  document.getElementById("restaurant-name").textContent = restaurant.name;
  document.getElementById("restaurant-address").textContent =
    restaurant.address;
  document.getElementById("restaurant-rating").textContent =
    `⭐ ${restaurant.rating.toFixed(1)} (${restaurant.userRatingCount} reviews) ${"$".repeat(restaurant.priceLevel)}`;

  const mapsLink = document.getElementById("maps-link");
  if (restaurant.location) {
    mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}&query_place_id=${restaurant.id}`;
  }

  result.classList.remove("hidden");
}

// Show error
function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}
