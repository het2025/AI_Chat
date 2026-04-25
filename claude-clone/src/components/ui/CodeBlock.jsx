import { useState, useCallback, useEffect, useRef, memo } from "react";
import hljs from "highlight.js";
import { IconPlay, IconCopy } from "../icons/index.jsx";

const CodeBlock = memo(function CodeBlock({ lang, code, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const lastHighlightedCode = useRef("");

  // Only highlight when not streaming or when a significant chunk is added
  useEffect(() => {
    if (!codeRef.current) return;
    
    // During streaming, we avoid heavy highlighting to prevent flickering
    if (isStreaming) {
        // Just set the text content directly for speed and stability
        codeRef.current.textContent = code;
        return;
    }

    // When streaming stops, apply the full highlight.js effect
    if (lastHighlightedCode.current !== code) {
      codeRef.current.removeAttribute("data-highlighted");
      codeRef.current.textContent = code;
      try {
        hljs.highlightElement(codeRef.current);
        lastHighlightedCode.current = code;
      } catch (e) {
        console.error("Highlight error:", e);
      }
    }
  }, [code, lang, isStreaming]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleOpenArtifact = useCallback(() => {
    window.dispatchEvent(new CustomEvent("patel-open-artifact", { detail: { code, lang } }));
  }, [code, lang]);

  const isArtifact = ["html", "css", "js", "javascript", "svg"].includes(lang?.toLowerCase());

  return (
    <div className="code-block-wrap" style={{ 
      borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", 
      background: "#0d1117", margin: "16px 0",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div className="code-block-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: "#161b22",
        borderBottom: "1px solid #30363d"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
           <span style={{ fontSize: 11, fontWeight: 800, color: "#8b949e", textTransform: "uppercase" }}>
             {lang || "code"}
           </span>
           {isArtifact && !isStreaming && (
             <span style={{ 
               fontSize: 9, fontWeight: 900, background: "rgba(217, 119, 87, 0.2)", color: "#D97757", 
               padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" 
             }}>
               Ready to Preview
             </span>
           )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isArtifact && !isStreaming && (
            <button 
              onClick={handleOpenArtifact}
              style={{ 
                display: "flex", alignItems: "center", gap: 6, 
                padding: "6px 12px", borderRadius: 8, border: "none",
                background: "#D97757", color: "#FFFFFF",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <IconPlay size={12} fill="white" /> Run Preview
            </button>
          )}
          <button 
            onClick={handleCopy}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid #30363d",
              background: "transparent", color: "#8b949e",
              fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre style={{ margin: 0, padding: "20px", overflowX: "auto" }}>
        <code ref={codeRef} className={`language-${lang || 'text'}`} style={{ 
          fontSize: 13, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, color: "#e6edf3"
        }}>
          {code}
        </code>
      </pre>
    </div>
  );
});

export default CodeBlock;
