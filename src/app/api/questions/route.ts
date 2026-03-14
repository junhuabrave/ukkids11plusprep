import { NextRequest, NextResponse } from "next/server";
import {
  getDailyPracticeQuestions,
  getRandomQuestions,
  getWrongQuestions,
  getSubjects,
  getTopicsForSubject,
} from "@/lib/questions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const subject = searchParams.get("subject");
  const count = parseInt(searchParams.get("count") || "10");
  const examLevel = searchParams.get("examLevel") || undefined;

  try {
    if (type === "daily") {
      const questions = getDailyPracticeQuestions(examLevel);
      return NextResponse.json({ questions });
    }

    if (type === "wrong") {
      const questions = getWrongQuestions();
      return NextResponse.json({ questions });
    }

    if (type === "subjects") {
      const subjects = getSubjects();
      return NextResponse.json({ subjects });
    }

    if (type === "topics" && subject) {
      const topics = getTopicsForSubject(subject);
      return NextResponse.json({ topics });
    }

    const questions = getRandomQuestions(count, subject || undefined, undefined, examLevel);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
