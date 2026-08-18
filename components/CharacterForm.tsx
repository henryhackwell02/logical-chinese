"use client";

import { useState } from "react";
import type { Example } from "@/lib/characters";

type Props = {
  action: (formData: FormData) => void;
  initial?: {
    id?: string;
    character?: string;
    pinyin?: string; // numbered, e.g. "huang2"
    meaning?: string;
    definition?: string;
    memory_trick?: string;
    examples?: Example[];
  };
  submitLabel: string;
};

export default function CharacterForm({ action, initial, submitLabel }: Props) {
  const [character, setCharacter] = useState(initial?.character ?? "");
  const [pinyin, setPinyin] = useState(initial?.pinyin ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [examples, setExamples] = useState<Example[]>(
    initial?.examples && initial.examples.length > 0
      ? initial.examples
      : [{ word: "", pinyin: "", meaning: "" }]
  );
  const [lookupState, setLookupState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "error"; message: string }
  >({ status: "idle" });

  async function handleLookup() {
    if (!character) return;
    setLookupState({ status: "loading" });
    try {
      const res = await fetch(`/api/lookup?char=${encodeURIComponent(character)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      if (data.results?.length > 0) {
        const best = data.results[0];
        setPinyin(best.pinyin);
        setMeaning(best.meaning);
      }
      setLookupState({ status: "idle" });
    } catch (e) {
      setLookupState({
        status: "error",
        message: e instanceof Error ? e.message : "Lookup failed",
      });
    }
  }

  function updateExample(i: number, field: keyof Example, value: string) {
    setExamples((prev) =>
      prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex))
    );
  }

  function addExampleRow() {
    setExamples((prev) => [...prev, { word: "", pinyin: "", meaning: "" }]);
  }

  function removeExampleRow(i: number) {
    setExamples((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={action} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Character
          </label>
          <div className="mt-1 flex gap-2">
            <input
              name="character"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              required
              className="font-hanzi text-2xl w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="候"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={!character || lookupState.status === "loading"}
              className="shrink-0 rounded-lg border border-stone-300 px-3 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-50"
              title="Auto-fill pinyin & meaning from CC-CEDICT"
            >
              {lookupState.status === "loading" ? "Looking up…" : "Look up"}
            </button>
          </div>
          {lookupState.status === "error" && (
            <p className="mt-1 text-xs text-red-600">{lookupState.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Pinyin (numbered, e.g. huang2)
          </label>
          <input
            name="pinyin"
            value={pinyin}
            onChange={(e) => setPinyin(e.target.value)}
            required
            pattern="[a-zA-Z]+[1-5]"
            title="Letters followed by a tone number 1-5, e.g. huang2"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            placeholder="hou4"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Short meaning
        </label>
        <input
          name="meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          placeholder="to wait; time; season"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Definition
        </label>
        <textarea
          name="definition"
          defaultValue={initial?.definition ?? ""}
          rows={8}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm"
          placeholder="Paste the AI-generated definition here…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Memory trick
        </label>
        <textarea
          name="memory_trick"
          defaultValue={initial?.memory_trick ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          placeholder="A mnemonic hook to remember this character…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Example words
        </label>
        <div className="mt-2 space-y-2">
          {examples.map((ex, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="example_word"
                value={ex.word}
                onChange={(e) => updateExample(i, "word", e.target.value)}
                className="font-hanzi w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                placeholder="等候"
              />
              <input
                name="example_pinyin"
                value={ex.pinyin}
                onChange={(e) => updateExample(i, "pinyin", e.target.value)}
                className="w-28 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                placeholder="děng hòu"
              />
              <input
                name="example_meaning"
                value={ex.meaning}
                onChange={(e) => updateExample(i, "meaning", e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                placeholder="to wait"
              />
              <button
                type="button"
                onClick={() => removeExampleRow(i)}
                className="text-stone-400 hover:text-red-700 px-2"
                aria-label="Remove example"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExampleRow}
          className="mt-2 text-sm text-red-700 hover:underline"
        >
          + Add example
        </button>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-red-700 text-white px-5 py-2.5 font-medium hover:bg-red-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
