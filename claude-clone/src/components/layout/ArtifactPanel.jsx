import { memo, useState, useEffect, useRef, useMemo } from "react";
import { IconCode, IconPlay, IconX } from "../icons/index.jsx";
import CodeBlock from "../ui/CodeBlock.jsx";

const ArtifactPanel = memo(function ArtifactPanel({ artifact, onClose }) {
  const [tab, setTab] = useState("preview"); // "preview" or "code"
  const iframeRef = useRef(null);

  useEffect(() => {
    // Determine if it's previewable
    const lang = artifact?.lang?.toLowerCase() || "";
    const previewable = ["html", "css", "js", "javascript", "svg"].includes(lang);
    if (!previewable) {
      setTab("code");
    }
  }, [artifact]);

  if (!artifact) return null;

  const lang = artifact.lang?.toLowerCase() || "";
  const isPreviewable = ["html", "css", "js", "javascript", "svg"].includes(lang);

  // Construct iframe content
  const srcDoc = useMemo(() => {
    if (!isPreviewable) return "";
    
    if (lang === "html") {
      return artifact.code;
    }

    if (lang === "svg") {
      return `<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8f9fa;">${artifact.code}</body></html>`;
    }
    
    if (lang === "css") {
      return `<html><head><style>${artifact.code}</style></head><body style="padding:20px;font-family:sans-serif;"><h1>CSS Preview</h1><p>The CSS has been injected. Add HTML to see it applied.</p></body></html>`;
    }
    
    if (lang === "js" || lang === "javascript") {
      return `<html><body style="padding:20px;font-family:sans-serif;"><div id="root"></div><script>
        try {
          ${artifact.code}
        } catch (err) {
          document.body.innerHTML = '<pre style="color:red">' + err.stack + '</pre>';
        }
      </script></body></html>`;
    }
    
    return "";
  }, [artifact.code, lang, isPreviewable]);

  return (
    <div style={{
      width: 500, flexShrink: 0, height: "100%", borderLeft: "1px solid var(--border)",
      background: "var(--bg-secondary)", display: "flex", flexDirection: "column",
      boxShadow: "-8px 0 24px rgba(0,0,0,0.05)", zIndex: 20
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "var(--bg-tertiary)", borderRadius: 8, padding: 3, gap: 2 }}>
            <button
              onClick={() => setTab("preview")}
              disabled={!isPreviewable}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
                border: "none", borderRadius: 6, fontSize: 13, fontWeight: tab === "preview" ? 500 : 400,
                background: tab === "preview" ? "var(--bg-primary)" : "transparent",
                color: tab === "preview" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: tab === "preview" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                cursor: isPreviewable ? "pointer" : "not-allowed", opacity: isPreviewable ? 1 : 0.4,
              }}
            >
              <IconPlay size={14} /> Preview
            </button>
            <button
              onClick={() => setTab("code")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
                border: "none", borderRadius: 6, fontSize: 13, fontWeight: tab === "code" ? 500 : 400,
                background: tab === "code" ? "var(--bg-primary)" : "transparent",
                color: tab === "code" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: tab === "code" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer",
              }}
            >
              <IconCode size={14} /> Code
            </button>
          </div>
        </div>
        
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent",
          color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
        }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <IconX size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {tab === "code" ? (
          <div className="custom-scroll" style={{ padding: 16, height: "100%", overflowY: "auto", background: "var(--bg-primary)" }}>
            <CodeBlock lang={artifact.lang} code={artifact.code} />
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Artifact Preview"
            sandbox="allow-scripts allow-forms allow-popups"
            style={{ width: "100%", height: "100%", border: "none", background: "white" }}
          />
        )}
      </div>
    </div>
  );
});

export default ArtifactPanel;
