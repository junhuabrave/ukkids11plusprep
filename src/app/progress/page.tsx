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

function AccuracyChart({ history }: { history: DailyProgress[] }) {
  if (history.length === 0) return null;

  const data = history.slice(-14).map((day) => ({
    date: day.date,
    accuracy:
      day.questions_answered > 0
        ? Math.round((day.correct_answers / day.questions_answered) * 100)
        : 0,
    questions: day.questions_answered,
  }));

  const maxQuestions = Math.max(...data.map((d) => d.questions), 1);
  const chartHeight = 160;
  const chartWidth = 100;
  const barWidth = chartWidth / data.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Daily Accuracy (Last 14 Days)
      </h2>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Y-axis labels and chart */}
          <div className="flex items-end gap-0">
            <div className="flex flex-col justify-between text-xs text-gray-400 pr-2" style={{ height: chartHeight }}>
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="flex-1 relative" style={{ height: chartHeight }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <div
                  key={pct}
                  className="absolute w-full border-t border-gray-100"
                  style={{ bottom: `${pct}%` }}
                />
              ))}
              {/* Bars */}
              <svg
                viewBox={`0 0 ${chartWidth} 100`}
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                {data.map((d, i) => {
                  const barH = d.accuracy;
                  const color =
                    d.accuracy >= 80
                      ? "#22c55e"
                      : d.accuracy >= 60
                      ? "#f59e0b"
                      : d.accuracy > 0
                      ? "#ef4444"
                      : "#e5e7eb";
                  return (
                    <rect
                      key={d.date}
                      x={i * barWidth + barWidth * 0.15}
                      y={100 - barH}
                      width={barWidth * 0.7}
                      height={barH}
                      fill={color}
                      rx={1}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex ml-8 mt-1">
            {data.map((d) => (
              <div
                key={d.date}
                className="text-[10px] text-gray-400 text-center"
                style={{ width: `${100 / data.length}%` }}
              >
                {new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" /> 80%+
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" /> 60–79%
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" /> Below 60%
        </div>
      </div>
    </div>
  );
}

function QuestionsChart({ history }: { history: DailyProgress[] }) {
  if (history.length === 0) return null;

  const data = history.slice(-14);
  const maxQ = Math.max(...data.map((d) => d.questions_answered), 1);
  const chartHeight = 120;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Questions Answered (Last 14 Days)
      </h2>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex items-end gap-0">
            <div className="flex flex-col justify-between text-xs text-gray-400 pr-2" style={{ height: chartHeight }}>
              <span>{maxQ}</span>
              <span>{Math.round(maxQ / 2)}</span>
              <span>0</span>
            </div>
            <div className="flex-1 flex items-end gap-1" style={{ height: chartHeight }}>
              {data.map((d) => {
                const barH = (d.questions_answered / maxQ) * 100;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full rounded-t bg-indigo-500 transition-all min-w-[8px]"
                      style={{ height: `${barH}%` }}
                      title={`${d.questions_answered} questions on ${d.date}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex ml-8 mt-1">
            {data.map((d) => (
              <div
                key={d.date}
                className="flex-1 text-[10px] text-gray-400 text-center"
              >
                {new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "numeric",
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectRadar({ subjects }: { subjects: SubjectStat[] }) {
  if (subjects.length === 0) return null;

  const subjectConfig: Record<string, { color: string; icon: string }> = {
    Maths: { color: "#3b82f6", icon: "🔢" },
    English: { color: "#22c55e", icon: "📖" },
    "Verbal Reasoning": { color: "#a855f7", icon: "🧩" },
    "Non-Verbal Reasoning": { color: "#f97316", icon: "🔷" },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Subject Strengths
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.map((sub) => {
          const config = subjectConfig[sub.subject] || {
            color: "#6b7280",
            icon: "📝",
          };
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (sub.accuracy / 100) * circumference;

          return (
            <div key={sub.subject} className="text-center">
              <div className="relative inline-block">
                <svg width="100" height="100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">
                    {sub.accuracy}%
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">
                  {config.icon} {sub.subject}
                </span>
                <p className="text-xs text-gray-500">
                  {sub.total_correct}/{sub.total_answered}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Progress</h1>
        <p className="text-gray-600">Track your exam preparation journey</p>
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

      {/* Subject strength circles */}
      <SubjectRadar subjects={subjects} />

      {/* Accuracy chart */}
      <AccuracyChart history={history} />

      {/* Questions chart */}
      <QuestionsChart history={history} />

      {/* Subject breakdown bars */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Subject Breakdown</h2>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Complete some practice sessions to see your subject breakdown.
          </p>
        ) : (
          <div className="space-y-4">
            {subjects.map((sub) => {
              const barColors: Record<string, string> = {
                Maths: "bg-blue-500",
                English: "bg-green-500",
                "Verbal Reasoning": "bg-purple-500",
                "Non-Verbal Reasoning": "bg-orange-500",
              };
              const textColors: Record<string, string> = {
                Maths: "text-blue-700",
                English: "text-green-700",
                "Verbal Reasoning": "text-purple-700",
                "Non-Verbal Reasoning": "text-orange-700",
              };
              const icons: Record<string, string> = {
                Maths: "🔢",
                English: "📖",
                "Verbal Reasoning": "🧩",
                "Non-Verbal Reasoning": "🔷",
              };
              return (
                <div key={sub.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{icons[sub.subject] || "📝"}</span>
                      <span className={`font-medium ${textColors[sub.subject] || "text-gray-700"}`}>
                        {sub.subject}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {sub.total_correct}/{sub.total_answered} correct ({sub.accuracy}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${barColors[sub.subject] || "bg-gray-500"} transition-all`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity table */}
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
