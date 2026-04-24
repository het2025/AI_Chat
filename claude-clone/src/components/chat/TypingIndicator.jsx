import { memo } from "react";
import { ClaudeLogo } from "../icons/index.jsx";

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="msg-in" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ClaudeLogo size={22} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Patel</span>
      </div>
      <div style={{ display: "flex", gap: 6, paddingLeft: 2 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`dot-${i + 1}`}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)" }}
          />
        ))}
      </div>
    </div>
  );
});

export default TypingIndicator;
