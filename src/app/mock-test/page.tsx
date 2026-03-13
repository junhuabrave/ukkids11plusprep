"use client";

import { useState, useCallback, useRef } from "react";
import QuestionCard from "@/components/QuestionCard";
import SessionResults from "@/components/SessionResults";
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

const subjects = [
  { name: "Maths", icon: "🔢", color: "from-blue-500 to-blue-700" },
  { name: "English", icon: "📖", color: "from-green-500 to-green-700" },
  { name: "Verbal Reasoning", icon: "🧩", color: "from-purple-500 to-purple-700" },
  { name: "Non-Verbal Reasoning", icon: "🔷", color: "from-orange-500 to-orange-700" },
];

export default function MockTestPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const questionStartTime = useRef<number>(Date.now());

  const startTest = useCallback(async (subject: string) => {
    setLoading(true);
    setSelectedSubject(subject);
    try {
      const [questionsRes, sessionRes] = await Promise.all([
        fetch(`/api/questions?subject=${encodeURIComponent(subject)}&count=10`),
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", sessionType: "mock", subject }),
        }),
      ]);

      const questionsData = await questionsRes.json();
      const sessionData = await sessionRes.json();

      setQuestions(questionsData.questions);
      setSessionId(sessionData.sessionId);
      setCurrentIndex(0);
      setIsComplete(false);
      setResults(null);
      questionStartTime.current = Date.now();
    } catch (error) {
      console.error("Failed to start test:", error);
    }
    setLoading(false);
  }, []);

  const handleAnswer = async (
    questionId: string,
    answer: string,
    isCorrect: boolean
  ) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer",
        sessionId,
        questionId,
        userAnswer: answer,
        isCorrect,
        timeSpent,
      }),
    });

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        questionStartTime.current = Date.now();
      } else {
        finishTest();
      }
    }, 2000);
  };

  const finishTest = async () => {
    setIsComplete(true);
    if (!sessionId) return;

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", sessionId }),
    });

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "results", sessionId }),
    });
    const data = await res.json();
    setResults(data.results);
  };

  if (isComplete && results) {
    return (
      <div className="py-8">
        <SessionResults
          results={results as Parameters<typeof SessionResults>[0]["results"]}
          onRestart={() => {
            setSelectedSubject(null);
            setIsComplete(false);
            setResults(null);
          }}
        />
        <ChatBot />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading {selectedSubject} questions...</p>
        </div>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mock Test</h1>
          <p className="text-gray-600">Choose a subject to practise</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {subjects.map((sub) => (
            <button
              key={sub.name}
              onClick={() => startTest(sub.name)}
              className={`bg-gradient-to-br ${sub.color} text-white rounded-xl p-8 text-left hover:opacity-90 transition-all shadow-lg`}
            >
              <span className="text-4xl block mb-3">{sub.icon}</span>
              <h2 className="text-xl font-bold mb-1">{sub.name}</h2>
              <p className="text-sm opacity-80">10 questions &middot; untimed</p>
            </button>
          ))}
        </div>

        <ChatBot />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No questions available for this subject.</p>
        <button
          onClick={() => setSelectedSubject(null)}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setSelectedSubject(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedSubject} Mock Test
          </h1>
        </div>
        <p className="text-gray-600">
          {questions.length} questions &middot; Take your time
        </p>
      </div>

      <div className="flex justify-center gap-1 mb-6">
        {questions.map((_, idx) => (
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
        key={questions[currentIndex].id}
        question={questions[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        onAskTutor={(msg) => setChatMessage(msg)}
      />

      <ChatBot
        initialMessage={chatMessage}
        questionContext={questions[currentIndex]?.question_text}
      />
    </div>
  );
}
