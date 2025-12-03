import RestaurantForm from "./_components/restaurant-form";
import Header from "~/app/_components/header";

export default async function EatPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-orange-50 to-blue-100">
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">
            Feed Your Girlfriend
          </h1>
        </div>

        <RestaurantForm />
      </main>
    </div>
  );
}
