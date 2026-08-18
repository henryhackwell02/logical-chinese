"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CharacterRow } from "@/lib/characters";
import { toneToAccented } from "@/lib/pinyin";

export default function SearchBar({
  characters,
}: {
  characters: CharacterRow[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return characters
      .filter((c) => {
        const numbered = `${c.sound_base}${c.tone}`;
        const accented = toneToAccented(c.sound_base, c.tone).toLowerCase();
        return (
          c.character.includes(q) ||
          numbered.includes(q) ||
          accented.includes(q) ||
          c.sound_base.toLowerCase().includes(q) ||
          c.meaning.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [query, characters]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a character, pinyin (huang2), or meaning…"
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg divide-y divide-stone-100 max-h-96 overflow-auto">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/sound/${r.sound_base}#${r.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"
                onClick={() => setQuery("")}
              >
                <span className="font-hanzi text-2xl">{r.character}</span>
                <span className="text-stone-500 text-sm">
                  {toneToAccented(r.sound_base, r.tone)}
                </span>
                <span className="text-stone-700 text-sm truncate">
                  {r.meaning}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
