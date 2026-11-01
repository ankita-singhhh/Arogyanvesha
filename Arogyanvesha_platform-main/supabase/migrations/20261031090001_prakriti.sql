-- Migration 002: Prakriti Assessment Tables

CREATE TABLE IF NOT EXISTS prakriti_questions (
  id INT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT CHECK (category IN ('physical', 'mental', 'digestive', 'emotional', 'sleep')),
  order_index INT NOT NULL
);

CREATE TABLE IF NOT EXISTS prakriti_options (
  id TEXT PRIMARY KEY, -- e.g. 'q0_vata'
  question_id INT REFERENCES prakriti_questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  dosha TEXT CHECK (dosha IN ('vata', 'pitta', 'kapha'))
);

CREATE TABLE IF NOT EXISTS prakriti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vata_score INT NOT NULL,
  pitta_score INT NOT NULL,
  kapha_score INT NOT NULL,
  vata_pct INT NOT NULL,
  pitta_pct INT NOT NULL,
  kapha_pct INT NOT NULL,
  primary_dosha TEXT NOT NULL,
  secondary_dosha TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prakriti_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES prakriti_results(id) ON DELETE CASCADE,
  question_id INT REFERENCES prakriti_questions(id) ON DELETE CASCADE,
  option_id TEXT REFERENCES prakriti_options(id) ON DELETE CASCADE,
  dosha TEXT CHECK (dosha IN ('vata', 'pitta', 'kapha'))
);
