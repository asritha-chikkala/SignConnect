"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock } from "lucide-react";

interface ISLLessonCardProps {
  title: string;
  description: string;
  icon: string;
  signCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  onStart: () => void;
}

export function ISLLessonCard({
  title,
  description,
  icon,
  signCount,
  difficulty,
  color,
  onStart,
}: ISLLessonCardProps) {
  const difficultyColor = {
    Beginner: "text-green-400 bg-green-500/10",
    Intermediate: "text-yellow-400 bg-yellow-500/10",
    Advanced: "text-red-400 bg-red-500/10",
  }[difficulty];

  return (
    <Card className="p-5 bg-gradient-to-br from-black/40 to-black/20 border-white/10 hover:border-cyan-500/30 transition-all">
      <div className="flex flex-col md:flex-row gap-5">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/50 text-sm mb-3">{description}</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
              📖 {signCount} signs
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor}`}>
              {difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Button onClick={onStart} className="bg-gradient-to-r from-cyan-500 to-purple-500">
            <PlayCircle className="w-4 h-4 mr-2" />
            Start Lesson
          </Button>
        </div>
      </div>
    </Card>
  );
}