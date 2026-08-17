import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logical Chinese",
  description:
    "A database of Chinese characters grouped by their phonetic/semantic root, so learners can see the logic behind character families.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <span className="text-sm text-stone-500 hidden sm:block">
                characters grouped by root
              </span>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-stone-200 mt-16">
            <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-stone-500">
              Logical Chinese — an open-source character root database.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
