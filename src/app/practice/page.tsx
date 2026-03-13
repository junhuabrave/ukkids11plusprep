"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
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

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const questionStartTime = useRef<number>(Date.now());

  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const [questionsRes, sessionRes] = await Promise.all([
        fetch("/api/questions?type=daily"),
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", sessionType: "daily" }),
        }),
      ]);

      const questionsData = await questionsRes.json();
      const sessionData = await sessionRes.json();

      setQuestions(questionsData.questions);
      setSessionId(sessionData.sessionId);
      setCurrentIndex(0);
      setIsRunning(true);
      setIsComplete(false);
      setResults(null);
      questionStartTime.current = Date.now();
    } catch (error) {
      console.error("Failed to start session:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    startSession();
  }, [startSession]);

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

    // Auto-advance after a delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        questionStartTime.current = Date.now();
      } else {
        finishSession();
      }
    }, 2000);
  };

  const finishSession = async () => {
    setIsRunning(false);
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

  const handleTimeUp = useCallback(() => {
    finishSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Preparing your practice session...</p>
        </div>
      </div>
    );
  }

  if (isComplete && results) {
    return (
      <div className="py-8">
        <SessionResults
          results={results as Parameters<typeof SessionResults>[0]["results"]}
          onRestart={() => startSession()}
        />
        <ChatBot />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No questions available. Please try again.</p>
        <button
          onClick={startSession}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Practice</h1>
        <p className="text-gray-600">
          15-minute session &middot; All subjects &middot; {questions.length} questions
        </p>
      </div>

      <div className="mb-6">
        <Timer
          durationMinutes={15}
          onTimeUp={handleTimeUp}
          isRunning={isRunning}
        />
      </div>

      {/* Progress dots */}
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
