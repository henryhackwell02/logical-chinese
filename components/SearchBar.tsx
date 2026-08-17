"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FlatCharacter } from "@/lib/data";

export default function SearchBar({ index }: { index: FlatCharacter[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return index
      .filter((entry) => {
        return (
          entry.character.includes(q) ||
          entry.pinyin.toLowerCase().includes(q) ||
          entry.pinyin.toLowerCase().replace(/[^a-z]/g, "").includes(q) ||
          entry.meaning.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [query, index]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a character, pinyin, or meaning… e.g. 猴 or hou or monkey"
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg divide-y divide-stone-100 max-h-96 overflow-auto">
          {results.map((r) => (
            <li key={`${r.rootId}-${r.character}`}>
              <Link
                href={`/root/${r.rootId}#${encodeURIComponent(r.character)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"
                onClick={() => setQuery("")}
              >
                <span className="font-hanzi text-2xl">{r.character}</span>
                <span className="text-stone-500 text-sm">{r.pinyin}</span>
                <span className="text-stone-700 text-sm truncate">
                  {r.meaning}
                </span>
                {r.character !== r.rootCharacter && (
                  <span className="ml-auto text-xs text-stone-400">
                    root: {r.rootCharacter}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
