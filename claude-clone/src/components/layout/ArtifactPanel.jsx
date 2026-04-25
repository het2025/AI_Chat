import { memo, useState, useEffect, useRef, useMemo } from "react";
import { IconCode, IconPlay, IconX, IconCopy } from "../icons/index.jsx";
import CodeBlock from "../ui/CodeBlock.jsx";

const ArtifactPanel = memo(function ArtifactPanel({ artifact, onClose }) {
  const [tab, setTab] = useState("preview"); 
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    const lang = artifact?.lang?.toLowerCase() || "";
    const previewable = ["html", "css", "js", "javascript", "svg"].includes(lang);
    setTab(previewable ? "preview" : "code");
    setIsLoading(true);
  }, [artifact]);

  if (!artifact) return null;

  const lang = artifact.lang?.toLowerCase() || "";
  const isPreviewable = ["html", "css", "js", "javascript", "svg"].includes(lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const srcDoc = useMemo(() => {
    if (!isPreviewable) return "";
    
    const baseStyle = `
      body { 
        margin: 0; 
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: white;
        color: #1a1a1a;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .content-wrap { padding: 24px; flex: 1; overflow: auto; }
    `;

    if (lang === "html") {
      if (artifact.code.includes("<html") || artifact.code.includes("<body")) return artifact.code;
      return `<html><head><style>${baseStyle}</style></head><body><div class="content-wrap">${artifact.code}</div></body></html>`;
    }

    if (lang === "svg") {
      // CENTERED AND SCALED SVG PREVIEW
      return `
        <html>
          <body style="margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:#f4f4f0;">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:40px; box-sizing:border-box;">
              ${artifact.code.replace(/<svg/, '<svg style="max-width:100%; max-height:100%; width:auto; height:auto; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.1))"')}
            </div>
          </body>
        </html>`;
    }
    
    if (lang === "css") {
      return `
        <html>
          <head><style>${baseStyle} ${artifact.code}</style></head>
          <body>
            <div class="content-wrap">
              <div style="background:#f9f9f8; border:1px dashed #ccc; padding:40px; border-radius:12px; text-align:center;">
                <h2 style="margin:0 0 10px 0">CSS Applied</h2>
                <p style="color:#666">Your styles are active in this preview.</p>
                <div class="preview-element" style="margin-top:20px; padding:20px; background:white; border-radius:8px; display:inline-block; border:1px solid #eee;">
                  Target Element
                </div>
              </div>
            </div>
          </body>
        </html>`;
    }
    
    if (lang === "js" || lang === "javascript") {
      return `<html><head><style>${baseStyle}</style></head><body><div id="root" class="content-wrap"></div><script>
        (function() {
          const root = document.getElementById('root');
          try {
            ${artifact.code}
          } catch (err) {
            root.innerHTML = '<div style="color:#ef4444; background:#fef2f2; padding:20px; border-radius:12px; border:1px solid #fee2e2;">' +
              '<h3 style="margin:0 0 10px 0">Runtime Error</h3>' +
              '<pre style="margin:0; font-size:13px; white-space:pre-wrap; font-family:monospace">' + err.message + '</pre>' +
            '</div>';
          }
        })();
      </script></body></html>`;
    }
    
    return "";
  }, [artifact.code, lang, isPreviewable]);

  return (
    <div 
      className="artifact-panel-container"
      style={{
        width: "min(95vw, 650px)", flexShrink: 0, height: "100%", borderLeft: "1px solid var(--border)",
        background: "var(--bg-secondary)", display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 40px rgba(0,0,0,0.12)", zIndex: 100, position: "relative"
      }}
    >
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .artifact-panel-container { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 8px 20px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #1a1a1a; boxShadow: 0 4px 12px rgba(0,0,0,0.08); }
        .tab-btn.inactive { background: transparent; color: var(--text-tertiary); }
        .tab-btn.inactive:hover { color: var(--text-primary); background: rgba(0,0,0,0.04); }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)"
      }}>
        <div>
           <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {lang.toUpperCase()} Preview
           </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", background: "var(--bg-tertiary)", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setTab("preview")} className={`tab-btn ${tab === "preview" ? "active" : "inactive"}`} disabled={!isPreviewable}>
              <IconPlay size={14} fill={tab === "preview" ? "#D97757" : "currentColor"} /> Preview
            </button>
            <button onClick={() => setTab("code")} className={`tab-btn ${tab === "code" ? "active" : "inactive"}`}>
              <IconCode size={14} /> Code
            </button>
          </div>

          <div style={{ width: 1, height: 24, background: "var(--border)" }}></div>

          <button onClick={handleCopy} style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "var(--bg-tertiary)", color: copied ? "#10b981" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconCopy size={18} />
          </button>

          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "#1a1a1a", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconX size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {tab === "code" ? (
          <div className="custom-scroll" style={{ padding: 24, height: "100%", overflowY: "auto", background: "var(--bg-primary)" }}>
            <CodeBlock lang={artifact.lang} code={artifact.code} />
          </div>
        ) : (
          <>
            {isLoading && (
               <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "white", zIndex: 10 }}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D97757]"></div>
               </div>
            )}
            <iframe ref={iframeRef} srcDoc={srcDoc} onLoad={() => setIsLoading(false)} title="Artifact Preview" sandbox="allow-scripts allow-forms allow-popups" style={{ width: "100%", height: "100%", border: "none", background: "white" }} />
          </>
        )}
      </div>
    </div>
  );
});

export default ArtifactPanel;
