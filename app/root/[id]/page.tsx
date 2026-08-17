import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRoots, getRootById } from "@/lib/data";

export function generateStaticParams() {
  return getAllRoots().map((root) => ({ id: root.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const root = getRootById(params.id);
  if (!root) return {};
  return {
    title: `${root.character} (${root.pinyin}) — Logical Chinese`,
    description: `Characters derived from ${root.character}: ${root.derived
      .map((d) => d.character)
      .join("、")}`,
  };
}

export default function RootPage({ params }: { params: { id: string } }) {
  const root = getRootById(params.id);
  if (!root) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-stone-500 hover:text-red-700">
        ← All roots
      </Link>

      <div className="mt-4 flex items-baseline gap-4">
        <span className="font-hanzi text-6xl">{root.character}</span>
        <div>
          <div className="text-lg text-stone-500">{root.pinyin}</div>
          <div className="text-stone-700">{root.meaning}</div>
        </div>
      </div>

      {root.description && (
        <p className="mt-4 text-stone-600 leading-relaxed">
          {root.description}
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold text-stone-800">
        Characters built from {root.character}
      </h2>

      <div className="mt-4 space-y-6">
        {root.derived.map((entry) => (
          <div
            key={entry.character}
            id={entry.character}
            className="scroll-mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-hanzi text-5xl">{entry.character}</span>
              <div>
                <div className="text-stone-500">{entry.pinyin}</div>
                <div className="text-stone-800 font-medium">
                  {entry.meaning}
                </div>
              </div>
              <a
                href={`#${encodeURIComponent(entry.character)}`}
                className="ml-auto text-xs text-stone-400 hover:text-red-700"
                title="Link to this character"
              >
                #
              </a>
            </div>

            <p className="mt-3 text-stone-700 leading-relaxed whitespace-pre-line">
              {entry.aiDefinition}
            </p>

            {entry.examples && entry.examples.length > 0 && (
              <div className="mt-4 border-t border-stone-100 pt-3">
                <div className="text-xs uppercase tracking-wide text-stone-400 mb-2">
                  Examples
                </div>
                <ul className="space-y-1">
                  {entry.examples.map((ex) => (
                    <li
                      key={ex.word}
                      className="text-sm flex flex-wrap gap-2 items-baseline"
                    >
                      <span className="font-hanzi text-base">{ex.word}</span>
                      <span className="text-stone-400">{ex.pinyin}</span>
                      <span className="text-stone-600">{ex.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
