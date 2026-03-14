"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function Dashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [examLevel, setExamLevel] = useState<string>("11+");

  useEffect(() => {
    Promise.all([
      fetch("/api/progress").then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json()),
    ])
      .then(([progressData, settingsData]) => {
        setStats(progressData.overview);
        setSubjects(progressData.subjects);
        setExamLevel(settingsData.settings?.exam_level || "11+");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const subjectConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Maths: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: "🔢" },
    English: { color: "text-green-700", bg: "bg-green-50 border-green-200", icon: "📖" },
    "Verbal Reasoning": { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: "🧩" },
    "Non-Verbal Reasoning": { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: "🔷" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to {examLevel} Practice Hub
        </h1>
        <p className="text-gray-600">
          {examLevel === "7+"
            ? "Your daily practice companion for 7+ independent school exam preparation"
            : "Your daily practice companion for GL and CEM 11+ exam preparation"}
        </p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-indigo-600">{stats.streak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
            <div className="text-sm text-gray-500">Sessions Done</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-green-600">{stats.accuracy}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-amber-600">{stats.wrongQueueCount}</div>
            <div className="text-sm text-gray-500">To Review</div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/practice"
          className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-lg"
        >
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-xl font-bold mb-2">Daily Practice</h2>
          <p className="text-indigo-100 text-sm">
            15-minute session covering all four subjects. Perfect for daily practice!
          </p>
        </Link>

        <Link
          href="/mock-test"
          className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="text-xl font-bold mb-2">Mock Test</h2>
          <p className="text-purple-100 text-sm">
            Choose a subject and practise specific topics at your own pace.
          </p>
        </Link>

        <Link
          href="/review"
          className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl p-6 hover:from-amber-600 hover:to-amber-800 transition-all shadow-lg"
        >
          <div className="text-3xl mb-3">🔄</div>
          <h2 className="text-xl font-bold mb-2">Review Mistakes</h2>
          <p className="text-amber-100 text-sm">
            Go back over questions you got wrong and master them!
            {stats && stats.wrongQueueCount > 0 && (
              <span className="block mt-1 font-bold">
                {stats.wrongQueueCount} questions waiting
              </span>
            )}
          </p>
        </Link>
      </div>

      {/* Subject breakdown */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Subjects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"].map(
            (subjectName) => {
              const config = subjectConfig[subjectName];
              const stat = subjects.find((s) => s.subject === subjectName);
              return (
                <div
                  key={subjectName}
                  className={`rounded-xl border p-4 ${config.bg}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${config.color}`}>
                        {subjectName}
                      </h3>
                      {stat ? (
                        <p className="text-sm text-gray-600">
                          {stat.total_answered} questions answered &middot;{" "}
                          {stat.accuracy}% accuracy
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No questions answered yet
                        </p>
                      )}
                    </div>
                  </div>
                  {stat && stat.total_answered > 0 && (
                    <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-current opacity-60"
                        style={{ width: `${stat.accuracy}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Exam info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {examLevel} Exam Coverage
        </h2>
        {examLevel === "7+" ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">What is the 7+?</h3>
              <p className="text-sm text-gray-600 mb-3">
                The 7+ exam is for entry into Year 3 at independent and prep schools.
                Children typically sit this exam at age 6–7.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maths (counting, addition, subtraction, shapes, time)</li>
                <li>• English (phonics, reading, grammar, vocabulary)</li>
                <li>• Verbal Reasoning (odd one out, simple patterns)</li>
                <li>• Non-Verbal Reasoning (sequences, matching)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Exam Format</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Usually 2–3 short papers</li>
                <li>• Multiple choice and short answer</li>
                <li>• May include a creative writing task</li>
                <li>• Some schools also have an interview</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">GL Assessment</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maths (arithmetic, geometry, data handling)</li>
                <li>• English (comprehension, grammar, spelling)</li>
                <li>• Verbal Reasoning (codes, analogies, word puzzles)</li>
                <li>• Non-Verbal Reasoning (patterns, sequences, spatial)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">CEM (Durham University)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maths (numerical reasoning, problem solving)</li>
                <li>• English (vocabulary, comprehension, cloze)</li>
                <li>• Verbal Reasoning (synonyms, analogies, logic)</li>
                <li>• Non-Verbal Reasoning (shapes, patterns, spatial)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
