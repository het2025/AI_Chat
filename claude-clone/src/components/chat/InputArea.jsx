import { memo, useState, useRef, useEffect, useCallback } from "react";
import { IconPaperclip, IconSearch, IconZap, IconArrowUp, IconStop } from "../icons/index.jsx";

const InputArea = memo(function InputArea({ onSend, isStreaming, onStop, initialValue, setInitialValue, onEditLast }) {
  const [text, setText] = useState(initialValue || "");
  const [attachments, setAttachments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [focused, setFocused] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
        autoResize();
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  useEffect(() => {
    if (initialValue) { setText(initialValue); setInitialValue(""); }
  }, [initialValue, setInitialValue]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, []);

  const handleChange = useCallback((e) => {
    setText(e.target.value);
    autoResize();
  }, [autoResize]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = text.slice(0, start) + "  " + text.slice(end);
      setText(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isStreaming) {
        onSend(text.trim());
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    }
    if (e.key === "ArrowUp" && text === "") {
      e.preventDefault();
      onEditLast?.();
    }
  }, [text, isStreaming, onSend, onEditLast]);

  const handleSend = useCallback(() => {
    if (isStreaming) { onStop(); return; }
    if (text.trim() || attachments.length > 0) {
      onSend(text.trim(), attachments);
      setText("");
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }, [text, attachments, isStreaming, onSend, onStop]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    e.target.value = ""; // reset input
    
    files.forEach(file => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: isImage ? "image" : "text",
          data: ev.target.result // Base64 for images, raw text for files
        }]);
      };
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const hasText = text.trim().length > 0 || attachments.length > 0;

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "linear-gradient(to top, var(--bg-primary) 80%, transparent)",
      padding: "20px 16px 16px",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <div style={{
          background: "var(--bg-input)", borderRadius: 16,
          border: focused ? "1px solid rgba(217,119,6,0.45)" : "1px solid var(--border)",
          boxShadow: focused ? "0 4px 24px rgba(217,119,6,0.08)" : "0 4px 24px rgba(0,0,0,0.06)",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
        }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 6, padding: "10px 12px 6px", flexWrap: "wrap" }}>
            <input type="file" multiple accept="image/*,.txt,.md,.js,.py,.jsx,.css,.html" hidden ref={fileInputRef} onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 9999, fontSize: 12, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-secondary)",
                cursor: "pointer", transition: "background 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <IconPaperclip /><span>Attach</span>
            </button>

            <button
              onClick={toggleListening}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 9999, fontSize: 12, border: isListening ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: isListening ? "rgba(217,119,6,0.1)" : "transparent",
                color: isListening ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isListening ? "rgba(217,119,6,0.15)" : "var(--bg-tertiary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isListening ? "rgba(217,119,6,0.1)" : "transparent")}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isListening ? (
                  <span className="cursor-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", marginRight: 4 }}></span>
                ) : (
                  <span style={{ fontSize: 14, marginRight: 2 }}>🎤</span>
                )}
              </span>
              <span>{isListening ? "Listening..." : "Voice"}</span>
            </button>
            
            {[
              { icon: <IconSearch size={13} />, label: "Search" },
              { icon: <IconZap />, label: "Projects" },
            ].map((btn) => (
              <button key={btn.label} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 9999, fontSize: 12, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-secondary)",
                cursor: "pointer", transition: "background 150ms",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {btn.icon}<span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: 8, padding: "8px 14px 0", flexWrap: "wrap" }}>
              {attachments.map(att => (
                <div key={att.id} style={{
                  position: "relative", width: 60, height: 60, borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-tertiary)",
                  overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {att.type === "image" ? (
                    <img src={att.data} alt="attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", wordBreak: "break-all", padding: 4 }}>
                      {att.name}
                    </div>
                  )}
                  <button onClick={() => removeAttachment(att.id)} style={{
                    position: "absolute", top: 2, right: 2, width: 18, height: 18,
                    borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)",
                    color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="How can I help you?"
            style={{
              display: "block", width: "100%", border: "none", outline: "none",
              background: "transparent", resize: "none", padding: "4px 14px 4px",
              fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)",
              minHeight: 28, maxHeight: 200, overflowY: "auto",
              fontFamily: "inherit",
            }}
            rows={1}
          />

          {/* Bottom row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px 10px" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              Patel never make mistakes. Check important info.
            </span>
            <button
              onClick={handleSend}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              style={{
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: isStreaming ? "var(--text-primary)" : hasText ? "var(--accent)" : "var(--bg-tertiary)",
                color: isStreaming ? "white" : hasText ? "white" : "var(--text-tertiary)",
                cursor: hasText || isStreaming ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
                boxShadow: hasText ? "0 2px 8px rgba(217,119,6,0.3)" : "none",
              }}
            >
              {isStreaming ? <IconStop /> : <IconArrowUp />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InputArea;
