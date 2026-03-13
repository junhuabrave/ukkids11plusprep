import { getDb } from "./db";
import { questions } from "../data/questions";

export function seedQuestions() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as cnt FROM questions").get() as {
    cnt: number;
  };

  if (count.cnt > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO questions (id, subject, topic, subtopic, exam_board, difficulty, question_text, question_type, options, correct_answer, explanation, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items: typeof questions) => {
    for (const q of items) {
      insert.run(
        q.id,
        q.subject,
        q.topic,
        q.subtopic || null,
        q.exam_board,
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
