import { NextRequest, NextResponse } from "next/server";
import zlib from "node:zlib";

const CEDICT_URL =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";

// Cached per warm serverless instance — avoids re-downloading on every
// lookup within the same instance's lifetime. Not persisted across deploys.
type CedictEntry = { pinyin: string; meaning: string; isProperNoun: boolean };
type CedictMap = Map<string, CedictEntry[]>;

let cedictCache: CedictMap | null = null;
let loadingPromise: Promise<CedictMap> | null = null;

async function loadCedict(): Promise<CedictMap> {
  if (cedictCache) return cedictCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const res = await fetch(CEDICT_URL);
    if (!res.ok) throw new Error(`CC-CEDICT download failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const text = zlib.gunzipSync(buf).toString("utf-8");

    const map = new Map<
      string,
      { pinyin: string; meaning: string; isProperNoun: boolean }[]
    >();

    for (const rawLine of text.split("\n")) {
      const line = rawLine.replace(/\r$/, "");
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/);
      if (!match) continue;
      const [, , simplified, pinyinRaw, defsRaw] = match;
      if ([...simplified].length !== 1) continue;

      const syllables = pinyinRaw.split(" ");
      if (syllables.length !== 1) continue; // single-character = single syllable

      const isProperNoun = /^[A-Z]/.test(syllables[0]);
      const pinyin = syllables[0].toLowerCase().replace(/u:/g, "v");
      const meaning = defsRaw.split("/").slice(0, 2).join("; ");

      const entries = map.get(simplified) ?? [];
      entries.push({ pinyin, meaning, isProperNoun });
      map.set(simplified, entries);
    }

    cedictCache = map;
    return map;
  })();

  return loadingPromise;
}

export async function GET(req: NextRequest) {
  const char = req.nextUrl.searchParams.get("char")?.trim();
  if (!char) {
    return NextResponse.json({ error: "Missing ?char=" }, { status: 400 });
  }

  try {
    const dict = await loadCedict();
    const entries = dict?.get(char) ?? [];

    // Prefer common-word readings over proper-noun readings.
    const sorted = [...entries].sort(
      (a, b) => Number(a.isProperNoun) - Number(b.isProperNoun)
    );

    return NextResponse.json({
      results: sorted.map(({ pinyin, meaning }) => ({ pinyin, meaning })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
