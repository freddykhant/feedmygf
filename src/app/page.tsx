import { auth, signIn } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/eat");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-linear-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="backdrop-blur-s border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Image
                src="/favicon.ico"
                alt="feedmygf logo"
                width={24}
                height={24}
              />
              <span className="text-lg font-bold text-gray-800">feedmygf</span>
            </div>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/eat" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sign in
              </button>
            </form>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Heading */}
            <h1 className="mb-6 text-6xl leading-tight font-bold text-gray-900">
              <br />
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Feed My Girlfriend
              </span>
            </h1>

            {/* Subheading */}
            <p className="mb-10 text-xl text-gray-600">
              For you and your indecisive significant other
            </p>

            {/* CTA */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/eat" });
              }}
              className="mb-4"
            >
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
              >
                Let's Eat
              </button>
            </form>
          </div>
        </main>
      </main>
    </HydrateClient>
  );
}
