import { memo } from "react";
import { ClaudeLogo } from "../icons/index.jsx";
import MagicLoader from "../ui/MagicLoader.jsx";

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="msg-in" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ClaudeLogo size={22} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Patel</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}>
        <MagicLoader size={48} speed={1.5} particleCount={2} hueRange={[20, 60]} />
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", marginLeft: 4 }}>
          Thinking...
        </span>
      </div>
    </div>
  );
});

export default TypingIndicator;
