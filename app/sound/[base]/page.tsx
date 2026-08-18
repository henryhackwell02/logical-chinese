import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharactersBySoundBase, groupBySound } from "@/lib/characters";
import { isAdmin } from "@/lib/auth";
import { toneToAccented, toneLabel } from "@/lib/pinyin";
import { deleteCharacterAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SoundPage({
  params,
}: {
  params: { base: string };
}) {
  const characters = await getCharactersBySoundBase(params.base);
  if (characters.length === 0) notFound();

  const [group] = groupBySound(characters);
  const admin = isAdmin();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-stone-500 hover:text-red-700">
        ← All sounds
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {group.soundBase}
      </h1>
      <p className="mt-1 text-stone-500">
        {characters.length} character{characters.length === 1 ? "" : "s"}{" "}
        across {group.tones.length} tone{group.tones.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8 space-y-10">
        {group.tones.map(({ tone, characters }) => (
          <section key={tone}>
            <h2 className="text-lg font-semibold text-stone-800 flex items-baseline gap-2">
              <span className="font-hanzi text-2xl">
                {toneToAccented(group.soundBase, tone)}
              </span>
              <span className="text-sm text-stone-400 font-normal">
                {toneLabel(tone)} tone · {group.soundBase}
                {tone}
              </span>
            </h2>

            <div className="mt-3 space-y-4">
              {characters.map((entry) => (
                <div
                  key={entry.id}
                  id={entry.id}
                  className="scroll-mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-hanzi text-5xl">
                        {entry.character}
                      </span>
                      <div>
                        <div className="text-stone-500">
                          {toneToAccented(entry.sound_base, entry.tone)}
                        </div>
                        <div className="text-stone-800 font-medium">
                          {entry.meaning}
                        </div>
                      </div>
                    </div>
                    {admin && (
                      <div className="flex gap-3 text-sm shrink-0">
                        <Link
                          href={`/edit/${entry.id}`}
                          className="text-stone-500 hover:text-red-700"
                        >
                          Edit
                        </Link>
                        <form action={deleteCharacterAction}>
                          <input type="hidden" name="id" value={entry.id} />
                          <input
                            type="hidden"
                            name="sound_base"
                            value={entry.sound_base}
                          />
                          <button
                            type="submit"
                            className="text-stone-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {entry.definition && (
                    <p className="mt-3 text-stone-700 leading-relaxed whitespace-pre-line">
                      {entry.definition}
                    </p>
                  )}

                  {entry.memory_trick && (
                    <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <div className="text-xs uppercase tracking-wide text-amber-700 mb-1">
                        Memory trick
                      </div>
                      <p className="text-sm text-amber-900 whitespace-pre-line">
                        {entry.memory_trick}
                      </p>
                    </div>
                  )}

                  {entry.examples.length > 0 && (
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <div className="text-xs uppercase tracking-wide text-stone-400 mb-2">
                        Examples
                      </div>
                      <ul className="space-y-1">
                        {entry.examples.map((ex, i) => (
                          <li
                            key={i}
                            className="text-sm flex flex-wrap gap-2 items-baseline"
                          >
                            <span className="font-hanzi text-base">
                              {ex.word}
                            </span>
                            <span className="text-stone-400">
                              {ex.pinyin}
                            </span>
                            <span className="text-stone-600">
                              {ex.meaning}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
