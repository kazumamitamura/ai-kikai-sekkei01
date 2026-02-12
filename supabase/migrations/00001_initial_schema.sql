-- ============================================================
-- 機械設計Ⅰ 学習支援プラットフォーム (sk01_)
-- 初期スキーマ — Master-Portfolio-DB 共存のため全テーブルに sk01_ プレフィックス
-- ⚠️ 完全にべき等（何度実行しても安全）
-- ============================================================

-- ----------------------------
-- 0. クリーンアップ（既存オブジェクトを安全に削除）
-- ----------------------------

-- ストレージポリシー削除
DROP POLICY IF EXISTS "sk01_bucket_teacher_upload"  ON storage.objects;
DROP POLICY IF EXISTS "sk01_bucket_auth_download"   ON storage.objects;
DROP POLICY IF EXISTS "sk01_bucket_teacher_delete"   ON storage.objects;

-- トリガー削除
DROP TRIGGER IF EXISTS on_sk01_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sk01_profiles_updated_at  ON sk01_profiles;
DROP TRIGGER IF EXISTS sk01_materials_updated_at ON sk01_materials;
DROP TRIGGER IF EXISTS sk01_quizzes_updated_at   ON sk01_quizzes;

-- テーブル削除（外部キー依存の逆順）
DROP TABLE IF EXISTS sk01_quiz_results CASCADE;
DROP TABLE IF EXISTS sk01_quizzes      CASCADE;
DROP TABLE IF EXISTS sk01_materials    CASCADE;
DROP TABLE IF EXISTS sk01_profiles     CASCADE;

-- 関数削除
DROP FUNCTION IF EXISTS handle_sk01_new_user();
DROP FUNCTION IF EXISTS sk01_update_updated_at();

-- ============================================================
-- 1. プロフィール (sk01_profiles)
-- ============================================================
CREATE TABLE sk01_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL CHECK (role IN ('teacher', 'student')) DEFAULT 'student',
  app_context TEXT NOT NULL DEFAULT 'sk01',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sk01_profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロフィールを参照
CREATE POLICY "sk01_profiles_select_own"
  ON sk01_profiles FOR SELECT
  USING (auth.uid() = id);

-- 自分のプロフィールを更新
CREATE POLICY "sk01_profiles_update_own"
  ON sk01_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 教員は全プロフィールを参照（成績管理用）
CREATE POLICY "sk01_profiles_select_teacher"
  ON sk01_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 2. 教材 (sk01_materials)
-- ============================================================
CREATE TABLE sk01_materials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES sk01_profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_path   TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  unit_name   TEXT DEFAULT '',
  page_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sk01_materials ENABLE ROW LEVEL SECURITY;

-- 教員: 自分の教材を参照
CREATE POLICY "sk01_materials_select_teacher"
  ON sk01_materials FOR SELECT
  USING (auth.uid() = teacher_id);

-- 教員: 自分の教材を作成
CREATE POLICY "sk01_materials_insert_teacher"
  ON sk01_materials FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- 教員: 自分の教材を更新
CREATE POLICY "sk01_materials_update_teacher"
  ON sk01_materials FOR UPDATE
  USING (auth.uid() = teacher_id);

-- 教員: 自分の教材を削除
CREATE POLICY "sk01_materials_delete_teacher"
  ON sk01_materials FOR DELETE
  USING (auth.uid() = teacher_id);

-- 生徒: 教材を参照
CREATE POLICY "sk01_materials_select_student"
  ON sk01_materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'student'
    )
  );

-- ============================================================
-- 3. クイズ / テスト (sk01_quizzes)
-- ============================================================
CREATE TABLE sk01_quizzes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id         UUID NOT NULL REFERENCES sk01_profiles(id) ON DELETE CASCADE,
  material_id        UUID REFERENCES sk01_materials(id) ON DELETE SET NULL,
  title              TEXT NOT NULL,
  description        TEXT DEFAULT '',
  unit_name          TEXT DEFAULT '',
  questions          JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_points       INTEGER NOT NULL DEFAULT 0,
  is_published       BOOLEAN NOT NULL DEFAULT false,
  published_at       TIMESTAMPTZ,
  time_limit_minutes INTEGER DEFAULT 60,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN sk01_quizzes.questions IS
