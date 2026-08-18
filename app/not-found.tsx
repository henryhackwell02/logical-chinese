import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="font-hanzi text-6xl text-stone-300">找不到</div>
      <p className="mt-4 text-stone-600">
        That page isn't in the database yet.
      </p>
      <Link href="/" className="mt-4 inline-block text-red-700 underline">
        Back to all sounds
      </Link>
    </div>
  );
}
