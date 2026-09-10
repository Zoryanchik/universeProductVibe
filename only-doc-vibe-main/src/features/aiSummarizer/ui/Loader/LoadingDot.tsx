import React from "react";

interface LoadingDotProps {
  delayMs?: number;
}

export const LoadingDot: React.FC<LoadingDotProps> = ({ delayMs = 0 }) => (
  <span
    className="inline-block h-2 w-2 rounded-full bg-gray-900 opacity-30"
    style={{
      animation: "ai-loader-pulse 1.2s ease-in-out infinite",
      animationDelay: `${delayMs}ms`,
    }}
  />
);
