import { NextResponse } from "next/server";
import { getOverviewStats, getSubjectStats, getDailyProgressHistory } from "@/lib/progress";

export async function GET() {
  try {
    const overview = getOverviewStats();
    const subjects = getSubjectStats();
    const history = getDailyProgressHistory();

    return NextResponse.json({ overview, subjects, history });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
