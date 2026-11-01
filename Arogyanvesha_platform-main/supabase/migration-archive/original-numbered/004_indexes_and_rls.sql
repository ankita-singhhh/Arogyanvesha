-- Migration 004: Indexes, Full-Text Search, and RLS Policies

-- 1. Create Core Indexes
CREATE INDEX IF NOT EXISTS idx_prakriti_results_user_id ON prakriti_results(user_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_results_completed_at ON prakriti_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_routine_logs_user_date ON routine_logs(user_id, completed_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yoga_completions_user_id ON yoga_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_date ON health_scores(user_id, computed_at DESC);

-- 2. Full-Text Search Configuration
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE herbs ADD COLUMN IF NOT EXISTS fts tsvector;
CREATE INDEX IF NOT EXISTS idx_herbs_fts ON herbs USING GIN(fts);
CREATE OR REPLACE FUNCTION herbs_trigger() RETURNS trigger AS $$
begin
  new.fts :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.sanskrit_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON herbs;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON herbs
FOR EACH ROW EXECUTE FUNCTION herbs_trigger();

ALTER TABLE wisdom_articles ADD COLUMN IF NOT EXISTS fts tsvector;
CREATE INDEX IF NOT EXISTS idx_wisdom_articles_fts ON wisdom_articles USING GIN(fts);
CREATE OR REPLACE FUNCTION wisdom_articles_trigger() RETURNS trigger AS $$
begin
  new.fts :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON wisdom_articles;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON wisdom_articles
FOR EACH ROW EXECUTE FUNCTION wisdom_articles_trigger();

-- 3. Enable RLS on every table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE herb_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_analyses ENABLE ROW LEVEL SECURITY;

-- 4. Define Policies
CREATE POLICY user_self_policy ON users FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY reset_tokens_self_policy ON password_reset_tokens FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY prakriti_results_self ON prakriti_results FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY prakriti_answers_self ON prakriti_answers FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM prakriti_results WHERE id = result_id));
CREATE POLICY chat_conv_self ON chat_conversations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chat_msg_self ON chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chat_usage_self ON chat_usage FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY skin_self ON skin_analyses FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY yoga_comp_self ON yoga_completions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY yoga_fav_self ON yoga_favorites FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY herb_bk_self ON herb_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY article_read_self ON article_reads FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY article_bk_self ON article_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY routine_logs_self ON routine_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY activity_self ON activity_log FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY health_self ON health_scores FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY notifications_self ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY push_self ON push_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY subscriptions_self ON subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY payments_self ON payments FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY settings_self ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY user_ach_self ON user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY symptom_self ON symptom_analyses FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 5. Public read access to library tables
CREATE POLICY read_questions ON prakriti_questions FOR SELECT TO public USING (true);
CREATE POLICY read_options ON prakriti_options FOR SELECT TO public USING (true);
CREATE POLICY read_yoga_sessions ON yoga_sessions FOR SELECT TO public USING (true);
CREATE POLICY read_herbs ON herbs FOR SELECT TO public USING (true);
CREATE POLICY read_wisdom ON wisdom_articles FOR SELECT TO public USING (true);
CREATE POLICY read_routine_practices ON routine_practices FOR SELECT TO public USING (true);
CREATE POLICY read_achievements ON achievements FOR SELECT TO public USING (true);
