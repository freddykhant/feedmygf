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

        // Search for nearby restaurants
        const searchResponse = await fetch(
          "https://places.googleapis.com/v1/places:searchNearby",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.types,places.location",
            },
            body: JSON.stringify({
              includedTypes: ["restaurant"],
              locationRestriction: {
                circle: {
                  center: {
                    latitude: lat,
                    longitude: lng,
                  },
                  radius: input.distance * 1000, // Convert km to meters
                },
              },
              maxResultCount: 20,
            }),
          },
        );

        if (!searchResponse.ok) {
          throw new Error("Failed to search restaurants");
        }

        const searchData = (await searchResponse.json()) as {
          places?: Array<{
            id: string;
            displayName?: { text: string };
            formattedAddress?: string;
            rating?: number;
            userRatingCount?: number;
            priceLevel?: string;
            primaryType?: string;
            types?: string[];
            location?: {
              latitude: number;
              longitude: number;
            };
          }>;
        };

        if (!searchData.places) {
          return [];
        }

        // Filter by rating and price level
        const filtered = searchData.places.filter((place) => {
          const placeRating = place.rating ?? 0;
          const placePriceLevel = place.priceLevel
            ? place.priceLevel.replace("PRICE_LEVEL_", "")
            : "0";
          const priceLevelNum =
            placePriceLevel === "FREE" ? 0 : parseInt(placePriceLevel);

          // Filter by rating
          if (placeRating < input.rating) return false;

          // Filter by price level (max price)
          if (priceLevelNum > input.priceLevel) return false;

          // Filter by cuisine if not "Any"
          if (input.cuisine !== "Any" && place.types) {
            const cuisineType = input.cuisine.toLowerCase().replace(" ", "_");
            const hasCuisineType = place.types.some((type) =>
              type.toLowerCase().includes(cuisineType),
            );
            if (!hasCuisineType) return false;
          }

          return true;
        });

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
          id: randomRestaurant.id,
          name: randomRestaurant.displayName?.text ?? "Unknown Restaurant",
          address: randomRestaurant.formattedAddress ?? "Address not available",
          rating: randomRestaurant.rating ?? 0,
          userRatingCount: randomRestaurant.userRatingCount ?? 0,
          priceLevel: randomRestaurant.priceLevel ?? "PRICE_LEVEL_UNSPECIFIED",
          primaryType: randomRestaurant.primaryType ?? "restaurant",
          location: randomRestaurant.location,
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
