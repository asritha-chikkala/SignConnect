"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Award, Target, Flame } from "lucide-react";

interface ISLProgressTrackerProps {
  totalLearned: number;
  dailyStreak: number;
  quizScore: number;
}

export function ISLProgressTracker({ totalLearned, dailyStreak, quizScore }: ISLProgressTrackerProps) {
  const totalSigns = 50;
  const progressPercentage = (totalLearned / totalSigns) * 100;

  const achievements = [
    { name: "First Sign", earned: totalLearned >= 1, icon: "🎯" },
    { name: "5 Signs Mastered", earned: totalLearned >= 5, icon: "🌟" },
    { name: "10 Day Streak", earned: dailyStreak >= 10, icon: "🔥" },
    { name: "Quiz Champion", earned: quizScore >= 80, icon: "🏆" },
    { name: "Vocabulary Builder", earned: totalLearned >= 20, icon: "📚" },
    { name: "Advanced Learner", earned: totalLearned >= 40, icon: "⭐" },
  ];

  const upcomingSigns = [
    { word: "MOTHER", category: "Family", difficulty: "Easy" },
    { word: "FATHER", category: "Family", difficulty: "Easy" },
    { word: "DRINK", category: "Actions", difficulty: "Easy" },
    { word: "SLEEP", category: "Actions", difficulty: "Medium" },
    { word: "HAPPY", category: "Emotions", difficulty: "Medium" },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Your Learning Journey</h3>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/60">Overall Progress</span>
            <span className="text-sm text-cyan-300">{totalLearned}/{totalSigns} signs</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <p className="text-sm text-white/40">
          {progressPercentage < 30 && "Keep going! Every sign you learn opens new conversations."}
          {progressPercentage >= 30 && progressPercentage < 70 && "Great progress! You're building real communication skills."}
          {progressPercentage >= 70 && "Amazing! You're becoming fluent in ISL!"}
        </p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{dailyStreak}</p>
          <p className="text-xs text-white/40">Day Streak</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <Award className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{totalLearned}</p>
          <p className="text-xs text-white/40">Signs Learned</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{quizScore}%</p>
          <p className="text-xs text-white/40">Quiz Average</p>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`p-3 rounded-xl text-center transition-all ${
                achievement.earned
                  ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                  : "bg-white/5 border border-white/10 opacity-50"
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <p className="text-xs font-medium text-white">{achievement.name}</p>
              {achievement.earned && (
                <span className="text-[10px] text-cyan-300">✓ Unlocked</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Signs */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📚 Recommended Next Signs</h3>
        <div className="space-y-2">
          {upcomingSigns.map((sign) => (
            <div key={sign.word} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="font-medium text-white">{sign.word}</p>
                <p className="text-xs text-white/40">{sign.category} • {sign.difficulty}</p>
              </div>
              <button className="px-3 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition">
                Practice
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar Heatmap */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📅 Activity Calendar</h3>
        <div className="flex items-center justify-between">
          <Calendar className="w-5 h-5 text-white/40" />
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg ${
                  i < dailyStreak ? "bg-cyan-500/40" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/40">Last 7 days</p>
        </div>
      </Card>
    </div>
  );
}