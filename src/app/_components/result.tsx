import { Star, MapPin } from "lucide-react";
import Image from "next/image";

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

export default function Result({ restaurant }: { restaurant: Restaurant }) {
  return (
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
  );
}
