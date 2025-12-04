import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ratelimit } from "~/lib/rate-limit";
import { TRPCError } from "@trpc/server";

// helper to convert price level from string -> number
const convertPriceLevel = (priceLevel: string | undefined): number => {
  const priceLevelStr = priceLevel
    ? priceLevel.replace("PRICE_LEVEL_", "")
    : "0";
  return priceLevelStr === "FREE" || priceLevelStr === "UNSPECIFIED"
    ? 0
    : parseInt(priceLevelStr);
};

export const placeRouter = createTRPCRouter({
  // autocomplete search for places
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
      }),
    )
    .query(async ({ input, ctx }) => {
      // rate limiting
      const identifier = ctx.headers?.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      // get google places api key
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Places API key not configured",
        });
      }

      // fetch places
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input.query)}&key=${apiKey}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch places");
        }

        // parse response
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

        // map predictions to place results
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

  // get details for a place
  getDetails: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // rate limiting
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

        // parse response
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

        // return coordinates and formatted address
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

  // reverse geocode coordinates to get place details
  reverseGeocode: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // rate limiting
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

        // parse response
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

        // return place details
        if (data.results?.[0]) {
          const result = data.results[0];

          // extract just the street address (unit no. + street name)
          const addressParts = result.formatted_address.split(","); // e.g ["123 Main St", "Happy Valley WA 6112", "Australia"]
          const streetAddress =
            addressParts[0]?.trim() ?? result.formatted_address; // e.g ["123 Main St"]
          const restOfAddress = addressParts.slice(1).join(",").trim(); // e.g "Happy Valley WA 6112, Australia"

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

  // search for restaurants with filters
  searchRestaurants: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
        distance: z.number().min(1).max(50),
        rating: z.number().min(0).max(5), // 0 = any rating
        priceLevel: z.number().min(1).max(5), // 5 = any price (above max of 4)
        cuisine: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // rate limiting
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
        // get coordinates for the place
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.placeId}&fields=geometry&key=${apiKey}`,
        );

        if (!detailsResponse.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get place coordinates",
          });
        }

        // parse response
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

        // get coordinates
        const { lat, lng } = detailsData.result.geometry.location;

        // map cuisine to primary types for precise filtering
        // using includedPrimaryTypes ensures we only get places where this is the primary type
        let includedPrimaryTypes: string[] | undefined;
        if (input.cuisine !== "Any") {
          const cuisineTypeMap: Record<string, string> = {
            American: "american_restaurant",
            Argentinian: "argentinian_restaurant",
            AsianFusion: "asian_restaurant",
            Australian: "australian_restaurant",
            Bangladeshi: "bangladeshi_restaurant",
            Barbecue: "bbq_restaurant",
            Belgian: "belgian_restaurant",
            Brazilian: "brazilian_restaurant",
            BreakfastBrunch: "breakfast_restaurant",
            British: "british_restaurant",
            Burmese: "burmese_restaurant",
            Cajun: "cajun_restaurant",
            Caribbean: "caribbean_restaurant",
            Chinese: "chinese_restaurant",
            Colombian: "colombian_restaurant",
            Cuban: "cuban_restaurant",
            Desserts: "dessert_restaurant",
            Ethiopian: "ethiopian_restaurant",
            Filipino: "filipino_restaurant",
            French: "french_restaurant",
            Fusion: "fusion_restaurant",
            German: "german_restaurant",
            Greek: "greek_restaurant",
            Hawaiian: "hawaiian_restaurant",
            HongKong: "hong_kong_restaurant",
            Indian: "indian_restaurant",
            Indonesian: "indonesian_restaurant",
            International: "international_restaurant",
            Irish: "irish_restaurant",
            Italian: "italian_restaurant",
            Jamaican: "jamaican_restaurant",
            Japanese: "japanese_restaurant",
            Kebab: "kebab_shop",
            Korean: "korean_restaurant",
            Kosher: "kosher_restaurant",
            LatinAmerican: "latin_american_restaurant",
            Lebanese: "lebanese_restaurant",
            Malaysian: "malaysian_restaurant",
            Mediterranean: "mediterranean_restaurant",
            Mexican: "mexican_restaurant",
            MiddleEastern: "middle_eastern_restaurant",
            Mongolian: "mongolian_restaurant",
            Moroccan: "moroccan_restaurant",
            Nepalese: "nepalese_restaurant",
            Pakistani: "pakistani_restaurant",
            Peruvian: "peruvian_restaurant",
            Persian: "persian_restaurant",
            Pizza: "pizza_restaurant",
            Polish: "polish_restaurant",
            Portuguese: "portuguese_restaurant",
            Ramen: "ramen_restaurant",
            Russian: "russian_restaurant",
            Salad: "salad_restaurant",
            Seafood: "seafood_restaurant",
            Singaporean: "singaporean_restaurant",
            SoulFood: "soul_food_restaurant",
            SouthAfrican: "south_african_restaurant",
            SouthAmerican: "south_american_restaurant",
            Spanish: "spanish_restaurant",
            SriLankan: "sri_lankan_restaurant",
            Steakhouse: "steakhouse",
            Sushi: "sushi_restaurant",
            Taiwanese: "taiwanese_restaurant",
            Tapas: "tapas_restaurant",
            TexMex: "tex_mex_restaurant",
            Thai: "thai_restaurant",
            Turkish: "turkish_restaurant",
            Vegan: "vegan_restaurant",
            Vegetarian: "vegetarian_restaurant",
            Vietnamese: "vietnamese_restaurant",
            WestAfrican: "west_african_restaurant",
          };
          const cuisineType = cuisineTypeMap[input.cuisine];
          // use primary types to filter by main cuisine category
          includedPrimaryTypes = cuisineType ? [cuisineType] : ["restaurant"];
        } else {
          // when "any" is selected, use general restaurant type
          includedPrimaryTypes = ["restaurant"];
        }

        // build request body for places API
        const requestBody: {
          includedPrimaryTypes?: string[];
          locationRestriction: {
            circle: {
              center: { latitude: number; longitude: number };
              radius: number;
            };
          };
          maxResultCount: number;
          rankPreference?: string;
        } = {
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lng,
              },
              radius: input.distance * 1000, // convert km to m
            },
          },
          maxResultCount: 20,
          rankPreference: "POPULARITY", // rank by popularity for better results
        };

        // only add includedPrimaryTypes if we have specific cuisine filtering
        if (includedPrimaryTypes) {
          requestBody.includedPrimaryTypes = includedPrimaryTypes;
        }

        // search using new places API
        const searchResponse = await fetch(
          "https://places.googleapis.com/v1/places:searchNearby",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.photos,places.primaryType",
            },
            body: JSON.stringify(requestBody),
          },
        );

        if (!searchResponse.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search restaurants",
          });
        }

        // parse response
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
            photos?: Array<{
              name: string;
              widthPx: number;
              heightPx: number;
            }>;
          }>;
        };

        // check if no restaurants were found
        if (!searchData.places || searchData.places.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "No restaurants found in this area. Try increasing the distance or adjusting your filters.",
          });
        }

        // filter by rating, price, and quality indicators
        const filtered = searchData.places.filter((place) => {
          // skip places without ratings (likely new/unverified) - unless rating is 'any' (0)
          if (input.rating > 0 && (!place.rating || !place.userRatingCount)) {
            return false;
          }

          // filter by minimum rating (0 = any rating)
          if (input.rating > 0 && place.rating && place.rating < input.rating) {
            return false;
          }

          // filter by price level (5 = any price, max normal is 4)
          const priceLevelNum = convertPriceLevel(place.priceLevel);
          if (
            input.priceLevel < 5 &&
            priceLevelNum > 0 &&
            priceLevelNum > input.priceLevel
          ) {
            return false;
          }

          // prefer places with at least 10 reviews for reliability (unless rating is 'any')
          if (
            input.rating > 0 &&
            place.userRatingCount &&
            place.userRatingCount < 10
          ) {
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

        // select random restaurant from filtered results
        const randomRestaurant =
          filtered[Math.floor(Math.random() * filtered.length)];

        if (!randomRestaurant) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to select a restaurant",
          });
        }

        // get photo URL with optimized size
        const photoUrl = randomRestaurant.photos?.[0]
          ? `https://places.googleapis.com/v1/${randomRestaurant.photos[0].name}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`
          : undefined;

        // return restaurant data
        return {
          id: randomRestaurant.id,
          name: randomRestaurant.displayName?.text ?? "Unknown Restaurant",
          address: randomRestaurant.formattedAddress ?? "Address not available",
          rating: randomRestaurant.rating ?? 0,
          userRatingCount: randomRestaurant.userRatingCount ?? 0,
          priceLevel: convertPriceLevel(randomRestaurant.priceLevel),
          photoUrl: photoUrl,
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
