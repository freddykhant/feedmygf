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
import Result from "./result";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRatingCount: number;
  priceLevel: number;
  photoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

const cuisines = [
  "Asian",
  "Bar",
  "Barbecue",
  "Brazilian",
  "Breakfast",
  "Burmese",
  "Cafe",
  "Caribbean",
  "Chinese",
  "Desserts",
  "Filipino",
  "French",
  "Fusion",
  "German",
  "Greek",
  "Hawaiian",
  "Indian",
  "Indonesian",
  "Italian",
  "Jamaican",
  "Japanese",
  "Korean",
  "Latin",
  "Malaysian",
  "Mediterranean",
  "Mexican",
  "Mongolian",
  "Moroccan",
  "Pizza",
  "Pub",
  "Ramen",
  "Seafood",
  "Singaporean",
  "Spanish",
  "Sushi",
  "Thai",
  "Turkish",
  "Vegan",
  "Vegetarian",
  "Vietnamese",
];

export default function RestaurantForm() {
  // state management for form inputs
  const [address, setAddress] = useState(""); // address input
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null); // selected place from autocomplete
  const [distance, setDistance] = useState(5); // distance input
  const [rating, setRating] = useState<number | null>(3.0); // min rating input (null = any)
  const [priceLevel, setPriceLevel] = useState<number | null>(2); // max price level input (null = any)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]); // selected cuisines (empty = any)
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null); // foundrestaurant

  const reverseGeocodeMutation = api.place.reverseGeocode.useMutation(); // reverse geocode to get place ID
  const searchRestaurantsMutation = api.place.searchRestaurants.useMutation(); // search for restaurants with filters

  // handler for get current location
  const handleUseCurrentLocation = async () => {
    if ("geolocation" in navigator) {
      setLoading(true);

      // get current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // get coordinates from current location
          const { latitude, longitude } = position.coords;

          // reverse geocode to get place ID
          void (async () => {
            try {
              const place = await reverseGeocodeMutation.mutateAsync({
                latitude,
                longitude,
              });

              setAddress(place.displayName); // set address from place ID
              setSelectedPlace(place); // set selected place from place ID
            } catch {
              setAddress(`${latitude}, ${longitude}`); // set address as coordinates
            } finally {
              setLoading(false);
            }
          })();
        },
        () => {
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

  // handler for select place from autocomplete
  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    setAddress(place.displayName);
  };

  // handler for clear location
  const handleClearLocation = () => {
    setSelectedPlace(null);
    setAddress("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlace) {
      toast.error("Please select a location first");
      return;
    }

    setLoading(true);
    setRestaurant(null);

    // search for restaurants with filters
    try {
      const result = await searchRestaurantsMutation.mutateAsync({
        placeId: selectedPlace.id,
        distance,
        rating: rating ?? 0, // use 0 for 'any' rating
        priceLevel: priceLevel ?? 5, // use 5 for 'any' price (higher than max 4)
        cuisines: selectedCuisines, // empty array = any cuisine
      });

      setRestaurant(result);
      toast.success("Found the perfect spot!");

      // trigger confetti animation yippee!
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to find a restaurant. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {!selectedPlace ? (
          <>
            {/* location input */}
            <div className="group flex flex-1 items-center gap-3 rounded-2xl bg-gray-200/50 p-3 transition-all hover:bg-gray-300/60 sm:gap-4 sm:p-4">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter address"
                value={address}
              />
            </div>

            {/* use current location button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="flex items-center justify-center gap-3 rounded-2xl bg-gray-200/50 p-3 text-left transition-all hover:bg-gray-300/60 disabled:opacity-50 sm:gap-4 sm:p-4"
            >
              <Navigation className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-sm text-gray-700 sm:text-base">
                Use Current Location
              </span>
            </button>
          </>
        ) : (
          /* selected location display */
          <div className="flex flex-1 items-center justify-between rounded-2xl bg-gray-200/50 p-3 transition-all hover:bg-gray-300/60 sm:p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-gray-900 sm:text-base">
                  {selectedPlace.displayName}
                </span>
                <span className="truncate text-xs text-gray-500 sm:text-sm">
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

      {/* distance slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <TrendingUp className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
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

      {/* rating slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <Star className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base text-gray-700">Minimum Rating</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRating(rating === null ? 3.0 : null)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                  rating === null
                    ? "bg-gray-600 text-white"
                    : "bg-gray-300/60 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Any
              </button>
              {rating !== null && (
                <span className="flex items-center gap-1 text-base text-gray-500">
                  {rating.toFixed(1)} ⭐
                </span>
              )}
            </div>
          </div>
          {rating !== null && (
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-gray-600"
            />
          )}
        </div>
      </div>

      {/* price level slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <DollarSign className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base text-gray-700">Maximum Price</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPriceLevel(priceLevel === null ? 2 : null)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                  priceLevel === null
                    ? "bg-gray-600 text-white"
                    : "bg-gray-300/60 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Any
              </button>
              {priceLevel !== null && (
                <span className="text-base text-gray-500">
                  {"$".repeat(priceLevel)}
                </span>
              )}
            </div>
          </div>
          {priceLevel !== null && (
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={priceLevel}
              onChange={(e) => setPriceLevel(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-gray-600"
            />
          )}
        </div>
      </div>

      {/* cuisine multi-select */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <UtensilsCrossed className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
        <div className="flex-1">
          <div className="mb-2 text-sm text-gray-700">Cuisine Type</div>

          {/* Selected cuisine tags */}
          {selectedCuisines.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedCuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-600 px-3 py-1 text-sm text-white"
                >
                  {cuisine}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCuisines((prev) =>
                        prev.filter((c) => c !== cuisine),
                      )
                    }
                    className="hover:text-gray-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* dropdown to add cuisines */}
          <select
            value=""
            onChange={(e) => {
              const cuisine = e.target.value;
              if (cuisine && !selectedCuisines.includes(cuisine)) {
                setSelectedCuisines((prev) => [...prev, cuisine]);
              }
            }}
            className="w-full cursor-pointer bg-transparent text-base text-gray-700 outline-none"
          >
            <option value="" disabled>
              {selectedCuisines.length === 0
                ? "Select cuisines (or leave empty for any)"
                : "Add another cuisine..."}
            </option>
            {cuisines
              .filter((c) => c !== "Any" && !selectedCuisines.includes(c))
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* restaurant result */}
      {restaurant && <Result restaurant={restaurant} />}

      {/* submit button */}
      <button
        type="submit"
        disabled={loading || !selectedPlace}
        className="w-full rounded-2xl bg-gray-600/90 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-700/90 disabled:opacity-50 sm:py-4 sm:text-base"
      >
        {loading ? "Searching..." : "Find Restaurant"}
      </button>
    </form>
  );
}
