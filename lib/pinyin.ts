// Converts numbered pinyin (the way people actually type it — "huang2")
// into accented display form ("huáng"). Storage/grouping always uses the
// numbered base+tone; accents are computed on render only.

const TONE_MAP: Record<string, string> = {
  a: "aāáǎà",
  e: "eēéěè",
  i: "iīíǐì",
  o: "oōóǒò",
  u: "uūúǔù",
  v: "üǖǘǚǜ", // ü written as "v", the standard pinyin-input convention
};

const VOWEL_PRIORITY = ["a", "o", "e", "i", "u", "v"];

export function toneToAccented(base: string, tone: number): string {
  if (!base) return "";
  if (tone === 5 || !tone) return base.replace(/v/g, "ü");

  const lower = base.toLowerCase();
  let target: string | null = null;

  // "iu" and "ui" place the accent on the second vowel by convention.
  if (lower.includes("iu")) target = "u";
  else if (lower.includes("ui")) target = "i";
  else {
    for (const v of VOWEL_PRIORITY) {
      if (lower.includes(v)) {
        target = v;
        break;
      }
    }
  }
  if (!target) return base;

  const idx = lower.indexOf(target);
  const accented = TONE_MAP[target][tone];
  return base.slice(0, idx) + accented + base.slice(idx + 1);
}

// Splits "huang2" -> { base: "huang", tone: 2 }. Returns null if malformed.
export function parseNumberedPinyin(
  input: string
): { base: string; tone: number } | null {
  const trimmed = input.trim().toLowerCase().replace(/ü/g, "v");
  const match = trimmed.match(/^([a-z]+)([1-5])$/);
  if (!match) return null;
  return { base: match[1], tone: Number(match[2]) };
}

export function formatNumberedPinyin(base: string, tone: number): string {
  return `${base}${tone}`;
}

const TONE_LABELS = ["", "1st (ā)", "2nd (á)", "3rd (ǎ)", "4th (à)", "neutral"];
export function toneLabel(tone: number): string {
  return TONE_LABELS[tone] ?? String(tone);
}
