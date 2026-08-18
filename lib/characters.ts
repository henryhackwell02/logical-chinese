import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Example = {
  word: string;
  pinyin: string;
  meaning: string;
};

export type CharacterRow = {
  id: string;
  character: string;
  sound_base: string;
  tone: number;
  meaning: string;
  definition: string;
  memory_trick: string;
  examples: Example[];
  created_at: string;
};

export type CharacterInput = {
  character: string;
  sound_base: string;
  tone: number;
  meaning: string;
  definition: string;
  memory_trick: string;
  examples: Example[];
};

export async function getAllCharacters(): Promise<CharacterRow[]> {
  const { data, error } = await supabaseAdmin
    .from("characters")
    .select("*")
    .order("sound_base", { ascending: true })
    .order("tone", { ascending: true })
    .order("character", { ascending: true });

  if (error) throw new Error(`Failed to load characters: ${error.message}`);
  return data ?? [];
}

export async function getCharactersBySoundBase(
  soundBase: string
): Promise<CharacterRow[]> {
  const { data, error } = await supabaseAdmin
    .from("characters")
    .select("*")
    .eq("sound_base", soundBase)
    .order("tone", { ascending: true })
    .order("character", { ascending: true });

  if (error) throw new Error(`Failed to load characters: ${error.message}`);
  return data ?? [];
}

export async function getCharacterById(
  id: string
): Promise<CharacterRow | null> {
  const { data, error } = await supabaseAdmin
    .from("characters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load character: ${error.message}`);
  return data;
}

export async function addCharacter(input: CharacterInput) {
  const { error } = await supabaseAdmin.from("characters").insert(input);
  if (error) throw new Error(`Failed to add character: ${error.message}`);
}

export async function updateCharacter(id: string, input: CharacterInput) {
  const { error } = await supabaseAdmin
    .from("characters")
    .update(input)
    .eq("id", id);
  if (error) throw new Error(`Failed to update character: ${error.message}`);
}

export async function deleteCharacter(id: string) {
  const { error } = await supabaseAdmin.from("characters").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete character: ${error.message}`);
}

export type SoundGroup = {
  soundBase: string;
  tones: { tone: number; characters: CharacterRow[] }[];
};

export function groupBySound(rows: CharacterRow[]): SoundGroup[] {
  const bySound = new Map<string, Map<number, CharacterRow[]>>();

  for (const row of rows) {
    if (!bySound.has(row.sound_base)) bySound.set(row.sound_base, new Map());
    const toneMap = bySound.get(row.sound_base)!;
    if (!toneMap.has(row.tone)) toneMap.set(row.tone, []);
    toneMap.get(row.tone)!.push(row);
  }

  return Array.from(bySound.entries())
    .map(([soundBase, toneMap]) => ({
      soundBase,
      tones: Array.from(toneMap.entries())
        .map(([tone, characters]) => ({ tone, characters }))
        .sort((a, b) => a.tone - b.tone),
    }))
    .sort((a, b) => a.soundBase.localeCompare(b.soundBase));
}
