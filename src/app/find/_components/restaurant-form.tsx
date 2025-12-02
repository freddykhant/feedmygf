"use client";

import { useState } from "react";
import {
  MapPin,
  Navigation,
  Star,
  DollarSign,
  UtensilsCrossed,
  TrendingUp,
  X,
} from "lucide-react";
import PlacesAutocomplete, { type PlaceResult } from "./places-autocomplete";
import { api } from "~/trpc/react";

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
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [distance, setDistance] = useState(5);
  const [rating, setRating] = useState(3.0);
  const [priceLevel, setPriceLevel] = useState(2);
  const [cuisine, setCuisine] = useState("Any");
  const [loading, setLoading] = useState(false);

  const reverseGeocodeMutation = api.place.reverseGeocode.useMutation();

  const handleUseCurrentLocation = async () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const place = await reverseGeocodeMutation.mutateAsync({
              latitude,
              longitude,
            });

            setAddress(place.displayName);
            setSelectedPlace(place);
          } catch (error) {
            console.error("Geocoding error:", error);
            setAddress(`${latitude}, ${longitude}`);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Failed to get your location. Please enter an address manually.",
          );
          setLoading(false);
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    setAddress(place.displayName);
  };

  const handleClearLocation = () => {
    setSelectedPlace(null);
    setAddress("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement restaurant search
    console.log({
      selectedPlace,
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
        {!selectedPlace ? (
          <>
            {/* Location Input */}
            <div className="group flex flex-1 items-center gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter address"
                value={address}
              />
            </div>

            {/* Use Current Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="flex items-center gap-4 rounded-2xl bg-gray-200/50 p-4 text-left transition-all hover:bg-gray-300/60 disabled:opacity-50"
            >
              <Navigation className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="text-base text-gray-700">
                Use Current Location
              </span>
            </button>
          </>
        ) : (
          /* Selected Location Display */
          <div className="flex flex-1 items-center justify-between rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-900">
                  {selectedPlace.displayName}
                </span>
                <span className="text-sm text-gray-500">
                  {selectedPlace.formattedAddress}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-300/80 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
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
