import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ratelimit } from "~/lib/rate-limit";
import { TRPCError } from "@trpc/server";

export const placeRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Rate limiting
      const identifier = ctx.headers?.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Places API key not configured",
        });
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
      } catch {
        return [];
      }
    }),

  getDetails: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Rate limiting
      const identifier = ctx.headers?.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Places API key not configured",
        });
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
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get place details",
        });
      }
    }),

  reverseGeocode: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting
      const identifier = ctx.headers?.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Places API key not configured",
        });
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${input.latitude},${input.longitude}&key=${apiKey}`,
        );

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reverse geocode",
          });
        }

        const data = (await response.json()) as {
          status?: string;
          error_message?: string;
          results?: Array<{
            place_id: string;
            formatted_address: string;
          }>;
        };

        if (data.status !== "OK") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Geocoding API error: ${data.status}`,
          });
        }

        if (data.results?.[0]) {
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

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No results found for these coordinates",
        });
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reverse geocode location",
        });
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
    .mutation(async ({ input, ctx }) => {
      // Rate limiting
      const identifier = ctx.headers?.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Places API key not configured",
        });
      }

      try {
        // First get the coordinates for the place
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.placeId}&fields=geometry&key=${apiKey}`,
        );

        if (!detailsResponse.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get place coordinates",
          });
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

        // Build included types based on cuisine selection
        // when a specific cuisine is selected, use ONLY that type (not "restaurant" + cuisine) because Places API uses OR logic
        let includedTypes: string[];
        if (input.cuisine !== "Any") {
          const cuisineTypeMap: Record<string, string> = {
            Italian: "italian_restaurant",
            Japanese: "japanese_restaurant",
            Chinese: "chinese_restaurant",
            Thai: "thai_restaurant",
            Mexican: "mexican_restaurant",
            Indian: "indian_restaurant",
            French: "french_restaurant",
            Korean: "korean_restaurant",
            Vietnamese: "vietnamese_restaurant",
            Mediterranean: "mediterranean_restaurant",
            American: "american_restaurant",
            Greek: "greek_restaurant",
            Spanish: "spanish_restaurant",
          };
          const cuisineType = cuisineTypeMap[input.cuisine];
          // Use ONLY the specific cuisine type for precise filtering
          includedTypes = cuisineType ? [cuisineType] : ["restaurant"];
        } else {
          // When "Any" is selected, use general restaurant type
          includedTypes = ["restaurant"];
        }

        // Search using Places API (New)
        const searchResponse = await fetch(
          "https://places.googleapis.com/v1/places:searchNearby",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location",
            },
            body: JSON.stringify({
              includedTypes: includedTypes,
              locationRestriction: {
                circle: {
                  center: {
                    latitude: lat,
                    longitude: lng,
                  },
                  radius: input.distance * 1000,
                },
              },
              maxResultCount: 20,
              minRating: input.rating,
            }),
          },
        );

        if (!searchResponse.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search restaurants",
          });
        }

        const searchData = (await searchResponse.json()) as {
          places?: Array<{
            id: string;
            displayName?: { text: string };
            formattedAddress?: string;
            rating?: number;
            userRatingCount?: number;
            priceLevel?: string;
            location?: {
              latitude: number;
              longitude: number;
            };
          }>;
        };

        if (!searchData.places || searchData.places.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "No restaurants found in this area. Try increasing the distance or adjusting your filters.",
          });
        }

        // Filter by price level
        const filtered = searchData.places.filter((place) => {
          const placePriceLevel = place.priceLevel
            ? place.priceLevel.replace("PRICE_LEVEL_", "")
            : "0";
          const priceLevelNum =
            placePriceLevel === "FREE" || placePriceLevel === "UNSPECIFIED"
              ? 0
              : parseInt(placePriceLevel);

          // Filter by price level (max price) - only if place has a price level
          if (priceLevelNum > 0 && priceLevelNum > input.priceLevel) {
            return false;
          }

          return true;
        });

        if (filtered.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "No restaurants found matching your criteria. Try adjusting your filters.",
          });
        }

        const randomRestaurant =
          filtered[Math.floor(Math.random() * filtered.length)];

        if (!randomRestaurant) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to select a restaurant",
          });
        }

        // Convert price level from string to number
        const priceLevelStr = randomRestaurant.priceLevel
          ? randomRestaurant.priceLevel.replace("PRICE_LEVEL_", "")
          : "0";
        const priceLevel =
          priceLevelStr === "FREE" || priceLevelStr === "UNSPECIFIED"
            ? 0
            : parseInt(priceLevelStr);

        return {
          id: randomRestaurant.id,
          name: randomRestaurant.displayName?.text ?? "Unknown Restaurant",
          address: randomRestaurant.formattedAddress ?? "Address not available",
          rating: randomRestaurant.rating ?? 0,
          userRatingCount: randomRestaurant.userRatingCount ?? 0,
          priceLevel: priceLevel,
          location: randomRestaurant.location
            ? {
                latitude: randomRestaurant.location.latitude,
                longitude: randomRestaurant.location.longitude,
              }
            : undefined,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search for restaurants",
        });
      }
    }),
});
