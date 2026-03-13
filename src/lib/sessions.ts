import { getDb } from "./db";
import { v4 as uuidv4 } from "uuid";

export interface PracticeSession {
  id: string;
  user_id: string;
  session_type: string;
  subject: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  total_questions: number;
  correct_answers: number;
}

export interface SessionAnswer {
  id: number;
  session_id: string;
  question_id: string;
  user_answer: string;
  is_correct: number;
  time_spent_seconds: number | null;
  answered_at: string;
}

export function createSession(
  sessionType: string = "daily",
  subject?: string,
  userId: string = "default"
): string {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    "INSERT INTO practice_sessions (id, user_id, session_type, subject) VALUES (?, ?, ?, ?)"
  ).run(id, userId, sessionType, subject || null);
  return id;
}

export function recordAnswer(
  sessionId: string,
  questionId: string,
  userAnswer: string,
  isCorrect: boolean,
  timeSpent?: number
) {
  const db = getDb();

  db.prepare(
    `INSERT INTO session_answers (session_id, question_id, user_answer, is_correct, time_spent_seconds)
     VALUES (?, ?, ?, ?, ?)`
  ).run(sessionId, questionId, userAnswer, isCorrect ? 1 : 0, timeSpent || null);

  // Update session stats
  db.prepare(
    `UPDATE practice_sessions
     SET total_questions = total_questions + 1,
         correct_answers = correct_answers + CASE WHEN ? THEN 1 ELSE 0 END
     WHERE id = ?`
  ).run(isCorrect ? 1 : 0, sessionId);

  // Track wrong questions
  if (!isCorrect) {
    db.prepare(
      `INSERT INTO wrong_questions (user_id, question_id, wrong_count, last_wrong_at)
       VALUES ((SELECT user_id FROM practice_sessions WHERE id = ?), ?, 1, datetime('now'))
       ON CONFLICT(user_id, question_id) DO UPDATE SET
         wrong_count = wrong_count + 1,
         last_wrong_at = datetime('now'),
         reviewed = 0`
    ).run(sessionId, questionId);
  }
}

export function completeSession(sessionId: string) {
  const db = getDb();
  const session = db
    .prepare("SELECT * FROM practice_sessions WHERE id = ?")
    .get(sessionId) as PracticeSession | undefined;

  if (!session) return null;

  const startedAt = new Date(session.started_at + "Z");
  const now = new Date();
  const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

  db.prepare(
    `UPDATE practice_sessions SET completed_at = datetime('now'), duration_seconds = ? WHERE id = ?`
  ).run(durationSeconds, sessionId);

  // Update daily progress
  const today = new Date().toISOString().split("T")[0];
  db.prepare(
    `INSERT INTO daily_progress (user_id, date, sessions_completed, questions_answered, correct_answers, time_spent_seconds)
     VALUES (?, ?, 1, ?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET
       sessions_completed = sessions_completed + 1,
       questions_answered = questions_answered + ?,
       correct_answers = correct_answers + ?,
       time_spent_seconds = time_spent_seconds + ?`
  ).run(
    session.user_id,
    today,
    session.total_questions,
    session.correct_answers,
    durationSeconds,
    session.total_questions,
    session.correct_answers,
    durationSeconds
  );

  return {
    ...session,
    completed_at: now.toISOString(),
    duration_seconds: durationSeconds,
  };
}

export function getSessionResults(sessionId: string) {
  const db = getDb();
  const session = db
    .prepare("SELECT * FROM practice_sessions WHERE id = ?")
    .get(sessionId) as PracticeSession | undefined;

  if (!session) return null;

  const answers = db
    .prepare(
      `SELECT sa.*, q.question_text, q.correct_answer, q.explanation, q.options, q.subject, q.topic
       FROM session_answers sa
       JOIN questions q ON sa.question_id = q.id
       WHERE sa.session_id = ?
       ORDER BY sa.answered_at`
    )
    .all(sessionId) as Record<string, unknown>[];

  return {
    session,
    answers: answers.map((a) => ({
      ...a,
      options: JSON.parse(a.options as string),
    })),
  };
}

export function markQuestionReviewed(questionId: string, userId: string = "default") {
  const db = getDb();
  db.prepare(
    "UPDATE wrong_questions SET reviewed = 1 WHERE question_id = ? AND user_id = ?"
  ).run(questionId, userId);
}

export function markQuestionMastered(questionId: string, userId: string = "default") {
  const db = getDb();
  db.prepare(
    "UPDATE wrong_questions SET mastered = 1 WHERE question_id = ? AND user_id = ?"
  ).run(questionId, userId);
}
