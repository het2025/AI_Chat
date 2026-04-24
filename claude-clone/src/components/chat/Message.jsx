import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { ClaudeLogo, IconCopy, IconThumbUp, IconThumbDown, IconRefresh, IconPencil } from "../icons/index.jsx";
import Avatar from "../layout/Avatar.jsx";
import { renderMarkdown } from "../../utils/markdown.jsx";

const Message = memo(function Message({ msg, isStreaming, onEdit, onRegenerate }) {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [msg.content]);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(msg.content);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [msg.content, isSpeaking]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const content = useMemo(() => {
    if (msg.role === "user") return msg.content;
    return renderMarkdown(msg.content);
  }, [msg.content, msg.role]);

  const handleEditSubmit = useCallback(() => {
    if (editText.trim() && editText !== msg.content) {
      onEdit(msg.id, editText.trim());
    }
    setIsEditing(false);
  }, [editText, msg.content, msg.id, onEdit]);

  // ─── User message ──────────────────────────────────────
  if (msg.role === "user") {
    return (
      <div
        className="msg-in"
        style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 8, marginBottom: 24, position: "relative" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {isEditing ? (
            <div style={{ width: "100%", maxWidth: 600, background: "var(--bg-tertiary)", borderRadius: 18, border: "1px solid var(--border)", padding: 12 }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: "100%", minHeight: 60, background: "transparent", border: "none", outline: "none", resize: "none", color: "var(--text-primary)", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6 }}
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleEditSubmit} style={{ padding: "6px 14px", borderRadius: 99, border: "none", background: "var(--accent)", color: "white", fontSize: 13, cursor: "pointer" }}>Save & Submit</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    opacity: hovering ? 1 : 0, transition: "opacity 150ms",
                    width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent",
                    color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <IconPencil />
                </button>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, maxWidth: "min(85%, 600px)" }}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {msg.attachments.map(att => (
                        <div key={att.id} style={{
                          width: 48, height: 48, borderRadius: 8, overflow: "hidden",
                          border: "1px solid var(--border)", background: "var(--bg-tertiary)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {att.type === "image" ? (
                            <img src={att.data} alt="attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: 9, color: "var(--text-secondary)", textAlign: "center", padding: 2, wordBreak: "break-all" }}>{att.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content && (
                    <div style={{
                      background: "var(--user-bubble)", borderRadius: "18px 18px 4px 18px",
                      padding: "10px 16px", fontSize: 14,
                      lineHeight: 1.6, color: "var(--text-primary)",
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                textAlign: "right", fontSize: 11, color: "var(--text-tertiary)", marginTop: 4,
                opacity: hovering ? 1 : 0, transition: "opacity 150ms ease",
              }}>
                {msg.time}
              </div>
            </>
          )}
        </div>
        <Avatar size={28} />
      </div>
    );
  }

  // ─── Assistant message ─────────────────────────────────
  return (
    <div
      className="msg-in"
      style={{ marginBottom: 28 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ClaudeLogo size={22} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Patel</span>
        <div style={{
          display: "flex", gap: 2, marginLeft: 4,
          opacity: hovering && !isStreaming ? 1 : 0, transition: "opacity 150ms ease",
        }}>
          {[
            { icon: copied ? <span style={{ fontSize: 10, padding: "0 2px" }}>✓</span> : <IconCopy />, action: handleCopy, label: "Copy" },
            { icon: isSpeaking ? <span style={{ fontSize: 12 }}>⏹</span> : <span style={{ fontSize: 12 }}>🔊</span>, action: handleSpeak, label: isSpeaking ? "Stop" : "Speak", active: isSpeaking },
            { icon: <IconThumbUp />, action: () => setLiked("up"), label: "Like", active: liked === "up" },
            { icon: <IconThumbDown />, action: () => setLiked("down"), label: "Dislike", active: liked === "down" },
            { icon: <IconRefresh />, action: () => onRegenerate(msg.id), label: "Regenerate" },
          ].map(({ icon, action, label, active }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              style={{
                width: 28, height: 28, borderRadius: 6, border: "none",
                background: active ? "var(--bg-tertiary)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = active ? "var(--bg-tertiary)" : "transparent")}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div style={{
        fontSize: 14, lineHeight: 1.75, color: "var(--text-primary)",
        maxWidth: "800px", width: "100%", margin: "0 auto", textAlign: "left", padding: "0 8px",
      }}>
        {content}
        {isStreaming && <span className="cursor-blink" style={{ marginLeft: 1 }}>|</span>}
      </div>
    </div>
  );
});

export default Message;
