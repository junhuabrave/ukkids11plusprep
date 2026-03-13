import { getDb } from "./db";
import { seedQuestions } from "./seed";

export interface Question {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  exam_board: string;
  difficulty: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hint: string | null;
}

function ensureSeeded() {
  seedQuestions();
}

function parseQuestion(row: Record<string, unknown>): Question {
  return {
    ...row,
    options: JSON.parse(row.options as string),
  } as Question;
}

export function getRandomQuestions(
  count: number,
  subject?: string,
  excludeIds?: string[]
): Question[] {
  ensureSeeded();
  const db = getDb();

  let query = "SELECT * FROM questions";
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (subject) {
    conditions.push("subject = ?");
    params.push(subject);
  }

  if (excludeIds && excludeIds.length > 0) {
    conditions.push(
      `id NOT IN (${excludeIds.map(() => "?").join(",")})`
    );
    params.push(...excludeIds);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY RANDOM() LIMIT ?";
  params.push(count);

  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map(parseQuestion);
}

export function getDailyPracticeQuestions(): Question[] {
  ensureSeeded();
  const db = getDb();

  const subjects = ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"];
  const allQuestions: Question[] = [];

  for (const subject of subjects) {
    const rows = db
      .prepare(
        "SELECT * FROM questions WHERE subject = ? ORDER BY RANDOM() LIMIT 4"
      )
      .all(subject) as Record<string, unknown>[];
    allQuestions.push(...rows.map(parseQuestion));
  }

  // Shuffle the combined questions
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return allQuestions;
}

export function getQuestionById(id: string): Question | null {
  ensureSeeded();
  const db = getDb();
  const row = db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? parseQuestion(row) : null;
}

export function getWrongQuestions(userId: string = "default"): Question[] {
  ensureSeeded();
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT q.* FROM questions q
       JOIN wrong_questions wq ON q.id = wq.question_id
       WHERE wq.user_id = ? AND wq.mastered = 0
       ORDER BY wq.wrong_count DESC, wq.last_wrong_at DESC`
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(parseQuestion);
}

export function getSubjects(): string[] {
  return ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"];
}

export function getTopicsForSubject(subject: string): string[] {
  ensureSeeded();
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT topic FROM questions WHERE subject = ? ORDER BY topic")
    .all(subject) as { topic: string }[];
  return rows.map((r) => r.topic);
}
