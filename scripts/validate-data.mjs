#!/usr/bin/env node
// Sanity-checks every data/roots/*.json file: required fields present,
// no duplicate root ids, no duplicate characters across roots.

import fs from "node:fs";
import path from "node:path";

const ROOTS_DIR = path.join(process.cwd(), "data", "roots");
const REQUIRED_ROOT_FIELDS = ["id", "character", "pinyin", "meaning", "derived"];
const REQUIRED_CHAR_FIELDS = ["character", "pinyin", "meaning", "aiDefinition"];

let errors = 0;
const seenIds = new Set();
const seenChars = new Map(); // character -> root id

if (!fs.existsSync(ROOTS_DIR)) {
  console.error(`Missing directory: ${ROOTS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(ROOTS_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.warn("No root files found in data/roots/. Nothing to validate.");
}

for (const file of files) {
  const filePath = path.join(ROOTS_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON (${e.message})`);
    errors++;
    continue;
  }

  for (const field of REQUIRED_ROOT_FIELDS) {
    if (data[field] === undefined) {
      console.error(`✗ ${file}: missing root field "${field}"`);
      errors++;
    }
  }

  if (data.id && data.id !== path.basename(file, ".json")) {
    console.error(
      `✗ ${file}: "id" (${data.id}) should match filename (${path.basename(
        file,
        ".json"
      )})`
    );
    errors++;
  }

  if (data.id) {
    if (seenIds.has(data.id)) {
      console.error(`✗ ${file}: duplicate root id "${data.id}"`);
      errors++;
    }
    seenIds.add(data.id);
  }

  if (data.character) {
    if (seenChars.has(data.character)) {
      console.error(
        `✗ ${file}: root character "${data.character}" already used in ${seenChars.get(
          data.character
        )}`
      );
      errors++;
    }
    seenChars.set(data.character, file);
  }

  for (const child of data.derived ?? []) {
    for (const field of REQUIRED_CHAR_FIELDS) {
      if (!child[field]) {
        console.error(
          `✗ ${file}: character "${child.character ?? "?"}" missing "${field}"`
        );
        errors++;
      }
    }
    if (child.aiDefinition?.startsWith("REPLACE ME")) {
      console.warn(
        `  ⚠ ${file}: "${child.character}" still has a placeholder aiDefinition`
      );
    }
    if (child.character) {
      if (seenChars.has(child.character)) {
        console.error(
          `✗ ${file}: character "${child.character}" already used in ${seenChars.get(
            child.character
          )}`
        );
        errors++;
      }
      seenChars.set(child.character, file);
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log(`✓ All ${files.length} root file(s) valid.`);
}
