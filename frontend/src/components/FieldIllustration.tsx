import React from 'react';

interface FieldIllustrationProps {
  className?: string;
}

export const FieldIllustration: React.FC<FieldIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-70 dark:opacity-40 transition-opacity"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="skyGlow" x1="500" y1="0" x2="500" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D5851F" stopOpacity="0.12" />
            <stop offset="0.7" stopColor="#87A96B" stopOpacity="0.08" />
            <stop offset="1" stopColor="#87A96B" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="hillBack" x1="0" y1="120" x2="1000" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#87A96B" stopOpacity="0.22" />
            <stop offset="1" stopColor="#87A96B" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="hillMid" x1="0" y1="180" x2="1000" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#87A96B" stopOpacity="0.32" />
            <stop offset="1" stopColor="#5A3E2B" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="hillFront" x1="0" y1="240" x2="1000" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#87A96B" stopOpacity="0.45" />
            <stop offset="1" stopColor="#87A96B" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* Ambient Sky Backdrop */}
        <rect width="1000" height="360" fill="url(#skyGlow)" />

        {/* Sun disk aura */}
        <circle cx="820" cy="110" r="75" fill="#D5851F" fillOpacity="0.12" />
        <circle cx="820" cy="110" r="45" fill="#D5851F" fillOpacity="0.2" />

        {/* Distant Rolling Hills */}
        <path
          d="M0 210 Q 250 140, 520 180 T 1000 150 L 1000 360 L 0 360 Z"
          fill="url(#hillBack)"
        />

        {/* Mid-ground Contour Terraces */}
        <path
          d="M0 250 Q 300 190, 680 230 T 1000 200 L 1000 360 L 0 360 Z"
          fill="url(#hillMid)"
        />

        {/* Terraced Furrow Lines */}
        <path
          d="M 50 260 Q 350 205, 720 245 T 980 215"
          stroke="#5A3E2B"
          strokeOpacity="0.15"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M 20 280 Q 380 225, 760 265 T 990 235"
          stroke="#5A3E2B"
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />

        {/* Foreground Crop Ridges */}
        <path
          d="M0 295 Q 340 250, 720 285 T 1000 260 L 1000 360 L 0 360 Z"
          fill="url(#hillFront)"
        />

        {/* Subtle Stalk Motifs */}
        <g stroke="#87A96B" strokeWidth="2" strokeLinecap="round" opacity="0.65">
          {/* Stalk 1 */}
          <path d="M 120 320 Q 123 290, 126 270" />
          <path d="M 124 285 Q 115 280, 110 285" />
          <path d="M 125 277 Q 134 272, 138 276" />
          
          {/* Stalk 2 */}
          <path d="M 145 330 Q 148 295, 150 280" />
          <path d="M 149 300 Q 140 295, 136 300" />
          <path d="M 150 290 Q 158 285, 163 290" />

          {/* Stalk 3 */}
          <path d="M 380 340 Q 384 310, 386 290" />
          <path d="M 385 315 Q 375 310, 370 315" />
          <path d="M 386 305 Q 395 300, 400 305" />

          {/* Stalk 4 (Right) */}
          <path d="M 880 330 Q 882 300, 884 280" />
          <path d="M 883 305 Q 874 300, 870 305" />
          <path d="M 884 295 Q 893 290, 898 295" />
        </g>
      </svg>
    </div>
  );
};
