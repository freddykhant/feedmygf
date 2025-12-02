import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/eat");
  }

  return (
    <HydrateClient>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-pink-50 via-orange-50 to-blue-100">
        {/* Header */}
        <header className="relative z-10 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                feedmygf
              </span>
            </div>
            <Link
              href="/auth"
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Heading */}
            <h1 className="mb-6 text-7xl leading-tight font-bold tracking-tight text-gray-900 md:text-8xl">
              I don&apos;t know,
              <br />
              <span className="bg-linear-to-r from-pink-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
                you choose.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mb-12 text-xl text-gray-600 md:text-2xl">
              For your clueless self, and your hangry girlfriend.
            </p>

            {/* CTA */}
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
