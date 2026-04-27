import React from "react";
import { cn } from "../../lib/utils";

/**
 * AuroraTextEffect Component - Robust Version
 * Uses background-clipping to ensure perfect rendering in both Light and Dark themes.
 */
export function AuroraTextEffect({
  text,
  className,
  textClassName,
  fontSize = "clamp(3rem, 8vw, 7rem)",
  colors = {
    first: "#22d3ee",  // cyan-400
    second: "#fbbf24", // yellow-400
    third: "#4ade80",  // green-400
    fourth: "#D97757", // theme orange
  },
}) {
  const keyframes = `
    @keyframes aurora-text {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-transparent w-full py-4",
        className
      )}
    >
      <style>{keyframes}</style>
      <h2
        className={cn(
          "font-extrabold tracking-tight inline-block text-transparent bg-clip-text leading-tight",
          textClassName
        )}
        style={{
          fontSize,
          backgroundImage: `linear-gradient(45deg, ${colors.first}, ${colors.second}, ${colors.third}, ${colors.fourth}, ${colors.first})`,
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          animation: "aurora-text 8s ease infinite",
          // Text fallback for very old browsers
          color: "transparent",
        }}
      >
        {text}
      </h2>
    </div>
  );
}
