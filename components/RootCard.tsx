import Link from "next/link";
import type { RootEntry } from "@/lib/data";

export default function RootCard({ root }: { root: RootEntry }) {
  return (
    <Link
      href={`/root/${root.id}`}
      className="block rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-red-300 transition"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-hanzi text-4xl">{root.character}</span>
        <span className="text-stone-500">{root.pinyin}</span>
      </div>
      <p className="mt-2 text-sm text-stone-600 line-clamp-2">
        {root.meaning}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {root.derived.map((d) => (
          <span
            key={d.character}
            className="font-hanzi text-lg text-stone-700 bg-stone-100 rounded px-2 py-0.5"
          >
            {d.character}
          </span>
        ))}
      </div>
    </Link>
  );
}
