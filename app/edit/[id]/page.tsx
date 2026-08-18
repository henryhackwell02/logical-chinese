import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getCharacterById } from "@/lib/characters";
import { formatNumberedPinyin } from "@/lib/pinyin";
import { updateCharacterAction } from "@/app/actions";
import CharacterForm from "@/components/CharacterForm";

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdmin()) redirect("/login");

  const entry = await getCharacterById(params.id);
  if (!entry) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href={`/sound/${entry.sound_base}`}
        className="text-sm text-stone-500 hover:text-red-700"
      >
        ← Back to {entry.sound_base}
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Edit {entry.character}
      </h1>
      <div className="mt-6">
        <CharacterForm
          action={updateCharacterAction}
          submitLabel="Save changes"
          initial={{
            id: entry.id,
            character: entry.character,
            pinyin: formatNumberedPinyin(entry.sound_base, entry.tone),
            meaning: entry.meaning,
            definition: entry.definition,
            memory_trick: entry.memory_trick,
            examples: entry.examples,
          }}
        />
      </div>
    </div>
  );
}
