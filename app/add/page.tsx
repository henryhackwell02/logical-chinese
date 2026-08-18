import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createCharacterAction } from "@/app/actions";
import CharacterForm from "@/components/CharacterForm";

export default function AddPage() {
  if (!isAdmin()) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-stone-500 hover:text-red-700">
        ← All sounds
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Add a character
      </h1>
      <div className="mt-6">
        <CharacterForm action={createCharacterAction} submitLabel="Add character" />
      </div>
    </div>
  );
}
