import { memo, useState } from "react";
import { ClaudeLogo } from "../icons/index.jsx";
import { AuroraTextEffect } from "../ui/AuroraTextEffect.jsx";
import { GlowingCards, GlowingCard } from "../ui/GlowingCards.jsx";
import InteractiveGridBackground from "../ui/InteractiveGridBackground.jsx";

const WelcomeScreen = memo(function WelcomeScreen({ onSuggestion }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const suggestions = [
    { emoji: "📝", title: "Help me write",      sub: "a cover letter for a job" },
    { emoji: "💡", title: "Explain a concept",   sub: "like I'm five years old" },
    { emoji: "🔍", title: "Summarize",           sub: "a long document or article" },
    { emoji: "💻", title: "Write code",          sub: "for a React component" },
  ];

  return (
    <InteractiveGridBackground
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
      gridSize={40}
      glowRadius={15}
      effectColor="rgba(217, 119, 87, 0.4)" // claude color
      darkEffectColor="rgba(217, 119, 87, 0.4)"
      gridColor="var(--bg-tertiary)"
      darkGridColor="var(--bg-tertiary)"
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px 120px", textAlign: "center",
        width: "100%", height: "100%"
      }}>
        <div style={{ marginBottom: 4 }}>
          <ClaudeLogo size={80} />
        </div>
        <AuroraTextEffect 
          text={`${greeting}, HeT`} 
          fontSize="4.5rem" 
          className="mb-2"
          textClassName="leading-tight"
        />
        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 20 }}>
          How can I help you today?
        </p>
        
        <GlowingCards maxWidth="520px" gap="10px" glowRadius={20}>
          {suggestions.map((s, i) => {
            const colors = ["#22d3ee", "#fbbf24", "#4ade80", "#D97757"];
            return (
              <GlowingCard
                key={i}
                glowColor={colors[i]}
                onClick={() => onSuggestion(`${s.title} — ${s.sub}`)}
                className="!p-4 text-left"
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "var(--bg-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, marginBottom: 8,
                }}>{s.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.sub}</div>
              </GlowingCard>
            );
          })}
        </GlowingCards>
      </div>
    </InteractiveGridBackground>
  );
});

export default WelcomeScreen;
