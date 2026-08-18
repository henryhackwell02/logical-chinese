import Link from "next/link";
import { getAllCharacters, groupBySound } from "@/lib/characters";
import { isAdmin } from "@/lib/auth";
import { toneToAccented, toneLabel } from "@/lib/pinyin";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const characters = await getAllCharacters();
  const groups = groupBySound(characters);
  const admin = isAdmin();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chinese characters, grouped by sound
          </h1>
          <p className="mt-2 text-stone-600 max-w-2xl">
            Every character is filed under its pinyin syllable, then by
            tone — huang1, huang2, huang3, huang4 all nested under{" "}
            <span className="font-hanzi">huang</span>. Learn a syllable once
            and see every character that shares it.
          </p>
        </div>
        {admin && (
          <Link
            href="/add"
            className="shrink-0 rounded-lg bg-red-700 text-white px-4 py-2 text-sm font-medium hover:bg-red-800"
          >
            + Add character
          </Link>
        )}
      </div>

      <div className="mt-8 max-w-xl">
        <SearchBar characters={characters} />
      </div>

      <h2 className="mt-12 text-xl font-semibold">
        All sounds ({groups.length})
      </h2>

      {groups.length === 0 ? (
        <p className="mt-4 text-stone-500">
          No characters yet.{" "}
          {admin ? (
            <Link href="/add" className="text-red-700 underline">
              Add the first one
            </Link>
          ) : (
            <>
              Log in as admin to start adding entries.
            </>
          )}
        </p>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link
              key={group.soundBase}
              href={`/sound/${group.soundBase}`}
              className="block rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-red-300 transition"
            >
              <div className="text-lg font-medium text-stone-800">
                {group.soundBase}
              </div>
              <div className="mt-3 space-y-1.5">
                {group.tones.map(({ tone, characters }) => (
                  <div key={tone} className="flex items-baseline gap-2 text-sm">
                    <span className="text-stone-400 w-20 shrink-0">
                      {toneToAccented(group.soundBase, tone)} · {toneLabel(tone)}
                    </span>
                    <span className="font-hanzi text-base text-stone-700">
                      {characters.map((c) => c.character).join(" ")}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
