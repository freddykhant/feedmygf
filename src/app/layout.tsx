import "~/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Feed My GF",
  description: "feed your hungry indecisive girlfriend",
  icons: [{ rel: "icon", url: "/feedmygf_black.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "16px",
                fontSize: "14px",
                fontWeight: "500",
              },
            }}
          />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
