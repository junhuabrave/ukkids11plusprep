"use client";

import { useEffect, useState } from "react";
import ChatBot from "@/components/ChatBot";

interface OverviewStats {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTimeMinutes: number;
  accuracy: number;
  streak: number;
  wrongQueueCount: number;
}

interface SubjectStat {
  subject: string;
  total_answered: number;
  total_correct: number;
  accuracy: number;
}

interface DailyProgress {
  date: string;
  sessions_completed: number;
  questions_answered: number;
  correct_answers: number;
  time_spent_seconds: number;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.overview);
        setSubjects(data.subjects);
        setHistory(data.history);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading progress...</p>
        </div>
      </div>
    );
  }

  const subjectConfig: Record<string, { color: string; barColor: string; icon: string }> = {
    Maths: { color: "text-blue-700", barColor: "bg-blue-500", icon: "🔢" },
    English: { color: "text-green-700", barColor: "bg-green-500", icon: "📖" },
    "Verbal Reasoning": { color: "text-purple-700", barColor: "bg-purple-500", icon: "🧩" },
    "Non-Verbal Reasoning": { color: "text-orange-700", barColor: "bg-orange-500", icon: "🔷" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Progress</h1>
        <p className="text-gray-600">Track your 11+ preparation journey</p>
      </div>

      {/* Overview stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Day Streak</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.streak}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Questions Answered</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalQuestions}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Overall Accuracy</div>
            <div className="text-3xl font-bold text-green-600">{stats.accuracy}%</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalCorrect}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Time Practised</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalTimeMinutes} min</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">To Review</div>
            <div className="text-3xl font-bold text-amber-600">{stats.wrongQueueCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Avg. Accuracy</div>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalQuestions > 0
                ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Subject breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Subject Breakdown</h2>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Complete some practice sessions to see your subject breakdown.
          </p>
        ) : (
          <div className="space-y-4">
            {subjects.map((sub) => {
              const config = subjectConfig[sub.subject] || {
                color: "text-gray-700",
                barColor: "bg-gray-500",
                icon: "📝",
              };
              return (
                <div key={sub.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span className={`font-medium ${config.color}`}>
                        {sub.subject}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {sub.total_correct}/{sub.total_answered} correct ({sub.accuracy}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${config.barColor} transition-all`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No activity yet. Start practising to see your history!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-2 font-medium text-gray-600">Date</th>
                  <th className="pb-2 font-medium text-gray-600">Sessions</th>
                  <th className="pb-2 font-medium text-gray-600">Questions</th>
                  <th className="pb-2 font-medium text-gray-600">Correct</th>
                  <th className="pb-2 font-medium text-gray-600">Accuracy</th>
                  <th className="pb-2 font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((day) => {
                  const accuracy = day.questions_answered > 0
                    ? Math.round((day.correct_answers / day.questions_answered) * 100)
                    : 0;
                  const mins = Math.round(day.time_spent_seconds / 60);
                  return (
                    <tr key={day.date} className="border-b border-gray-100">
                      <td className="py-2 font-medium">
                        {new Date(day.date + "T00:00:00").toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-2">{day.sessions_completed}</td>
                      <td className="py-2">{day.questions_answered}</td>
                      <td className="py-2 text-green-600">{day.correct_answers}</td>
                      <td className="py-2">
                        <span
                          className={`font-medium ${
                            accuracy >= 80
                              ? "text-green-600"
                              : accuracy >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {accuracy}%
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{mins} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
