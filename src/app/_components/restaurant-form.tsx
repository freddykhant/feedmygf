"use client";

import { useState } from "react";
import Image from "next/image";
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
  "Any",
  "American",
  "Argentinian",
  "Asian Fusion",
  "Australian",
  "Bangladeshi",
  "Barbecue",
  "Belgian",
  "Brazilian",
  "Breakfast & Brunch",
  "British",
  "Burmese",
  "Cajun",
  "Caribbean",
  "Chinese",
  "Colombian",
  "Cuban",
  "Desserts",
  "Ethiopian",
  "Filipino",
  "French",
  "Fusion",
  "German",
  "Greek",
  "Hawaiian",
  "Hong Kong",
  "Indian",
  "Indonesian",
  "International",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Kebab",
  "Korean",
  "Kosher",
  "Latin American",
  "Lebanese",
  "Malaysian",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Mongolian",
  "Moroccan",
  "Nepalese",
  "Pakistani",
  "Peruvian",
  "Persian",
  "Pizza",
  "Polish",
  "Portuguese",
  "Ramen",
  "Russian",
  "Salad",
  "Seafood",
  "Singaporean",
  "Soul Food",
  "South African",
  "South American",
  "Spanish",
  "Sri Lankan",
  "Steakhouse",
  "Sushi",
  "Taiwanese",
  "Tapas",
  "Tex-Mex",
  "Thai",
  "Turkish",
  "Vegan",
  "Vegetarian",
  "Vietnamese",
  "West African",
];

export default function RestaurantForm() {
  // state management for form inputs
  const [address, setAddress] = useState(""); // address input
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null); // selected place from autocomplete
  const [distance, setDistance] = useState(5); // distance input
  const [rating, setRating] = useState(3.0); // min rating input
  const [priceLevel, setPriceLevel] = useState(2); // max price level input
  const [cuisine, setCuisine] = useState("Any"); // cuisine input
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
        rating,
        priceLevel,
        cuisine,
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

      {/* price level slider */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <DollarSign className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
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

      {/* cuisine dropdown */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-200/50 p-4 transition-all hover:bg-gray-300/60">
        <UtensilsCrossed className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
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

      {/* restaurant result */}
      {restaurant && (
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm sm:p-6">
          {restaurant.photoUrl && (
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl sm:h-64">
              <Image
                src={restaurant.photoUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {restaurant.name}
          </h3>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {restaurant.address}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium text-gray-900 sm:text-base">
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                ({restaurant.userRatingCount} reviews)
              </span>
            </div>
            {restaurant.priceLevel > 0 && (
              <span className="text-gray-600">
                {"$".repeat(restaurant.priceLevel)}
              </span>
            )}
          </div>
          {restaurant.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}&query_place_id=${restaurant.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-200/80 px-4 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-300/80 sm:w-auto sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
            </a>
          )}
        </div>
      )}

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
