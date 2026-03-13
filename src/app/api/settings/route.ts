import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedQuestions } from "@/lib/seed";

function ensureSettingsTable() {
  seedQuestions();
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY DEFAULT 'default',
      child_name TEXT DEFAULT '',
      child_age INTEGER DEFAULT 10,
      target_exam TEXT DEFAULT 'both',
      daily_goal_minutes INTEGER DEFAULT 15,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export async function GET() {
  try {
    ensureSettingsTable();
    const db = getDb();

    let settings = db
      .prepare("SELECT * FROM user_settings WHERE user_id = ?")
      .get("default") as Record<string, unknown> | undefined;

    if (!settings) {
      db.prepare(
        "INSERT INTO user_settings (user_id) VALUES (?)"
      ).run("default");
      settings = db
        .prepare("SELECT * FROM user_settings WHERE user_id = ?")
        .get("default") as Record<string, unknown>;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSettingsTable();
    const db = getDb();
    const body = await request.json();
    const { child_name, child_age, target_exam, daily_goal_minutes } = body;

    db.prepare(
      `INSERT INTO user_settings (user_id, child_name, child_age, target_exam, daily_goal_minutes, updated_at)
       VALUES ('default', ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         child_name = ?,
         child_age = ?,
         target_exam = ?,
         daily_goal_minutes = ?,
         updated_at = datetime('now')`
    ).run(
      child_name, child_age, target_exam, daily_goal_minutes,
      child_name, child_age, target_exam, daily_goal_minutes
    );

    const settings = db
      .prepare("SELECT * FROM user_settings WHERE user_id = ?")
      .get("default");

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
