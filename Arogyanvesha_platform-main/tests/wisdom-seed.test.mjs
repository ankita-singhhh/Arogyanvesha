import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const seed = readFileSync("supabase/seeds/seeds.sql", "utf8");
const wisdomSeed = readFileSync("supabase/seeds/wisdom_articles_seed.sql", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const articleRows = [...wisdomSeed.matchAll(/^  \('([^']+)','([^']+)','([^']+)','([^']+)',(\d+),(true|false),'([^']+)'\),?$/gm)];
const requiredCategories = [
  "Ayurveda Fundamentals", "Doshas & Prakriti", "Food & Nutrition", "Dinacharya (Daily Routine)",
  "Ritucharya (Seasonal Wellness)", "Herbs & Botanicals", "Yoga & Asanas", "Pranayama & Meditation",
  "Traditional Wellness Practices", "Sleep & Stress Management", "Healthy Lifestyle & Prevention",
];

test("Wisdom expansion has at least 100 valid and unique article rows", () => {
  assert.ok(articleRows.length >= 100, `expected at least 100 new articles, received ${articleRows.length}`);
  const slugs = articleRows.map((row) => row[1]);
  assert.equal(new Set(slugs).size, slugs.length, "new article slugs must be unique");
  for (const [, slug, title, excerpt, category, minutes, featured, guidance] of articleRows) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${slug} is not URL-safe`);
    assert.ok(title.length >= 8 && excerpt.length >= 20 && guidance.length >= 30, `${slug} has incomplete required text`);
    assert.ok(Number(minutes) >= 4 && Number(minutes) <= 10, `${slug} has unrealistic read time`);
    assert.ok(featured === "true" || featured === "false");
    assert.ok(requiredCategories.includes(category), `${slug} has an unsupported category`);
  }
});

test("Wisdom expansion covers every requested category and preserves the legacy collection", () => {
  const categories = new Map();
  for (const row of articleRows) categories.set(row[4], (categories.get(row[4]) ?? 0) + 1);
  for (const category of requiredCategories) assert.ok((categories.get(category) ?? 0) >= 8, `${category} needs balanced coverage`);
  const legacyBlock = seed.split("-- 7. Wisdom Articles")[1]?.split("\\ir wisdom_articles_seed.sql")[0] ?? "";
  const legacySlugs = [...legacyBlock.matchAll(/^\('([^']+)'/gm)].map((match) => match[1]);
  assert.equal(legacySlugs.length, 13, "the original 13 Wisdom articles must remain in the local seed");
  assert.equal(new Set([...legacySlugs, ...articleRows.map((row) => row[1])]).size, legacySlugs.length + articleRows.length, "new slugs must not collide with legacy Wisdom articles");
  assert.match(config, /sql_paths = \["\.\/seeds\/seeds\.sql"\]/);
});

test("Wisdom SQL uses a safe slug upsert and published workflow", () => {
  assert.match(wisdomSeed, /is_published\)/);
  assert.match(wisdomSeed, /true\nFROM articles/);
  assert.match(wisdomSeed, /ON CONFLICT \(slug\) DO UPDATE/);
  assert.match(wisdomSeed, /# %s\\n\\n## Overview/);
  assert.doesNotMatch(wisdomSeed, /^\s*(?:DELETE|TRUNCATE|DROP)\b/im);
});
