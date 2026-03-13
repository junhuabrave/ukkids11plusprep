"use client";

import Link from "next/link";

interface SessionResultsProps {
  results: {
    session: {
      total_questions: number;
      correct_answers: number;
      duration_seconds: number | null;
    };
    answers: {
      question_id: string;
      question_text: string;
      user_answer: string;
      correct_answer: string;
      is_correct: number;
      explanation: string;
      subject: string;
      topic: string;
      options: string[];
      difficulty?: number;
    }[];
  };
  onRestart?: () => void;
}

export default function SessionResults({ results, onRestart }: SessionResultsProps) {
  const { session, answers } = results;
  const accuracy = session.total_questions > 0
    ? Math.round((session.correct_answers / session.total_questions) * 100)
    : 0;
  const minutes = session.duration_seconds
    ? Math.floor(session.duration_seconds / 60)
    : 0;
  const seconds = session.duration_seconds
    ? session.duration_seconds % 60
    : 0;

  const unansweredQuestions = answers.filter((a) => a.user_answer === "__unanswered__");
  const wrongAnswers = answers.filter((a) => !a.is_correct && a.user_answer !== "__unanswered__");

  const difficultyLabel: Record<number, { text: string; style: string }> = {
    1: { text: "Easy", style: "bg-green-100 text-green-700" },
    2: { text: "Medium", style: "bg-amber-100 text-amber-700" },
    3: { text: "Hard", style: "bg-red-100 text-red-700" },
  };

  const getMessage = () => {
    if (accuracy === 100) return { text: "Perfect score! Amazing work! 🌟", color: "text-green-600" };
    if (accuracy >= 80) return { text: "Great job! Keep it up! 🎉", color: "text-green-600" };
    if (accuracy >= 60) return { text: "Good effort! Let's review the tricky ones. 💪", color: "text-amber-600" };
    return { text: "Keep practising! Every mistake is a chance to learn. 📚", color: "text-indigo-600" };
  };

  const message = getMessage();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
        <p className={`text-lg font-medium ${message.color} mb-6`}>{message.text}</p>

        <div className="flex justify-center gap-8 mb-6">
          <div>
            <div className="text-4xl font-bold text-indigo-600">{accuracy}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-800">
              {session.correct_answers}/{session.total_questions}
            </div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          {unansweredQuestions.length > 0 && (
            <div>
              <div className="text-4xl font-bold text-amber-500">{unansweredQuestions.length}</div>
              <div className="text-sm text-gray-500">Unanswered</div>
            </div>
          )}
          <div>
            <div className="text-4xl font-bold text-gray-600">
              {minutes}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-sm text-gray-500">Time</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Practice Again
            </button>
          )}
          <Link
            href="/review"
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Review Mistakes ({wrongAnswers.length + unansweredQuestions.length})
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Wrong answers detail */}
      {unansweredQuestions.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-amber-700">
            Unanswered Questions ({unansweredQuestions.length})
          </h3>
          <p className="text-sm text-gray-500">
            These questions were not answered before time ran out. They have been added to your review queue.
          </p>
          {unansweredQuestions.map((answer, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-amber-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {answer.subject} - {answer.topic}
                </span>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                  Unanswered
                </span>
                {answer.difficulty && difficultyLabel[answer.difficulty] && (
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyLabel[answer.difficulty].style}`}>
                    {difficultyLabel[answer.difficulty].text}
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-800 mb-2">
                {answer.question_text}
              </p>
              <p className="text-sm text-green-600 mb-2">
                Correct answer: <strong>{answer.correct_answer}</strong>
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {answer.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {wrongAnswers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Wrong Answers ({wrongAnswers.length})
          </h3>
          {wrongAnswers.map((answer, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-red-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  {answer.subject} - {answer.topic}
                </span>
                {answer.difficulty && difficultyLabel[answer.difficulty] && (
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyLabel[answer.difficulty].style}`}>
                    {difficultyLabel[answer.difficulty].text}
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-800 mb-2">
                {answer.question_text}
              </p>
              <p className="text-sm text-red-600 mb-1">
                Your answer: <strong>{answer.user_answer}</strong>
              </p>
              <p className="text-sm text-green-600 mb-2">
                Correct answer: <strong>{answer.correct_answer}</strong>
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {answer.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
