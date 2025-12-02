import Link from "next/link";
import Image from "next/image";
import { auth } from "~/server/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="relative z-10 border-b border-gray-200/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/feedmygf_black.png"
            alt="Feed My GF Logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold text-gray-900">feedmygf</span>
        </Link>

        {session?.user ? (
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
        ) : (
          <Link
            href="/auth"
            className="rounded-full bg-gray-200/80 px-6 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-300/80"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
