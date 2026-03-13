"use client";

import { useState } from "react";

interface QuestionCardProps {
  question: {
    id: string;
    subject: string;
    topic: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    hint: string | null;
  };
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  onAskTutor?: (question: string) => void;
  showResult?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onAskTutor,
  showResult = false,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || answered) return;
    const isCorrect = selectedAnswer === question.correct_answer;
    setAnswered(true);
    onAnswer(question.id, selectedAnswer, isCorrect);
  };

  const getOptionStyle = (option: string) => {
    if (!answered && !showResult) {
      return selectedAnswer === option
        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
    }

    if (option === question.correct_answer) {
      return "border-green-500 bg-green-50 ring-2 ring-green-500";
    }
    if (option === selectedAnswer && option !== question.correct_answer) {
      return "border-red-500 bg-red-50 ring-2 ring-red-500";
    }
    return "border-gray-200 opacity-50";
  };

  const subjectColors: Record<string, string> = {
    Maths: "bg-blue-100 text-blue-700",
    English: "bg-green-100 text-green-700",
    "Verbal Reasoning": "bg-purple-100 text-purple-700",
    "Non-Verbal Reasoning": "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              subjectColors[question.subject] || "bg-gray-100 text-gray-700"
            }`}
          >
            {question.subject}
          </span>
          <span className="text-xs text-gray-500">{question.topic}</span>
        </div>
        <span className="text-sm text-gray-500">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        {question.question_text}
      </h2>

      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={answered || showResult}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
              option
            )} ${!answered && !showResult ? "cursor-pointer" : "cursor-default"}`}
          >
            <span className="font-medium text-gray-500 mr-3">
              {String.fromCharCode(65 + idx)}.
            </span>
            <span className="text-gray-800">{option}</span>
            {(answered || showResult) && option === question.correct_answer && (
              <span className="float-right text-green-600 font-bold">✓</span>
            )}
            {(answered || showResult) &&
              option === selectedAnswer &&
              option !== question.correct_answer && (
                <span className="float-right text-red-600 font-bold">✗</span>
              )}
          </button>
        ))}
      </div>

      {!answered && !showResult && (
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
          {question.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="py-3 px-4 border-2 border-amber-300 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors"
            >
              {showHint ? "Hide Hint" : "💡 Hint"}
            </button>
          )}
        </div>
      )}

      {showHint && !answered && question.hint && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            <strong>Hint:</strong> {question.hint}
          </p>
        </div>
      )}

      {(answered || showResult) && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            selectedAnswer === question.correct_answer
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {selectedAnswer === question.correct_answer ? (
            <p className="text-green-800 font-medium mb-2">
              ✓ Correct! Well done!
            </p>
          ) : (
            <p className="text-red-800 font-medium mb-2">
              ✗ Not quite. The correct answer is:{" "}
              <strong>{question.correct_answer}</strong>
            </p>
          )}
          <p className="text-gray-700 text-sm">{question.explanation}</p>
          {onAskTutor && (
            <button
              onClick={() =>
                onAskTutor(
                  `Help me understand this question: "${question.question_text}". The correct answer is "${question.correct_answer}". ${question.explanation}`
                )
              }
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              🤖 Ask the tutor to explain more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
