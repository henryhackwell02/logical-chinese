# Logical Chinese

A Mandarin dictionary organised by sound, built for remembering.

Every character carries an English phrase with the Mandarin sound hidden inside it and
spelled out in capitals — `inCANdescent`, `anchor`, `the mAlIgnant growth`. The site lights
those capitals wherever they appear. Characters are grouped by syllable rather than by
radical or stroke count, because the hard part of Mandarin is rarely a character in
isolation; it is telling apart the thirteen that sound identical.

3,021 readings of 2,764 characters, across 396 syllable pages and 33 meaning clusters.
Statically exported, no database, no search server, no runtime dependencies beyond React.

---

## The data

Everything lives in two hand-authored files:

| File | Contents |
| --- | --- |
| `data/entries.json` | 3,021 readings, **one JSON object per line** |
| `data/clusters.json` | 33 near-synonym groups with per-character notes and compounds |

```json
{"char": "灿", "pinyin": "càn", "syllable": "can", "tone": 4, "core": "brilliantly shining", "mnemonic": "shining — CAN you look at it?", "invented": false, "crossRefs": [], "freqRank": 2769, "traditional": "燦"}
```

| Field | Meaning |
| --- | --- |
| `syllable` | toneless pinyin — the primary organising axis, 396 distinct values |
| `tone` | 1–4, or 5 for neutral |
| `core` | the one idea running through every sense of the character |
| `mnemonic` | English phrase; the capitals carry the Mandarin sound |
| `invented` | `true` for the 29 threads that are memory aids rather than real etymology |
| `crossRefs` | other pinyin readings of the same character |
| `freqRank` | corpus frequency, 1 is commonest |
| `traditional` | traditional variant(s), or `""` when unchanged |

### Never reformat these two files

They are edited by hand on GitHub, and the one-object-per-line layout is what makes a diff
readable. `.gitattributes` pins their line endings, `.prettierignore` excludes them, and
`npm run check-data` fails the build if the line count stops matching the object count.
Do not run a formatter over `data/`.

---

## Editing after launch

The intended workflow needs no local checkout:

1. Open `data/entries.json` on GitHub and press the pencil.
2. Find the line — one object per line, so search for the character.
3. Edit `mnemonic` or `core` and commit to `main`.
4. Vercel rebuilds and redeploys. Every derived page, the search index and the sitemap
   regenerate from the file; nothing else needs touching.

### Reader suggestions land themselves

Each entry page has a **Suggest a better mnemonic** link. It opens
`.github/ISSUE_TEMPLATE/mnemonic.yml` with the character and reading already filled in, so
a reader only writes the replacement. From there it is automatic:

1. **On submit,** `suggestion-check.yml` validates it — the character exists, the reading
   exists on that character, the text is English, and the mnemonic has something that would
   actually light up. It comments back with the exact change it would make, or with what is
   wrong, and labels the issue `applies-cleanly` or `needs-changes`. Editing the issue
   re-runs the check.
2. **On approval,** adding the `approved` label fires `suggestion-apply.yml`. It rewrites
   the one field on the one line, re-runs `check-data`, refuses to continue unless the diff
   is exactly one line in `data/entries.json` and nothing else, commits to `main`, comments,
   and closes the issue. Vercel redeploys from that commit.

The `approved` label is the gate, and only accounts with write access can add labels — so
the person who filed the issue cannot land their own change. That is deliberate: a public
dictionary that accepts anonymous writes straight to `main` gets vandalised. Approving is
one click.

`scripts/apply-suggestion.mjs` does the edit and never re-serialises the file: it replaces
the quoted value in place, then proves the bytes outside that line are unchanged, the field
order is unchanged, and every other field is identical. Run it locally to preview a change:

```bash
node scripts/apply-suggestion.mjs --char 灿 --pinyin càn --mnemonic "inCANdescent"
```

Without `--write` it validates and reports without touching anything.

Before committing a large edit, run the integrity check:

```bash
npm run check-data
```

