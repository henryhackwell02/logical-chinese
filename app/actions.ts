"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addCharacter,
  deleteCharacter,
  updateCharacter,
  type Example,
} from "@/lib/characters";
import { checkPassword, setAdminCookie, clearAdminCookie, isAdmin } from "@/lib/auth";
import { parseNumberedPinyin } from "@/lib/pinyin";

function parseExamplesFromForm(formData: FormData): Example[] {
  const words = formData.getAll("example_word") as string[];
  const pinyins = formData.getAll("example_pinyin") as string[];
  const meanings = formData.getAll("example_meaning") as string[];

  const examples: Example[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = (words[i] ?? "").trim();
    const pinyin = (pinyins[i] ?? "").trim();
    const meaning = (meanings[i] ?? "").trim();
    if (word || pinyin || meaning) examples.push({ word, pinyin, meaning });
  }
  return examples;
}

function requireAdmin() {
  if (!isAdmin()) throw new Error("Not authorized. Please log in first.");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    redirect("/login?error=1");
  }
  setAdminCookie(password);
  redirect("/");
}

export async function logoutAction() {
  clearAdminCookie();
  redirect("/");
}

export async function createCharacterAction(formData: FormData) {
  requireAdmin();

  const character = String(formData.get("character") ?? "").trim();
  const pinyinRaw = String(formData.get("pinyin") ?? "").trim();
  const meaning = String(formData.get("meaning") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const memoryTrick = String(formData.get("memory_trick") ?? "").trim();

  const parsed = parseNumberedPinyin(pinyinRaw);
  if (!character || !parsed) {
    throw new Error(
      `Invalid input. Character and numbered pinyin (e.g. "huang2") are required.`
    );
  }

  await addCharacter({
    character,
    sound_base: parsed.base,
    tone: parsed.tone,
    meaning,
    definition,
    memory_trick: memoryTrick,
    examples: parseExamplesFromForm(formData),
  });

  revalidatePath("/");
  revalidatePath(`/sound/${parsed.base}`);
  redirect(`/sound/${parsed.base}`);
}

export async function updateCharacterAction(formData: FormData) {
  requireAdmin();

  const id = String(formData.get("id") ?? "");
  const character = String(formData.get("character") ?? "").trim();
  const pinyinRaw = String(formData.get("pinyin") ?? "").trim();
  const meaning = String(formData.get("meaning") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const memoryTrick = String(formData.get("memory_trick") ?? "").trim();

  const parsed = parseNumberedPinyin(pinyinRaw);
  if (!id || !character || !parsed) {
    throw new Error(
      `Invalid input. Character and numbered pinyin (e.g. "huang2") are required.`
    );
  }

  await updateCharacter(id, {
    character,
    sound_base: parsed.base,
    tone: parsed.tone,
    meaning,
    definition,
    memory_trick: memoryTrick,
    examples: parseExamplesFromForm(formData),
  });

  revalidatePath("/");
  revalidatePath(`/sound/${parsed.base}`);
  redirect(`/sound/${parsed.base}`);
}

export async function deleteCharacterAction(formData: FormData) {
  requireAdmin();

  const id = String(formData.get("id") ?? "");
  const soundBase = String(formData.get("sound_base") ?? "");
  if (!id) throw new Error("Missing id.");

  await deleteCharacter(id);

  revalidatePath("/");
  if (soundBase) revalidatePath(`/sound/${soundBase}`);
  redirect(soundBase ? `/sound/${soundBase}` : "/");
}
