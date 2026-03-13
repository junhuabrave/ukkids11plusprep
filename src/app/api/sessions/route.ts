import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  recordAnswer,
  recordUnanswered,
  completeSession,
  getSessionResults,
  markQuestionReviewed,
  markQuestionMastered,
} from "@/lib/sessions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const { sessionType, subject } = body;
        const sessionId = createSession(sessionType, subject);
        return NextResponse.json({ sessionId });
      }

      case "answer": {
        const { sessionId, questionId, userAnswer, isCorrect, timeSpent } = body;
        recordAnswer(sessionId, questionId, userAnswer, isCorrect, timeSpent);
        return NextResponse.json({ success: true });
      }

      case "unanswered": {
        const { sessionId: uSid, questionIds } = body;
        recordUnanswered(uSid, questionIds);
        return NextResponse.json({ success: true });
      }

      case "complete": {
        const { sessionId: sid } = body;
        const result = completeSession(sid);
        return NextResponse.json({ result });
      }

      case "results": {
        const { sessionId: rsid } = body;
        const results = getSessionResults(rsid);
        return NextResponse.json({ results });
      }

      case "review": {
        const { questionId: qid } = body;
        markQuestionReviewed(qid);
        return NextResponse.json({ success: true });
      }

      case "master": {
        const { questionId: mqid } = body;
        markQuestionMastered(mqid);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Failed to process session action" },
      { status: 500 }
    );
  }
}
