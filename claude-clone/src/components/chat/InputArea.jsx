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
    e.target.value = ""; 
    files.forEach(file => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: isImage ? "image" : "text",
          data: ev.target.result 
        }]);
      };
      if (isImage) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const hasText = text.trim().length > 0 || attachments.length > 0;

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "var(--bg-primary)", // Force solid opaque background
      borderTop: "1px solid var(--border)", 
      padding: "20px 16px 16px",
      zIndex: 100, // Stay above messages
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <div style={{
          background: "var(--bg-input)", borderRadius: 20,
          border: focused ? "1px solid #D97757" : "1px solid var(--border)",
          boxShadow: focused ? "0 8px 30px rgba(217, 119, 87, 0.12)" : "0 4px 20px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
          overflow: "hidden"
        }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, padding: "12px 16px 8px" }}>
            <input type="file" multiple accept="image/*,.txt,.md,.js,.py,.jsx,.css,.html" hidden ref={fileInputRef} onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                borderRadius: 10, fontSize: 12, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-secondary)",
                cursor: "pointer", fontWeight: 600
              }}
            >
              <IconPaperclip size={14} /> Attach
            </button>

            <button
              onClick={toggleListening}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                borderRadius: 10, fontSize: 12, border: isListening ? "1px solid #D97757" : "1px solid var(--border)",
                background: isListening ? "rgba(217, 119, 87, 0.1)" : "transparent",
                color: isListening ? "#D97757" : "var(--text-secondary)",
                cursor: "pointer", fontWeight: 600
              }}
            >
              <span>{isListening ? "Listening..." : "🎤 Voice"}</span>
            </button>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
              {attachments.map(att => (
                <div key={att.id} style={{
                  position: "relative", width: 50, height: 50, borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-tertiary)",
                  overflow: "hidden"
                }}>
                  {att.type === "image" ? (
                    <img src={att.data} alt="attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontSize: 8, textAlign: "center", padding: 4 }}>{att.name}</div>
                  )}
                  <button onClick={() => removeAttachment(att.id)} style={{
                    position: "absolute", top: 0, right: 0, width: 16, height: 16,
                    background: "rgba(0,0,0,0.6)", color: "white", border: "none", fontSize: 10, cursor: "pointer"
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}

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
              background: "transparent", resize: "none", padding: "12px 16px",
              fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)",
              minHeight: 44, maxHeight: 200, overflowY: "auto",
              fontFamily: "inherit",
            }}
            rows={1}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 12px" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 }}>
              Press Enter to send, Shift + Enter for new line
            </span>
            <button
              onClick={handleSend}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: isStreaming ? "#1a1a1a" : hasText ? "#D97757" : "var(--bg-tertiary)",
                color: "white",
                cursor: hasText || isStreaming ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: hasText ? "0 4px 12px rgba(217,119,87,0.3)" : "none"
              }}
            >
              {isStreaming ? <IconStop size={18} fill="white" /> : <IconArrowUp size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InputArea;
