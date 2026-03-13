"use client";

import { useEffect, useState, useCallback } from "react";
import QuestionCard from "@/components/QuestionCard";
import ChatBot from "@/components/ChatBot";

interface Question {
  id: string;
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hint: string | null;
}

export default function ReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"list" | "practice">("list");
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");

  const fetchWrongQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions?type=wrong");
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Failed to fetch wrong questions:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWrongQuestions();
  }, [fetchWrongQuestions]);

  const handleAnswer = async (
    questionId: string,
    _answer: string,
    isCorrect: boolean
  ) => {
    // Mark as reviewed
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", questionId }),
    });

    // If correct, mark as mastered
    if (isCorrect) {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "master", questionId }),
      });
    }

    setTimeout(() => {
      if (currentIndex < filteredQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setMode("list");
        fetchWrongQuestions();
      }
    }, 2500);
  };

  const filteredQuestions =
    filter === "all"
      ? questions
      : questions.filter((q) => q.subject === filter);

  const subjects = [...new Set(questions.map((q) => q.subject))];

  const startPractice = () => {
    setCurrentIndex(0);
    setMode("practice");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading review questions...</p>
        </div>
      </div>
    );
  }

  if (mode === "practice" && filteredQuestions.length > 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setMode("list")}
              className="text-gray-500 hover:text-gray-700"
            >
              &larr; Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Review Practice</h1>
          </div>
          <p className="text-gray-600">
            Try these questions again. Get them right to master them!
          </p>
        </div>

        <div className="flex justify-center gap-1 mb-6">
          {filteredQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-indigo-600 scale-125"
                  : idx < currentIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <QuestionCard
          key={filteredQuestions[currentIndex].id}
          question={filteredQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={filteredQuestions.length}
          onAnswer={handleAnswer}
          onAskTutor={(msg) => setChatMessage(msg)}
        />

        <ChatBot
          initialMessage={chatMessage}
          questionContext={filteredQuestions[currentIndex]?.question_text}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Mistakes</h1>
        <p className="text-gray-600">
          Questions you got wrong are saved here. Practise them until you master them!
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No mistakes to review!
          </h2>
          <p className="text-gray-600">
            Complete some practice sessions and any wrong answers will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Filter and action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === "all"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({questions.length})
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFilter(sub)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === sub
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub} ({questions.filter((q) => q.subject === sub).length})
                </button>
              ))}
            </div>

            <button
              onClick={startPractice}
              disabled={filteredQuestions.length === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              Practice These ({filteredQuestions.length})
            </button>
          </div>

          {/* Questions list */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const subjectColors: Record<string, string> = {
                Maths: "bg-blue-100 text-blue-700",
                English: "bg-green-100 text-green-700",
                "Verbal Reasoning": "bg-purple-100 text-purple-700",
                "Non-Verbal Reasoning": "bg-orange-100 text-orange-700",
              };
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        subjectColors[q.subject] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {q.subject}
                    </span>
                    <span className="text-xs text-gray-500">{q.topic}</span>
                  </div>
                  <p className="text-gray-800">{q.question_text}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Answer: {q.correct_answer}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ChatBot />
    </div>
  );
}
