import fs from "fs";
import path from "path";

export type Example = {
  word: string;
  pinyin: string;
  meaning: string;
};

export type CharacterEntry = {
  character: string;
  pinyin: string;
  meaning: string;
  aiDefinition: string;
  examples?: Example[];
};

export type RootEntry = {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  description?: string;
  derived: CharacterEntry[];
};

const ROOTS_DIR = path.join(process.cwd(), "data", "roots");

let cache: RootEntry[] | null = null;

export function getAllRoots(): RootEntry[] {
  if (cache) return cache;

  if (!fs.existsSync(ROOTS_DIR)) {
    cache = [];
    return cache;
  }

  const files = fs.readdirSync(ROOTS_DIR).filter((f) => f.endsWith(".json"));

  const roots = files.map((file) => {
    const raw = fs.readFileSync(path.join(ROOTS_DIR, file), "utf-8");
    return JSON.parse(raw) as RootEntry;
  });

  roots.sort((a, b) => a.character.localeCompare(b.character, "zh"));

  cache = roots;
  return cache;
}

export function getRootById(id: string): RootEntry | undefined {
  return getAllRoots().find((r) => r.id === id);
}

export type FlatCharacter = CharacterEntry & {
  rootId: string;
  rootCharacter: string;
};

export function getAllCharactersFlat(): FlatCharacter[] {
  const roots = getAllRoots();
  const flat: FlatCharacter[] = [];

  for (const root of roots) {
    // include the root character itself so it's searchable/browsable too
    flat.push({
      character: root.character,
      pinyin: root.pinyin,
      meaning: root.meaning,
      aiDefinition: root.description ?? "",
      rootId: root.id,
      rootCharacter: root.character,
    });

    for (const child of root.derived) {
      flat.push({ ...child, rootId: root.id, rootCharacter: root.character });
    }
  }

  return flat;
}
