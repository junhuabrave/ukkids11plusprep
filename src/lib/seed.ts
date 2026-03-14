import { getDb } from "./db";
import { questions } from "../data/questions";

export function seedQuestions() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as cnt FROM questions").get() as {
    cnt: number;
  };

  // Re-seed if question count doesn't match (new questions added)
  if (count.cnt >= questions.length) return;

  // Add exam_level column if it doesn't exist (migration for existing databases)
  try {
    db.exec("ALTER TABLE questions ADD COLUMN exam_level TEXT NOT NULL DEFAULT '11+'");
  } catch {
    // Column already exists
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO questions (id, subject, topic, subtopic, exam_board, exam_level, difficulty, question_text, question_type, options, correct_answer, explanation, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items: typeof questions) => {
    for (const q of items) {
      insert.run(
        q.id,
        q.subject,
        q.topic,
        q.subtopic || null,
        q.exam_board,
        q.exam_level || "11+",
        q.difficulty,
        q.question_text,
        q.question_type,
        JSON.stringify(q.options),
        q.correct_answer,
        q.explanation,
        q.hint || null
      );
    }
  });

  insertMany(questions);
}
