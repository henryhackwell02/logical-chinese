import { getAllRoots, getAllCharactersFlat } from "@/lib/data";
import SearchBar from "@/components/SearchBar";
import RootCard from "@/components/RootCard";

export default function HomePage() {
  const roots = getAllRoots();
  const index = getAllCharactersFlat();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Chinese characters, grouped by logic
      </h1>
      <p className="mt-2 text-stone-600 max-w-2xl">
        Most Chinese characters are built from a phonetic or semantic{" "}
        <strong>root</strong>. Learn one root and you unlock a whole family
        of characters — {roots[0]?.character ?? "侯"} gives you{" "}
        {roots[0]?.derived.map((d) => d.character).join("、") ||
          "候、猴、喉"}
        , all sharing a sound or shape.
      </p>

      <div className="mt-8 max-w-xl">
        <SearchBar index={index} />
      </div>

      <h2 className="mt-12 text-xl font-semibold">
        All roots ({roots.length})
      </h2>
      {roots.length === 0 ? (
        <p className="mt-4 text-stone-500">
          No root data yet. Add a JSON file to{" "}
          <code className="bg-stone-100 px-1 rounded">data/roots/</code> to
          get started — see the README.
        </p>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roots.map((root) => (
            <RootCard key={root.id} root={root} />
          ))}
        </div>
      )}
    </div>
  );
}
