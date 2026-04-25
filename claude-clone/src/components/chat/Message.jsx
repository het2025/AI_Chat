import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { ClaudeLogo, IconCopy, IconThumbUp, IconThumbDown, IconRefresh, IconPencil } from "../icons/index.jsx";
import Avatar from "../layout/Avatar.jsx";
import { renderMarkdown } from "../../utils/markdown.jsx";

const Message = memo(function Message({ msg, isStreaming, onEdit, onRegenerate, isReadOnly = false }) {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [msg.content]);

  const handleEditSubmit = useCallback(() => {
    if (editText.trim() && editText !== msg.content) {
      onEdit?.(msg.id, editText.trim());
    }
    setIsEditing(false);
  }, [editText, msg.content, msg.id, onEdit]);

  // --- User Message View ---
  if (msg.role === "user") {
    return (
      <div className="msg-in" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 12, marginBottom: 24 }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {isEditing ? (
            <div style={{ width: "100%", maxWidth: 600, background: "var(--bg-tertiary)", borderRadius: 18, border: "1px solid var(--border)", padding: 12 }}>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ width: "100%", minHeight: 60, background: "transparent", border: "none", outline: "none", resize: "none", color: "var(--text-primary)", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6 }} autoFocus />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleEditSubmit} style={{ padding: "6px 14px", borderRadius: 99, border: "none", background: "var(--accent)", color: "white", fontSize: 13, cursor: "pointer" }}>Save</button>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                {!isReadOnly && hovering && (
                  <button onClick={() => setIsEditing(true)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer" }}><IconPencil size={14} /></button>
                )}
                <div style={{ background: "var(--user-bubble)", borderRadius: "20px 20px 4px 20px", padding: "12px 18px", fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)", maxWidth: "min(85%, 600px)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                  {msg.content}
                </div>
            </div>
          )}
        </div>
        <Avatar size={32} />
      </div>
    );
  }

  // --- Assistant Message View ---
  return (
    <div className="msg-in" style={{ marginBottom: 40 }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ padding: 4, background: "var(--bg-tertiary)", borderRadius: 8 }}>
            <ClaudeLogo size={20} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>PatelAI</span>
        {!isReadOnly && hovering && !isStreaming && (
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            <button onClick={handleCopy} title="Copy" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "var(--bg-tertiary)", color: copied ? "#10b981" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}>{copied ? "✓" : <IconCopy size={14} />}</button>
            <button onClick={() => onRegenerate?.(msg.id)} title="Regenerate" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}><IconRefresh size={14} /></button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 12px" }}>
        <div style={{ fontSize: 16, lineHeight: 1.85, color: "var(--text-primary)", fontWeight: 450 }}>
          <div style={{ display: "inline" }}>
            {renderMarkdown(msg.content || (isStreaming ? "..." : ""))}
          </div>
          {isStreaming && <span className="cursor-blink">|</span>}
        </div>
      </div>
    </div>
  );
});

export default Message;
