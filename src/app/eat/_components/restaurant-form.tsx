"use client";

import { useState } from "react";
import {
  MapPin,
  Navigation,
  Star,
  DollarSign,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-row gap-3">
        {/* Location Input */}
        <div className="group flex flex-1 items-center gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
          <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
          <div className="flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              required
              className="w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-4 rounded-2xl bg-gray-200/50 p-4 text-left transition-all hover:bg-gray-300/60"
        >
          <Navigation className="h-5 w-5 flex-shrink-0 text-gray-400" />
          <span className="text-base text-gray-700">Use Current Location</span>
        </button>
      </div>

      {/* Distance Slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base text-gray-700">Distance</span>
            <span className="text-base text-gray-500">{distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-gray-600"
          />
        </div>
      </div>

      {/* Rating Slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <Star className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base text-gray-700">Minimum Rating</span>
            <span className="flex items-center gap-1 text-base text-gray-500">
              {rating.toFixed(1)} ⭐
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-gray-600"
          />
        </div>
      </div>

      {/* Price Level Slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <DollarSign className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base text-gray-700">Maximum Price</span>
            <span className="text-base text-gray-500">
              {"$".repeat(priceLevel)}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={priceLevel}
            onChange={(e) => setPriceLevel(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-gray-600"
          />
        </div>
      </div>

      {/* Cuisine Dropdown */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <UtensilsCrossed className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="flex-1">
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full cursor-pointer bg-transparent text-base text-gray-700 outline-none"
          >
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gray-600/90 px-6 py-4 text-base font-medium text-white transition-all hover:bg-gray-700/90 disabled:opacity-50"
      >
        {loading ? "Searching..." : "Find Restaurant"}
      </button>
    </form>
  );
}
