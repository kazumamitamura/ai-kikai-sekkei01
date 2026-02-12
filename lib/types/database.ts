/**
 * 機械設計Ⅰ プラットフォーム — データベース型定義
 * 全型名に sk01_ プレフィックスを使用
 */

// ロール定義
export type Sk01Role = "teacher" | "student";

// プロフィール (sk01_profiles)
export interface Sk01Profile {
  id: string;
  email: string;
  full_name: string;
  role: Sk01Role;
  app_context: string;
  created_at: string;
  updated_at: string;
}

// 教材 (sk01_materials)
export interface Sk01Material {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  unit_name: string;
  page_count: number;
  created_at: string;
  updated_at: string;
}

// クイズの問題
export type Sk01QuestionType = "multiple_choice" | "short_answer" | "true_false";

export interface Sk01Question {
  id: string;
  type: Sk01QuestionType;
  question: string; // LaTeX 記法を含む場合がある
  options?: string[]; // multiple_choice の場合
  correct_answer: string;
  explanation: string;
  points: number;
}

// クイズ (sk01_quizzes)
export interface Sk01Quiz {
  id: string;
  teacher_id: string;
  material_id: string | null;
  title: string;
  description: string;
  unit_name: string;
  questions: Sk01Question[];
  total_points: number;
  is_published: boolean;
  published_at: string | null;
  time_limit_minutes: number;
  created_at: string;
  updated_at: string;
}

// 回答
export interface Sk01Answer {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  points_earned: number;
}

// テスト結果 (sk01_quiz_results)
export interface Sk01QuizResult {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Sk01Answer[];
  score: number;
  total_points: number;
  percentage: number;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
}
