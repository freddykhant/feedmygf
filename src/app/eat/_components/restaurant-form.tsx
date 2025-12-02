"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const cuisines = [
  "Any",
  "Italian",
  "Japanese",
  "Chinese",
  "Thai",
  "Mexican",
  "Indian",
  "French",
  "Korean",
  "Vietnamese",
  "Mediterranean",
  "American",
  "Greek",
  "Spanish",
];

export default function RestaurantForm() {
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState(5);
  const [rating, setRating] = useState(3.0);
  const [priceLevel, setPriceLevel] = useState(2);
  const [cuisine, setCuisine] = useState("Any");
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddress(
            `${position.coords.latitude}, ${position.coords.longitude}`,
          );
        },
        (error) => {
          alert(
            "Failed to get your location. Please enter an address manually.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement restaurant search
    console.log({
      address,
      distance,
      rating,
      priceLevel,
      cuisine,
    });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg"
    >
      <div className="space-y-6">
        {/* Location Section */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address or use current location"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Use Current Location
            </button>
          </div>
        </div>

        {/* Distance Slider */}
        <div>
          <label className="mb-3 flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Distance</span>
            <span className="text-gray-500">{distance} km</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gray-900"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400"></div>
        </div>

        {/* Rating Slider */}
        <div>
          <label className="mb-3 flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Minimum Rating</span>
            <span className="flex items-center gap-1 text-gray-500">
              {rating.toFixed(1)} <Star className="h-4 w-4" />
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gray-900"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400"></div>
        </div>

        {/* Price Level Slider */}
        <div>
          <label className="mb-3 flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Maximum Price</span>
            <span className="text-gray-500">{"$".repeat(priceLevel)}</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={priceLevel}
            onChange={(e) => setPriceLevel(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gray-900"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400"></div>
        </div>

        {/* Cuisine Dropdown */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Cuisine
          </label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
          >
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 px-4 py-4 text-base font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Find Restaurant"}
        </button>
      </div>
    </form>
  );
}
