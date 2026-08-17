# Logical Chinese

A database of Chinese characters grouped by their **root** — the phonetic or
semantic component that a family of characters shares. E.g. 侯 is the root
for 候, 猴, 喉.

Built with Next.js (App Router) + TypeScript + Tailwind. All data lives in
plain JSON files, statically generated at build time — no database needed.

## Why one page per *root*, not per *character*

If every single derived character got its own page, a modestly complete
database could mean thousands of statically generated routes. Instead, all
characters that share a root live on **one page** (`/root/<id>`), each in
its own anchored section (`/root/hou#候`). This keeps the number of routes
equal to the number of *root groups* you've added (realistically dozens to a
few hundred), while every character still gets a stable, shareable,
directly-linkable URL. Search finds individual characters instantly and
jumps straight to their section.

## Project structure

```
data/roots/*.json      one file per root character — this is your database
lib/data.ts             reads & indexes the JSON files at build time
app/page.tsx             homepage: search + grid of all roots
app/root/[id]/page.tsx   one page per root, listing all derived characters
components/              SearchBar, RootCard
scripts/                 CLI helpers (see below)
```

## Adding a new root group

1. Scaffold a new file:

   ```bash
   npm run new-root -- --char 侯 --id hou --derived 候,猴,喉
   ```

   This creates `data/roots/hou.json` with empty fields.

2. Auto-fill pinyin & a basic dictionary meaning from **CC-CEDICT** (a free,
   open-source Chinese-English dictionary):

   ```bash
   npm run enrich
   ```

   This only fills in blank `pinyin` / `meaning` fields — it never touches
   `aiDefinition`, `description`, or anything you've already written. Run
   with `-- --force` if you ever want it to overwrite existing values.

3. Open `data/roots/hou.json` and paste in the AI-generated definition for
   each character into its `aiDefinition` field. Optionally fill in the
   root's `description` (the etymological/logical link) and any `examples`
   (compound words).

4. Validate everything is well-formed before committing:

   ```bash
   npm run validate
   ```

5. Run the dev server to check it looks right:

   ```bash
   npm run dev
   ```

### JSON shape reference

```jsonc
{
  "id": "hou",              // must match the filename
  "character": "侯",
  "pinyin": "hóu",
  "meaning": "marquis; nobleman",
  "description": "optional paragraph on the etymology/logic of this root",
  "derived": [
    {
      "character": "候",
      "pinyin": "hòu",
      "meaning": "short dictionary gloss",
      "aiDefinition": "your longer AI-written explanation goes here",
      "examples": [
        { "word": "等候", "pinyin": "děng hòu", "meaning": "to wait" }
      ]
    }
  ]
}
```

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploying

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and
   deploy — no configuration needed, Vercel auto-detects Next.js.
3. Every time you add a root JSON file and push to `main`, Vercel rebuilds
   and redeploys automatically.

## Scripts

| Command                | What it does                                                |
| ----------------------- | ------------------------------------------------------------ |
| `npm run new-root`     | Scaffold a new `data/roots/<id>.json` file                  |
| `npm run enrich`       | Fill blank pinyin/meaning fields from CC-CEDICT              |
| `npm run validate`     | Check all root files are well-formed and free of duplicates  |
| `npm run dev`          | Local dev server                                             |
| `npm run build`        | Production build (also what Vercel runs)                     |
