import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import RestaurantForm from "./_components/restaurant-form";
import Header from "~/components/header";

export default async function EatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-orange-50 to-blue-100">
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Feed Your Girlfriend
          </h1>
        </div>

        <RestaurantForm />
      </main>
    </div>
  );
}
