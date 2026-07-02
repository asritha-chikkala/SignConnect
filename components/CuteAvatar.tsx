// components/CuteAvatar.tsx

"use client";

import { useEffect, useRef } from "react";
import Lottie from "lottie-react";

// Simple animated SVG avatar (no external dependencies)
export function CuteAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Body */}
        <ellipse cx="100" cy="130" rx="55" ry="65" fill="#FCD34D" />
        
        {/* Head */}
        <circle cx="100" cy="80" r="55" fill="#FDE68A" />
        
        {/* Hair */}
        <path
          d="M45 80C45 50 70 30 100 30C130 30 155 50 155 80"
          fill="#8B5CF6"
          opacity="0.8"
        />
        
        {/* Hair bun */}
        <circle cx="75" cy="42" r="12" fill="#8B5CF6" />
        <circle cx="125" cy="42" r="12" fill="#8B5CF6" />
        
        {/* Eyes */}
        <ellipse cx="80" cy="78" rx="8" ry="10" fill="#1F2937">
          <animate attributeName="rx" values="8;10;8" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="120" cy="78" rx="8" ry="10" fill="#1F2937">
          <animate attributeName="rx" values="8;10;8" dur="3s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Eye shine */}
        <circle cx="84" cy="74" r="3" fill="white" opacity="0.8" />
        <circle cx="124" cy="74" r="3" fill="white" opacity="0.8" />
        
        {/* Blush */}
        <ellipse cx="68" cy="90" rx="10" ry="6" fill="#FCA5A5" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.3;0.5" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="132" cy="90" rx="10" ry="6" fill="#FCA5A5" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.3;0.5" dur="2s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Mouth - Smile */}
        <path
          d="M88 100C92 106 108 106 112 100"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <animate attributeName="d" values="M88 100C92 106 108 106 112 100;M88 102C92 108 108 108 112 102;M88 100C92 106 108 106 112 100" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Cheek sparkle */}
        <circle cx="60" cy="65" r="3" fill="#FCD34D" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="65" r="3" fill="#FCD34D" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Hand wave */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 155 145;-15 155 145;0 155 145"
            dur="2s"
            repeatCount="indefinite"
          />
          <ellipse cx="155" cy="145" rx="12" ry="8" fill="#FDE68A" />
          <circle cx="165" cy="138" r="5" fill="#FDE68A" />
          <circle cx="170" cy="145" r="5" fill="#FDE68A" />
          <circle cx="165" cy="152" r="5" fill="#FDE68A" />
        </g>
        
        {/* Heart floating */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;-10,-20;-20,-40"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="1;0.5;0" dur="3s" repeatCount="indefinite" />
          <text x="30" y="30" fontSize="16" fill="#EF4444">❤️</text>
        </g>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;10,-25;20,-50"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="1;0.5;0" dur="4s" repeatCount="indefinite" />
          <text x="150" y="25" fontSize="14" fill="#EF4444">❤️</text>
        </g>
        
        {/* Sparkle around avatar */}
        <circle cx="30" cy="50" r="3" fill="#FCD34D">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="50" r="3" fill="#FCD34D">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="20" cy="100" r="2" fill="#A78BFA">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="100" r="2" fill="#A78BFA">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" />
        </circle>
        
        {/* "HI" speech bubble */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;0,-5;0,0"
            dur="2s"
            repeatCount="indefinite"
          />
          <rect x="35" y="20" width="40" height="24" rx="12" fill="white" opacity="0.9" stroke="#E5E7EB" strokeWidth="1.5" />
          <text x="43" y="36" fontSize="14" fontWeight="bold" fill="#8B5CF6">HI! 👋</text>
        </g>
      </svg>
    </div>
  );
}