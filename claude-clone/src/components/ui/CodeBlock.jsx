import { useState, useCallback, useEffect, useRef } from "react";
import hljs from "highlight.js";
import { IconPlay } from "../icons/index.jsx";

export default function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      // Reset before re-highlighting
      codeRef.current.removeAttribute("data-highlighted");
      try {
        hljs.highlightElement(codeRef.current);
      } catch {
        // fallback: no highlighting
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
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span>{lang || "code"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isArtifact && (
            <button className="code-block-copy-btn" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-primary)", background: "var(--bg-tertiary)" }} onClick={handleOpenArtifact}>
              <IconPlay size={12} /> Open Preview
            </button>
          )}
          <button className="code-block-copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="code-block-pre">
        <code ref={codeRef} className={`block-code ${lang ? `language-${lang}` : ""}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
