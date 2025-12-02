import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import RestaurantForm from "./_components/restaurant-form";

export default async function EatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-blue-100">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-gray-900">feedmygf</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full bg-gray-200/80 px-6 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-300/80"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Find a Restaurant
          </h1>
          <p className="mt-2 text-gray-600">
            Let us help you decide where to eat
          </p>
        </div>

        <RestaurantForm />
      </main>
    </div>
  );
}
