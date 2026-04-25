import { memo } from "react";
import { ClaudeLogo } from "../icons/index.jsx";

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
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      flex: 1, padding: "40px 24px", textAlign: "center",
      background: "var(--bg-primary, #ffffff)" // SOLID BACKGROUND
    }}>
      <div style={{ marginBottom: 20 }}>
        <ClaudeLogo size={48} />
      </div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
        {greeting}, HeT
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 36 }}>
        How can I help you today?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 520 }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            className={`card-in-${i}`}
            onClick={() => onSuggestion(`${s.title} — ${s.sub}`)}
            style={{
              textAlign: "left", padding: 16, borderRadius: 12,
              border: "1px solid var(--border)", 
              background: "var(--bg-secondary, #f9f9f8)", // SOLID BUTTON BACKGROUND
              cursor: "pointer", transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, marginBottom: 8,
            }}>{s.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
});

export default WelcomeScreen;
