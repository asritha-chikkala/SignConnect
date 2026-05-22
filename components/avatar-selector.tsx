"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, Sparkles, Heart, Clock } from "lucide-react";

export type AvatarStyle = {
  id: string;
  name: string;
  category: "default" | "male" | "female";
  vrmUrl: string;
  previewEmoji: string;
  previewColor: string;
  description: string;
  traits: string[];
  isComingSoon?: boolean;
};

// ONLY 4 WORKING AVATARS + Coming Soon for others
export const avatarStyles: AvatarStyle[] = [
  {
    id: "default",
    name: "Default Avatar",
    category: "default",
    vrmUrl: "/avatars/default.vrm",
    previewEmoji: "🤟",
    previewColor: "from-cyan-400 to-blue-500",
    description: "Default SignBridge avatar",
    traits: ["Balanced", "Clear signing", "Friendly"]
  },
  {
    id: "male-professional",
    name: "Arjun - Professional",
    category: "male",
    vrmUrl: "/avatars/male-professional.vrm",
    previewEmoji: "👨‍💼",
    previewColor: "from-blue-400 to-blue-600",
    description: "Clean, professional look perfect for business settings",
    traits: ["Professional", "Friendly", "Clear signing"]
  },
  {
    id: "female-professional",
    name: "Priya - Professional",
    category: "female",
    vrmUrl: "/avatars/female-professional.vrm",
    previewEmoji: "👩‍💼",
    previewColor: "from-purple-400 to-purple-600",
    description: "Elegant and precise signing",
    traits: ["Elegant", "Precise", "Trustworthy"]
  },
  {
    id: "female-casual",
    name: "Ananya - Casual",
    category: "female",
    vrmUrl: "/avatars/female-casual.vrm",
    previewEmoji: "🧑‍🦰",
    previewColor: "from-pink-400 to-pink-600",
    description: "Warm and engaging personality",
    traits: ["Warm", "Engaging", "Friendly"]
  },
  // COMING SOON - Disabled but visible
  {
    id: "male-casual-coming",
    name: "Rahul - Casual",
    category: "male",
    vrmUrl: "",
    previewEmoji: "🧑",
    previewColor: "from-gray-400 to-gray-500",
    description: "Coming Soon!",
    traits: ["Coming soon", "More avatars"],
    isComingSoon: true
  },
  {
    id: "ghibli-coming",
    name: "Ghibli Style",
    category: "female",
    vrmUrl: "",
    previewEmoji: "🌸",
    previewColor: "from-gray-400 to-gray-500",
    description: "Coming Soon!",
    traits: ["Coming soon", "More avatars"],
    isComingSoon: true
  },
  {
    id: "cyberpunk-coming",
    name: "Cyberpunk Style",
    category: "male",
    vrmUrl: "",
    previewEmoji: "⚡",
    previewColor: "from-gray-400 to-gray-500",
    description: "Coming Soon!",
    traits: ["Coming soon", "More avatars"],
    isComingSoon: true
  },
  {
    id: "fantasy-coming",
    name: "Fantasy Style",
    category: "female",
    vrmUrl: "",
    previewEmoji: "🧚",
    previewColor: "from-gray-400 to-gray-500",
    description: "Coming Soon!",
    traits: ["Coming soon", "More avatars"],
    isComingSoon: true
  }
];

export const categories = [
  { id: "all", name: "All", icon: "🎨" },
  { id: "default", name: "Default", icon: "🤟" },
  { id: "male", name: "Male", icon: "👨" },
  { id: "female", name: "Female", icon: "👩" }
];

interface AvatarSelectorProps {
  onSelectAvatar: (avatar: AvatarStyle) => void;
  currentAvatarId?: string;
  onClose?: () => void;
}

export function AvatarSelector({ onSelectAvatar, currentAvatarId, onClose }: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatarId || null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredAvatars = avatarStyles.filter(avatar =>
    selectedCategory === "all" || avatar.category === selectedCategory
  );

  const handleSelect = (avatar: AvatarStyle) => {
    if (avatar.isComingSoon) return; // Don't allow selection of coming soon avatars
    
    setSelectedAvatar(avatar.id);
    onSelectAvatar(avatar);
    localStorage.setItem("selectedAvatar", avatar.id);
    localStorage.setItem("selectedAvatarUrl", avatar.vrmUrl);
    setIsOpen(false); // Close modal after selection
  };

  // Load saved avatar on mount
  useEffect(() => {
    const savedAvatarId = localStorage.getItem("selectedAvatar");
    if (savedAvatarId) {
      const saved = avatarStyles.find(a => a.id === savedAvatarId && !a.isComingSoon);
      if (saved && savedAvatarId !== currentAvatarId) {
        setSelectedAvatar(savedAvatarId);
        onSelectAvatar(saved);
      }
    }
  }, []);

  return (
    <div className="relative">
      {/* Avatar Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-300/30 hover:border-cyan-300/60 transition-all group"
      >
        <Sparkles className="w-4 h-4 text-cyan-300" />
        <span className="text-sm text-white/80">Change Avatar</span>
        <ChevronRight className={`w-4 h-4 text-cyan-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-4xl max-h-[85vh] overflow-hidden"
            >
              <Card className="bg-[#0a0f1f] border border-cyan-300/30 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-cyan-300/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
                      Choose Your Avatar
                    </h2>
                    <p className="text-sm text-white/50 mt-1">Select a character to represent you in SignBridge</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Categories */}
                <div className="px-6 py-4 border-b border-cyan-300/20 overflow-x-auto">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Grid */}
                <div className="p-6 overflow-y-auto max-h-[55vh]">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAvatars.map((avatar) => (
                      <motion.div
                        key={avatar.id}
                        whileHover={avatar.isComingSoon ? {} : { scale: 1.02 }}
                        whileTap={avatar.isComingSoon ? {} : { scale: 0.98 }}
                        className={`cursor-pointer rounded-xl p-4 transition-all ${
                          avatar.isComingSoon
                            ? "opacity-60 cursor-not-allowed bg-white/5 border border-white/10"
                            : selectedAvatar === avatar.id
                            ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                        onClick={() => handleSelect(avatar)}
                      >
                        <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${avatar.previewColor} flex items-center justify-center text-4xl shadow-lg mb-3 relative`}>
                          {avatar.previewEmoji}
                          {avatar.isComingSoon && (
                            <div className="absolute -top-2 -right-2 bg-amber-500/90 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Clock className="w-2 h-2" />
                              Soon
                            </div>
                          )}
                        </div>
                        <h3 className="text-center font-medium text-white text-sm">{avatar.name}</h3>
                        <p className="text-center text-xs text-white/40 mt-1">{avatar.description}</p>
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {avatar.traits.slice(0, 2).map((trait) => (
                            <span key={trait} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                              {trait}
                            </span>
                          ))}
                        </div>
                        {selectedAvatar === avatar.id && !avatar.isComingSoon && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-cyan-300/20 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Heart className="w-3 h-3" />
                    <span>More avatars coming soon!</span>
                  </div>
                  <Button onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    Done
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}