-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- to create the table Logical Chinese needs.

create extension if not exists pgcrypto;

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  character text not null,
  sound_base text not null,       -- pinyin syllable without tone, e.g. "huang"
  tone smallint not null check (tone between 1 and 5), -- 5 = neutral tone
  meaning text not null default '',
  definition text not null default '',
  memory_trick text not null default '',
  examples jsonb not null default '[]'::jsonb, -- [{ "word": "..", "pinyin": "..", "meaning": ".." }]
  created_at timestamptz not null default now(),
  unique (character, sound_base, tone)
);

create index if not exists characters_sound_base_idx on characters (sound_base);
