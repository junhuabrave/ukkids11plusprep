import { getDb } from "./db";
import { seedQuestions } from "./seed";

export interface DailyProgress {
  date: string;
  sessions_completed: number;
  questions_answered: number;
  correct_answers: number;
  time_spent_seconds: number;
}

export interface SubjectStats {
  subject: string;
  total_answered: number;
  total_correct: number;
  accuracy: number;
}

export interface OverviewStats {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTimeMinutes: number;
  accuracy: number;
  streak: number;
  wrongQueueCount: number;
}

export function getDailyProgressHistory(
  userId: string = "default",
  days: number = 30
): DailyProgress[] {
  seedQuestions();
  const db = getDb();
  return db
    .prepare(
      `SELECT date, sessions_completed, questions_answered, correct_answers, time_spent_seconds
       FROM daily_progress
       WHERE user_id = ? AND date >= date('now', ?)
       ORDER BY date DESC`
    )
    .all(userId, `-${days} days`) as DailyProgress[];
}

export function getOverviewStats(userId: string = "default"): OverviewStats {
  seedQuestions();
  const db = getDb();

  const totals = db
    .prepare(
      `SELECT
         COUNT(*) as totalSessions,
         COALESCE(SUM(total_questions), 0) as totalQuestions,
         COALESCE(SUM(correct_answers), 0) as totalCorrect,
         COALESCE(SUM(duration_seconds), 0) as totalTimeSeconds
       FROM practice_sessions
       WHERE user_id = ? AND completed_at IS NOT NULL`
    )
    .get(userId) as Record<string, number>;

  const wrongCount = db
    .prepare(
      "SELECT COUNT(*) as cnt FROM wrong_questions WHERE user_id = ? AND mastered = 0"
    )
    .get(userId) as { cnt: number };

  // Calculate streak
  const progressDays = db
    .prepare(
      `SELECT date FROM daily_progress
       WHERE user_id = ? AND sessions_completed > 0
       ORDER BY date DESC`
    )
    .all(userId) as { date: string }[];

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = new Date(today);

  for (const row of progressDays) {
    const expected = checkDate.toISOString().split("T")[0];
    if (row.date === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalSessions: totals.totalSessions || 0,
    totalQuestions: totals.totalQuestions || 0,
    totalCorrect: totals.totalCorrect || 0,
    totalTimeMinutes: Math.round((totals.totalTimeSeconds || 0) / 60),
    accuracy:
      totals.totalQuestions > 0
        ? Math.round((totals.totalCorrect / totals.totalQuestions) * 100)
        : 0,
    streak,
    wrongQueueCount: wrongCount.cnt,
  };
}

export function getSubjectStats(userId: string = "default"): SubjectStats[] {
  seedQuestions();
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         q.subject,
         COUNT(*) as total_answered,
         SUM(sa.is_correct) as total_correct
       FROM session_answers sa
       JOIN questions q ON sa.question_id = q.id
       JOIN practice_sessions ps ON sa.session_id = ps.id
       WHERE ps.user_id = ?
       GROUP BY q.subject
       ORDER BY q.subject`
    )
    .all(userId) as { subject: string; total_answered: number; total_correct: number }[];

  return rows.map((r) => ({
    ...r,
    accuracy:
      r.total_answered > 0
        ? Math.round((r.total_correct / r.total_answered) * 100)
        : 0,
  }));
}
