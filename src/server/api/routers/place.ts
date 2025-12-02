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
          results?: Array<{
            place_id: string;
            formatted_address: string;
          }>;
        };

        if (data.results && data.results[0]) {
          const result = data.results[0];
          return {
            id: result.place_id,
            displayName: result.formatted_address,
            formattedAddress: result.formatted_address,
            fullDescription: result.formatted_address,
          };
        }

        throw new Error("No results found for these coordinates");
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw new Error("Failed to reverse geocode location");
      }
    }),
});
