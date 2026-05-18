"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Trophy } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  type: "multiple-choice" | "match-sign" | "spell-word";
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the ISL sign for 'HELLO'?",
    options: ["Wave hand near forehead", "Point to chest", "Tap wrist", "Cross arms"],
    correctAnswer: "Wave hand near forehead",
    type: "multiple-choice",
  },
  {
    id: 2,
    question: "How do you sign 'HOSPITAL' in ISL?",
    options: ["Tap wrist", "Cross on chest", "Point to heart", "Circle arms"],
    correctAnswer: "Cross on chest",
    type: "multiple-choice",
  },
  {
    id: 3,
    question: "What is the correct ISL sign for 'THANK YOU'?",
    options: ["Wave hand", "Hand from chin outward", "Point to chest", "Clap hands"],
    correctAnswer: "Hand from chin outward",
    type: "multiple-choice",
  },
  {
    id: 4,
    question: "How do you sign 'HELP' in ISL?",
    options: ["Raise hand up", "Push up on other palm", "Point to self", "Shake head"],
    correctAnswer: "Push up on other palm",
    type: "multiple-choice",
  },
  {
    id: 5,
    question: "What is the sign for 'YES' in ISL?",
    options: ["Nodding fist", "Shake head", "Point finger", "Wave hand"],
    correctAnswer: "Nodding fist",
    type: "multiple-choice",
  },
];

interface ISLQuizProps {
  onScoreUpdate: (score: number) => void;
}

export function ISLQuiz({ onScoreUpdate }: ISLQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const isLast = currentQuestion === QUIZ_QUESTIONS.length - 1;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === question.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    
    if (isLast) {
      const finalScore = (score + (selectedAnswer === question.correctAnswer ? 1 : 0)) / QUIZ_QUESTIONS.length * 100;
      setIsCompleted(true);
      onScoreUpdate(Math.round(finalScore));
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsCompleted(false);
    setShowResult(false);
  };

  if (isCompleted) {
    const finalPercentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h2>
        <p className="text-5xl font-bold text-cyan-300 mb-4">{finalPercentage}%</p>
        <p className="text-white/60 mb-6">
          You got {score} out of {QUIZ_QUESTIONS.length} correct
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} variant="outline">
            Take Again
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">
            Practice More
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-white/40">Question {currentQuestion + 1}/{QUIZ_QUESTIONS.length}</span>
          <span className="text-sm text-cyan-300">Score: {score}</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-6">{question.question}</h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => !selectedAnswer && handleAnswer(option)}
            disabled={!!selectedAnswer}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedAnswer === option
                ? option === question.correctAnswer
                  ? "bg-green-500/20 border-green-500"
                  : "bg-red-500/20 border-red-500"
                : selectedAnswer && option === question.correctAnswer
                ? "bg-green-500/20 border-green-500"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } border`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white">{option}</span>
              {selectedAnswer && option === question.correctAnswer && (
                <Check className="w-5 h-5 text-green-400" />
              )}
              {selectedAnswer === option && option !== question.correctAnswer && (
                <X className="w-5 h-5 text-red-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`p-4 rounded-xl mb-6 ${
          selectedAnswer === question.correctAnswer
            ? "bg-green-500/10 border border-green-500"
            : "bg-red-500/10 border border-red-500"
        }`}>
          <p className="text-sm">
            {selectedAnswer === question.correctAnswer ? (
              <span className="text-green-400">✓ Correct! Great job!</span>
            ) : (
              <span className="text-red-400">✗ Incorrect. The correct answer is: {question.correctAnswer}</span>
            )}
          </p>
        </div>
      )}

      {selectedAnswer && (
        <Button onClick={handleNext} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
          {isLast ? "See Results" : "Next Question"}
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      )}
    </Card>
  );
}