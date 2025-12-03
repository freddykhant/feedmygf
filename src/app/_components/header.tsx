import Link from "next/link";
import Image from "next/image";

export default async function Header() {
  return (
    <header className="relative z-10 border-b border-gray-200/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/feedmygf_clear.png"
            alt="Feed My GF Logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold text-gray-900">feedmygf</span>
        </Link>
      </div>
    </header>
  );
}
