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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0A0A0A]">
        {/* Gradient Background Effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[120px]" />
          <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[120px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">feedmygf</span>
            </div>
            <Link
              href="/auth"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Heading */}
            <h1 className="mb-6 text-7xl leading-tight font-bold tracking-tight text-white md:text-8xl">
              I don&apos;t know,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                you choose.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mb-12 text-xl text-gray-400 md:text-2xl">
              For your clueless self, and your hangry girlfriend.
            </p>

            {/* CTA */}
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
