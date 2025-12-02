"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get initials from name
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-200/50"
      >
        <div className="text-md flex h-10 w-10 items-center justify-center rounded-full bg-orange-300 font-semibold text-gray-800">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-lg">
          {/* User Info Section */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-300 text-sm font-semibold text-gray-800">
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-semibold text-gray-900">
                  {user.name}
                </div>
                <div className="truncate text-sm text-gray-500">
                  @{user.email?.split("@")[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Option */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
