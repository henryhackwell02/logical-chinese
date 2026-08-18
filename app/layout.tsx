import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions";

export const metadata: Metadata = {
  title: "Logical Chinese",
  description:
    "A database of Chinese characters grouped by pinyin sound and tone, with definitions and memory tricks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = isAdmin();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-stone-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
              <a href="/" className="flex items-baseline gap-2">
                <span className="text-2xl font-hanzi font-bold text-red-700">
                  逻
                </span>
                <span className="text-xl font-semibold tracking-tight">
                  Logical Chinese
                </span>
              </a>
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-500 hidden sm:block">
                  grouped by sound &amp; tone
                </span>
                {admin ? (
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="text-sm text-stone-500 hover:text-red-700"
                    >
                      Log out
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm text-stone-500 hover:text-red-700"
                  >
                    Admin login
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-stone-200 mt-16">
            <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-stone-500">
              Logical Chinese — a personal database of characters grouped by sound and tone.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