It verifies field shape, tone values, duplicate readings, the one-object-per-line layout,
that every `crossRefs` entry has a reading of its own, that cluster slugs are routable, and
that every cluster character exists in `entries.json`. Failures exit non-zero; warnings are
printed but do not block.

Three known warnings, all harmless: 炮 `bāo`, 椎 `chuí` and 椎 `zhuī` have sibling readings
but empty `crossRefs`. The site derives sibling links from the data grouping rather than
from `crossRefs`, so those readings still cross-link correctly in both directions.

---

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export into out/
npm run check-data
```

`npm run dev` and `npm run build` both run `scripts/build-search-index.mjs` first (via
`predev`/`prebuild`), which regenerates `lib/generated/search-index.json` from
`data/entries.json`. That file is gitignored — it is always rebuilt, so it can never drift
from the data.

A production build writes `out/`: 3,203 pre-rendered pages, plus `sitemap.xml` and
`robots.txt`.

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | search-first home, demonstrating the mechanic on a real entry |
| `/char/[char]` | the entry page — every reading of one character (2,764 pages) |
| `/sound/[syllable]` | every character sharing a sound, grouped by tone (396 pages) |
| `/meaning/[slug]` | a near-synonym cluster, with what separates the members (33 pages) |
| `/meaning` | index of clusters |
| `/browse` | frequency bands with tone, cluster and invented-thread filters; full A–Z syllable index |
| `/practice` | spaced-repetition flashcards, scoped to a syllable group or a cluster |
| `/about` | how the mnemonics work, the invented threads, sources and licence |

Characters are percent-encoded in URLs: `/char/%E7%81%BF/` is 灿.

---

## How a few things work

**The highlight.** `lib/mnemonic.ts` handles the three conventions the data actually uses,
in order: a run of two or more capitals is the sound (`douBlEd`); failing that, scattered
single capitals are (`the mAlIgnant growth`, 87 entries); failing that, the whole mnemonic
is a lowercase word that simply sounds like the syllable (`anchor`, 131 entries). Runs win
outright, which keeps sentence-initial capitals and proper nouns out of the highlight. No
mnemonic ever renders unlit.

**The duplicated core line.** About three quarters of the mnemonics restate the core idea
before the dash — `"opened and spread, and one flat sheet — the JAmmed-open sheet"` against
a core of `"opened and spread; and one flat sheet"`. Printing both says the same thing
twice, so `coreAddsMeaning()` suppresses the core line when it is already contained in the
mnemonic. The mnemonic itself is always rendered whole and is never truncated. If those
prefixes are ever trimmed out of the data, the core line reappears on its own.

**Search.** `lib/search.ts`, a plain filter over a prebuilt tuple index. Ranked: exact
character, then exact syllable ignoring tones, then syllable prefix, then word-start in the
core or mnemonic, then substring — frequency breaking ties. Pinyin is matched with
diacritics stripped and `ü` folded to both `u` and `v`, so `zhang`, `zhāng`, `lu`, `lü` and
`lv` all work. The index is a lazily imported chunk, so nothing is downloaded until someone
reaches for the box, and there is no search API.

**Audio** uses the browser's own `SpeechSynthesis` with `zh-CN`, feature-detected and
hidden when unavailable. **Flashcard progress** is Leitner boxes in `localStorage`. Nothing
is sent anywhere and there are no accounts.

---

## Deployment

Vercel, from GitHub, on push to `main`. No `vercel.json` is needed: Vercel detects Next.js,
runs `npm run build`, and serves the `output: 'export'` result from `out/`. Nothing about
the build requires environment variables, secrets or a runtime.

---

## Attribution and licence

The character, pinyin, traditional-variant and gloss substrate derives from
[CC-CEDICT](https://cc-cedict.org/), used under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This attribution appears in
the site footer on every page and again on `/about`.

The core ideas, the mnemonics and the meaning clusters are original work by the site author,
published under the same CC BY-SA 4.0 licence.
