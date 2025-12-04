"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { MapPin, Loader2 } from "lucide-react";

export type PlaceResult = {
  id: string;
  displayName: string;
  formattedAddress: string;
  fullDescription: string;
};

export default function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter address",
  value,
}: {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  value?: string;
}) {
  const [query, setQuery] = useState(value ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // fetch places using tRPC
  const { data: results = [], isLoading } = api.place.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length >= 2,
    },
  );

  // show dropdown when results change
  useEffect(() => {
    if (results.length > 0 && debouncedQuery.length >= 2) {
      setShowDropdown(true);
    }
  }, [results, debouncedQuery]);

  // click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // handler for select place from autocomplete
  const handleSelect = (place: PlaceResult) => {
    onPlaceSelect(place);
    setQuery(place.displayName);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      {/* location search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
        />
        {isLoading && (
          <div className="absolute top-1/2 right-0 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {results.map((place: PlaceResult) => (
            <button
              key={place.id}
              onClick={() => handleSelect(place)}
              className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-all last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <MapPin className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">
                  {place.displayName}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {place.formattedAddress}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
