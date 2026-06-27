"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { getAllSigns } from "@/lib/isl-signs";
import { ChevronLeft, ChevronRight, FlipHorizontal, Check, X, RotateCcw } from "lucide-react";

interface Flashcard {
  id: string;
  sign: any;
  known: boolean;
}

export function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [showKnown, setShowKnown] = useState(true);
  const [showUnknown, setShowUnknown] = useState(true);

  useEffect(() => {
    const allSigns = getAllSigns();
    const saved = localStorage.getItem("isl_flashcard_progress");
    let knownIds: string[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        knownIds = parsed.known || [];
      } catch (e) {}
    }

    const cardData = allSigns.map((sign) => ({
      id: sign.id,
      sign: sign,
      known: knownIds.includes(sign.id),
    }));

    setCards(cardData);
    updateCounts(cardData);
  }, []);

  const updateCounts = (cardData: Flashcard[]) => {
    const known = cardData.filter((c) => c.known).length;
    const unknown = cardData.filter((c) => !c.known).length;
    setKnownCount(known);
    setUnknownCount(unknown);
  };

  const getFilteredCards = () => {
    let filtered = [...cards];
    if (!showKnown) filtered = filtered.filter((c) => !c.known);
    if (!showUnknown) filtered = filtered.filter((c) => c.known);
    return filtered;
  };

  const filteredCards = getFilteredCards();
  const currentCard = filteredCards[currentIndex] || null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
    setIsFlipped(false);
  };

  const handleKnow = () => {
    if (!currentCard) return;
    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, known: true } : c
    );
    setCards(updatedCards);
    updateCounts(updatedCards);
    localStorage.setItem(
      "isl_flashcard_progress",
      JSON.stringify({
        known: updatedCards.filter((c) => c.known).map((c) => c.id),
      })
    );
    handleNext();
  };

  const handleDontKnow = () => {
    if (!currentCard) return;
    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, known: false } : c
    );
    setCards(updatedCards);
    updateCounts(updatedCards);
    localStorage.setItem(
      "isl_flashcard_progress",
      JSON.stringify({
        known: updatedCards.filter((c) => c.known).map((c) => c.id),
      })
    );
    handleNext();
  };

  const resetProgress = () => {
    if (confirm("Reset all flashcard progress?")) {
      const resetCards = cards.map((c) => ({ ...c, known: false }));
      setCards(resetCards);
      updateCounts(resetCards);
      localStorage.removeItem("isl_flashcard_progress");
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">No cards match your filters</p>
      </div>
    );
  }

  const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex justify-between text-xs text-white/40">
        <span>✅ Known: {knownCount}</span>
        <span>🔄 Learning: {unknownCount}</span>
        <span>📚 Total: {cards.length}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative h-64 cursor-pointer" onClick={handleFlip}>
        <Card
          className={`w-full h-full p-4 flex flex-col items-center justify-center transition-all duration-500 ${
            isFlipped
              ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              : "bg-white/5"
          } border-white/10`}
        >
          {!isFlipped ? (
            <div className="text-center">
              <div className="text-7xl mb-2">{currentCard.sign.icon}</div>
              <p className="text-xs text-white/40">Tap to flip</p>
              <p className="text-[10px] text-white/20 mt-1">
                {currentIndex + 1} / {filteredCards.length}
              </p>
            </div>
          ) : (
            <div className="text-center w-full">
              <div className="text-2xl mb-1">{currentCard.sign.icon}</div>
              <p className="text-xl font-bold text-white">{currentCard.sign.text}</p>
              <p className="text-xs text-cyan-300">{currentCard.sign.gloss}</p>
              <p className="text-[10px] text-white/40 mt-1">{currentCard.sign.description}</p>
              <div className="mt-2 h-16">
                <AvatarStage
                  sentiment="neutral"
                  lowBandwidth={false}
                  gloss={[currentCard.sign.gloss]}
                  signReplayKey={0}
                />
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <FlipHorizontal className="w-3 h-3 text-white/20" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center gap-2">
        <Button
          variant="outline"
          
          onClick={handlePrevious}
          className="border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-2">
          <Button
            
            onClick={handleDontKnow}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
          >
            <X className="w-4 h-4 mr-1" />
            Don't Know
          </Button>
          <Button
            
            onClick={handleKnow}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
          >
            <Check className="w-4 h-4 mr-1" />
            Know It!
          </Button>
        </div>

        <Button
          variant="outline"
          
          onClick={handleNext}
          className="border-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-4 text-xs">
        <label className="flex items-center gap-1 text-white/40">
          <input
            type="checkbox"
            checked={showKnown}
            onChange={() => setShowKnown(!showKnown)}
            className="accent-cyan-500"
          />
          Show Known
        </label>
        <label className="flex items-center gap-1 text-white/40">
          <input
            type="checkbox"
            checked={showUnknown}
            onChange={() => setShowUnknown(!showUnknown)}
            className="accent-cyan-500"
          />
          Show Learning
        </label>
        <button
          onClick={resetProgress}
          className="text-white/30 hover:text-white/50 transition"
        >
          <RotateCcw className="w-3 h-3 inline mr-1" />
          Reset
        </button>
      </div>
    </div>
  );
}