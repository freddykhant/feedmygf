import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const placeRouter = createTRPCRouter({
  search: protectedProcedure
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

  getDetails: protectedProcedure
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
});
