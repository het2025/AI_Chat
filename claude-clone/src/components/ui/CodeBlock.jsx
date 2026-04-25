import { useState, useCallback, useEffect, useRef } from "react";
import hljs from "highlight.js";
import { IconPlay } from "../icons/index.jsx";

export default function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute("data-highlighted");
      try {
        hljs.highlightElement(codeRef.current);
      } catch {
        // fallback
      }
    }
  }, [code, lang]);

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
      background: "var(--code-bg)", margin: "16px 0",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <div className="code-block-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: "var(--code-header-bg)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
           <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
             {lang || "code"}
           </span>
           {isArtifact && (
             <span style={{ 
               fontSize: 9, fontWeight: 900, background: "rgba(217, 119, 87, 0.1)", color: "#D97757", 
               padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" 
             }}>
               Preview Available
             </span>
           )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isArtifact && (
            <button 
              onClick={handleOpenArtifact}
              style={{ 
                display: "flex", alignItems: "center", gap: 6, 
                padding: "6px 12px", borderRadius: 8, border: "none",
                background: "#D97757", color: "#FFFFFF",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(217, 119, 87, 0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#C96442";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#D97757";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <IconPlay size={12} fill="white" /> Run Preview
            </button>
          )}
          <button 
            onClick={handleCopy}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--bg-primary)", color: "var(--text-primary)",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-primary)"}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre style={{ margin: 0, padding: "20px", overflowX: "auto" }}>
        <code ref={codeRef} className={`block-code ${lang ? `language-${lang}` : ""}`} style={{ 
          fontSize: 13, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 
        }}>
          {code}
        </code>
      </pre>
    </div>
  );
}
