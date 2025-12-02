import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const placeRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error("Google Places API key not configured");
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input.query)}&key=${apiKey}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch places");
        }

        const data = (await response.json()) as {
          predictions: Array<{
            place_id: string;
            description: string;
            structured_formatting: {
              main_text: string;
              secondary_text: string;
            };
          }>;
        };

        return data.predictions.map((prediction) => ({
          id: prediction.place_id,
          displayName: prediction.structured_formatting.main_text,
          formattedAddress: prediction.structured_formatting.secondary_text,
          fullDescription: prediction.description,
        }));
      } catch (error) {
        console.error("Places API error:", error);
        return [];
      }
    }),

  getDetails: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error("Google Places API key not configured");
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.placeId}&fields=geometry,formatted_address&key=${apiKey}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch place details");
        }

        const data = (await response.json()) as {
          result: {
            geometry: {
              location: {
                lat: number;
                lng: number;
              };
            };
            formatted_address: string;
          };
        };

        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          formattedAddress: data.result.formatted_address,
        };
      } catch (error) {
        console.error("Place details API error:", error);
        throw new Error("Failed to get place details");
      }
    }),

  reverseGeocode: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error("Google Places API key not configured");
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${input.latitude},${input.longitude}&key=${apiKey}`,
        );

        if (!response.ok) {
          throw new Error("Failed to reverse geocode");
        }

        const data = (await response.json()) as {
          status?: string;
          error_message?: string;
          results?: Array<{
            place_id: string;
            formatted_address: string;
          }>;
        };

        console.log("Geocoding API response:", JSON.stringify(data, null, 2));

        if (data.status !== "OK") {
          throw new Error(
            `Geocoding API error: ${data.status} - ${data.error_message ?? "Unknown error"}`,
          );
        }

        if (data.results && data.results[0]) {
          const result = data.results[0];

          // Extract just the street address (unit number + street name)
          const addressParts = result.formatted_address.split(",");
          const streetAddress =
            addressParts[0]?.trim() ?? result.formatted_address;
          const restOfAddress = addressParts.slice(1).join(",").trim();

          return {
            id: result.place_id,
            displayName: streetAddress,
            formattedAddress: restOfAddress,
            fullDescription: result.formatted_address,
          };
        }

        throw new Error("No results found for these coordinates");
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw new Error("Failed to reverse geocode location");
      }
    }),

  searchRestaurants: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
        distance: z.number().min(1).max(50),
        rating: z.number().min(0).max(5),
        priceLevel: z.number().min(1).max(4),
        cuisine: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error("Google Places API key not configured");
      }

      try {
        // First get the coordinates for the place
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.placeId}&fields=geometry&key=${apiKey}`,
        );

        if (!detailsResponse.ok) {
          throw new Error("Failed to get place coordinates");
        }

        const detailsData = (await detailsResponse.json()) as {
          result: {
            geometry: {
              location: {
                lat: number;
                lng: number;
              };
            };
          };
        };

        const { lat, lng } = detailsData.result.geometry.location;

        // Search for nearby restaurants using Places API (legacy)
        // Use textsearch if cuisine is specified, otherwise use nearbysearch with price filters
        const searchUrl =
          input.cuisine !== "Any"
            ? `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(input.cuisine + " restaurant")}&location=${lat},${lng}&radius=${input.distance * 1000}&type=restaurant&minprice=0&maxprice=${input.priceLevel}&key=${apiKey}`
            : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${input.distance * 1000}&type=restaurant&minprice=0&maxprice=${input.priceLevel}&key=${apiKey}`;

        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          const errorData = await searchResponse.json();
          console.error("Places API search error:", errorData);
          throw new Error(
            `Failed to search restaurants: ${JSON.stringify(errorData)}`,
          );
        }

        const searchData = (await searchResponse.json()) as {
          results?: Array<{
            place_id: string;
            name: string;
            vicinity: string;
            rating?: number;
            user_ratings_total?: number;
            price_level?: number;
            types?: string[];
            geometry: {
              location: {
                lat: number;
                lng: number;
              };
            };
          }>;
        };

        if (!searchData.results || searchData.results.length === 0) {
          throw new Error(
            "No restaurants found in this area. Try increasing the distance.",
          );
        }

        console.log(`Found ${searchData.results.length} restaurants initially`);

        // Filter by rating and price level
        const filtered = searchData.results.filter((place) => {
          const placeRating = place.rating ?? 0;
          const placePriceLevel = place.price_level ?? 0;

          console.log(
            `Restaurant: ${place.name}, Rating: ${placeRating}, Price: ${placePriceLevel}, Types: ${place.types?.join(", ")}`,
          );

          // Filter by rating
          if (placeRating < input.rating) {
            console.log(
              `  Filtered out: rating ${placeRating} < ${input.rating}`,
            );
            return false;
          }

          // Filter by price level (max price) - only if place has a price level
          if (placePriceLevel > 0 && placePriceLevel > input.priceLevel) {
            console.log(
              `  Filtered out: price ${placePriceLevel} > ${input.priceLevel}`,
            );
            return false;
          }

          // Cuisine filtering is done via text search in the API call
          // No need to filter again here since textsearch already filters by cuisine

          console.log("  ✓ Passed all filters");
          return true;
        });

        console.log(`${filtered.length} restaurants after filtering`);

        // Pick a random restaurant from filtered results
        if (filtered.length === 0) {
          throw new Error(
            "No restaurants found matching your criteria. Try adjusting your filters.",
          );
        }

        const randomRestaurant =
          filtered[Math.floor(Math.random() * filtered.length)];

        if (!randomRestaurant) {
          throw new Error("Failed to select a restaurant");
        }

        return {
          id: randomRestaurant.place_id,
          name: randomRestaurant.name,
          address: randomRestaurant.vicinity,
          rating: randomRestaurant.rating ?? 0,
          userRatingCount: randomRestaurant.user_ratings_total ?? 0,
          priceLevel: randomRestaurant.price_level ?? 0,
          location: {
            latitude: randomRestaurant.geometry.location.lat,
            longitude: randomRestaurant.geometry.location.lng,
          },
        };
      } catch (error) {
        console.error("Restaurant search error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to search for restaurants");
      }
    }),
});