'[{ "id":"q1", "type":"multiple_choice|short_answer|true_false",
    "question":"問題文", "options":["A","B","C","D"],
    "correct_answer":"正解", "explanation":"解説", "points":10 }]';

ALTER TABLE sk01_quizzes ENABLE ROW LEVEL SECURITY;

-- 教員: 自分のクイズを参照
CREATE POLICY "sk01_quizzes_select_teacher"
  ON sk01_quizzes FOR SELECT
  USING (auth.uid() = teacher_id);

-- 教員: クイズを作成
CREATE POLICY "sk01_quizzes_insert_teacher"
  ON sk01_quizzes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- 教員: 自分のクイズを更新
CREATE POLICY "sk01_quizzes_update_teacher"
  ON sk01_quizzes FOR UPDATE
  USING (auth.uid() = teacher_id);

-- 教員: 自分のクイズを削除
CREATE POLICY "sk01_quizzes_delete_teacher"
  ON sk01_quizzes FOR DELETE
  USING (auth.uid() = teacher_id);

-- 生徒: 公開済みクイズを参照
CREATE POLICY "sk01_quizzes_select_student"
  ON sk01_quizzes FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'student'
    )
  );

-- ============================================================
-- 4. テスト結果 (sk01_quiz_results)
-- ============================================================
CREATE TABLE sk01_quiz_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID NOT NULL REFERENCES sk01_quizzes(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES sk01_profiles(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL DEFAULT '[]'::jsonb,
  score        INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage   NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN sk01_quiz_results.answers IS
'[{ "question_id":"q1", "student_answer":"回答",
    "is_correct":true, "points_earned":10 }]';

ALTER TABLE sk01_quiz_results ENABLE ROW LEVEL SECURITY;

-- 生徒: 自分の結果を参照
CREATE POLICY "sk01_quiz_results_select_student"
  ON sk01_quiz_results FOR SELECT
  USING (auth.uid() = student_id);

-- 生徒: 結果を作成
CREATE POLICY "sk01_quiz_results_insert_student"
  ON sk01_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- 教員: 全結果を参照
CREATE POLICY "sk01_quiz_results_select_teacher"
  ON sk01_quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 5. 自動プロフィール作成トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION handle_sk01_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'app_context' = 'sk01' THEN
    INSERT INTO sk01_profiles (id, email, full_name, role, app_context)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
      'sk01'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sk01_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_sk01_new_user();

-- ============================================================
-- 6. updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION sk01_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sk01_profiles_updated_at
  BEFORE UPDATE ON sk01_profiles
  FOR EACH ROW EXECUTE FUNCTION sk01_update_updated_at();

CREATE TRIGGER sk01_materials_updated_at
  BEFORE UPDATE ON sk01_materials
  FOR EACH ROW EXECUTE FUNCTION sk01_update_updated_at();

CREATE TRIGGER sk01_quizzes_updated_at
  BEFORE UPDATE ON sk01_quizzes
  FOR EACH ROW EXECUTE FUNCTION sk01_update_updated_at();

-- ============================================================
-- 7. ストレージバケット (sk01_bucket)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sk01_bucket', 'sk01_bucket', false)
ON CONFLICT (id) DO NOTHING;

-- 教員のみアップロード可能
CREATE POLICY "sk01_bucket_teacher_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sk01_bucket'
    AND EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- 認証済みユーザーはダウンロード可能
CREATE POLICY "sk01_bucket_auth_download"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sk01_bucket'
    AND auth.uid() IS NOT NULL
  );

-- 教員のみ削除可能
CREATE POLICY "sk01_bucket_teacher_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sk01_bucket'
    AND EXISTS (
      SELECT 1 FROM sk01_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );
