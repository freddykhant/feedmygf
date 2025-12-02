import { auth, signIn } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/eat");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-pink-50 via-orange-50 to-blue-100">
      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in or sign up below
            </p>
          </div>

          {/* Auth Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              className="w-full rounded-lg bg-gray-900/80 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-800"
            >
              Sign in
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm"></div>
            </div>

            {/* Google Sign In */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/eat" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-3 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button className="font-medium text-gray-900 hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
