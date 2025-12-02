"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function PlacesAutocomplete({
  onPlaceSelectAction,
  placeholder = "Search for a place...",
  className,
}: {
  onPlaceSelectAction: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      void (async () => {
        const places = await searchPlaces(query);
        setResults(places);
        setShowDropdown(true);
        setIsLoading(false);
      })();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
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

  const handleSelect = (place: PlaceResult) => {
    onPlaceSelectAction(place);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg backdrop-blur-sm">
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => handleSelect(place)}
              className="flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-all last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <MapPin className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-slate-900">
                  {place.displayName}
                </p>
                <p className="truncate text-sm text-slate-500">
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
