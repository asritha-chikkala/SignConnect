"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { getAllSigns } from "@/lib/isl-signs";
import { Trophy, RefreshCw, Check, X } from "lucide-react";

export function Quiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = () => {
    const allSigns = getAllSigns();
    const shuffled = [...allSigns].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    const quizQuestions = selected.map((sign) => {
      const wrongOptions = allSigns
        .filter((s) => s.id !== sign.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.text);

      const options = [sign.text, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        sign: sign,
        question: `What does this sign mean?`,
        icon: sign.icon,
        options: options,
        correctAnswer: sign.text,
      };
    });

    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setQuizComplete(false);
    setShowAnswer(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setShowAnswer(true);
    }, 500);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    generateQuiz();
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 50 ? "💪" : "📚";
    const message =
      percentage >= 80
        ? "Excellent! You're an ISL expert!"
        : percentage >= 50
        ? "Good effort! Keep practicing!"
        : "Keep learning! You'll get there!";

    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-4xl mb-2">{emoji}</p>
        <p className="text-xl font-bold text-white">Quiz Complete!</p>
        <p className="text-lg text-cyan-300 mt-2">
          {score} / {questions.length} ({percentage}%)
        </p>
        <p className="text-white/50 mt-2">{message}</p>
        <Button
          onClick={resetQuiz}
          className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Take Again
        </Button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex justify-between text-sm text-white/40">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-4 bg-white/5 border-white/10">
        <div className="text-center">
          <div className="text-6xl mb-2">{currentQuestion.icon}</div>
          <p className="text-base text-white font-medium">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {currentQuestion.options.map((option: string) => {
            let bgColor = "bg-white/5 hover:bg-white/10";
            let borderColor = "border-white/10";

            if (answered && option === currentQuestion.correctAnswer) {
              bgColor = "bg-green-500/20";
              borderColor = "border-green-500";
            } else if (answered && option === selectedAnswer && option !== currentQuestion.correctAnswer) {
              bgColor = "bg-red-500/20";
              borderColor = "border-red-500";
            } else if (answered && option !== currentQuestion.correctAnswer) {
              bgColor = "bg-white/5 opacity-50";
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`p-3 rounded-xl border transition ${bgColor} ${borderColor} ${
                  !answered && "hover:border-cyan-500/50"
                } text-sm`}
              >
                <span className="text-white">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Answer Feedback */}
        {showAnswer && (
          <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-white/80">
                {selectedAnswer === currentQuestion.correctAnswer
                  ? "✅ Correct!"
                  : `❌ The correct answer was: ${currentQuestion.correctAnswer}`}
              </span>
            </div>
            <div className="mt-2 h-16">
              <AvatarStage
                sentiment="neutral"
                lowBandwidth={false}
                gloss={[currentQuestion.sign.gloss]}
                signReplayKey={0}
              />
            </div>
          </div>
        )}

        {/* Next Button */}
        {answered && (
          <Button
            onClick={handleNext}
            className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            {currentIndex < questions.length - 1 ? "Next Question →" : "See Results"}
          </Button>
        )}
      </Card>
    </div>
  );
}