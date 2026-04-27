import { memo, useState, useEffect, useRef, useMemo } from "react";
import { IconCode, IconPlay, IconX, IconCopy, IconRefresh } from "../icons/index.jsx";
import CodeBlock from "../ui/CodeBlock.jsx";
import MagicLoader from "../ui/MagicLoader.jsx";

const ArtifactPanel = memo(function ArtifactPanel({ artifact, onClose }) {
  const [tab, setTab] = useState("preview"); 
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
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
        min-height: 100vh;
      }
      .preview-wrap { padding: 24px; }
    `;

    if (lang === "html") {
      if (artifact.code.includes("<html") || artifact.code.includes("<body")) return artifact.code;
      return `<html><head><style>${baseStyle}</style></head><body><div class="preview-wrap">${artifact.code}</div></body></html>`;
    }

    if (lang === "svg") {
      return `
        <html>
          <body style="margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f8f9fa;">
            <div style="padding:40px; box-sizing:border-box; display:flex; align-items:center; justify-content:center;">
              ${artifact.code}
            </div>
          </body>
        </html>`;
    }
    
    if (lang === "css") {
      return `
        <html>
          <head><style>${baseStyle} ${artifact.code}</style></head>
          <body>
            <div class="preview-wrap">
              <div style="border:1px dashed #ccc; padding:40px; border-radius:12px; text-align:center;">
                <h3>CSS Styles Active</h3>
                <div class="test-box" style="margin-top:20px; padding:20px; border:1px solid #eee; display:inline-block;">Sample Component</div>
              </div>
            </div>
          </body>
        </html>`;
    }
    
    if (lang === "js" || lang === "javascript") {
      return `<html><head><style>${baseStyle}</style></head><body><div id="root" class="preview-wrap"></div><script>
        (function() {
          const root = document.getElementById('root');
          try {
            ${artifact.code}
          } catch (err) {
            root.innerHTML = '<div style="color:red; background:#fff5f5; padding:20px; border:1px solid #feb2b2; border-radius:8px;">' +
              '<strong>Runtime Error:</strong><pre>' + err.message + '</pre></div>';
          }
        })();
      </script></body></html>`;
    }
    
    return "";
  }, [artifact.code, lang, isPreviewable, refreshKey]);

  return (
    <div 
      className="artifact-panel-container"
      style={{
        width: "min(95vw, 650px)", flexShrink: 0, height: "100%", borderLeft: "1px solid var(--border)",
        background: "var(--bg-secondary)", display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 40px rgba(0,0,0,0.12)", zIndex: 1000, position: "relative"
      }}
    >
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .artifact-panel-container { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #1a1a1a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .tab-btn.inactive { background: transparent; color: var(--text-tertiary); }
        .tab-btn.inactive:hover { color: var(--text-primary); }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)"
      }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{lang.toUpperCase()} Preview</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "var(--bg-tertiary)", borderRadius: 10, padding: 3 }}>
            <button onClick={() => setTab("preview")} className={`tab-btn ${tab === "preview" ? "active" : "inactive"}`} disabled={!isPreviewable}>
              <IconPlay size={12} fill={tab === "preview" ? "#D97757" : "currentColor"} /> Preview
            </button>
            <button onClick={() => setTab("code")} className={`tab-btn ${tab === "code" ? "active" : "inactive"}`}>
              <IconCode size={12} /> Code
            </button>
          </div>

          <div style={{ width: 1, height: 20, background: "var(--border)" }}></div>

          <button onClick={handleRefresh} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Refresh Preview">
            <IconRefresh size={16} />
          </button>

          <button onClick={handleCopy} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: copied ? "#10b981" : "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Copy Code">
            <IconCopy size={16} />
          </button>

          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#1a1a1a", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconX size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "white" }}>
        {tab === "code" ? (
          <div className="custom-scroll" style={{ padding: 20, height: "100%", overflowY: "auto", background: "var(--bg-primary)" }}>
            <CodeBlock lang={artifact.lang} code={artifact.code} />
          </div>
        ) : (
          <>
            {isLoading && (
               <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "white", zIndex: 10 }}>
                  <MagicLoader size={60} speed={1.5} particleCount={2} hueRange={[10, 40]} />
               </div>
            )}
            <iframe 
              ref={iframeRef} 
              key={refreshKey}
              srcDoc={srcDoc} 
              onLoad={() => setIsLoading(false)} 
              title="Preview" 
              sandbox="allow-scripts allow-forms allow-popups" 
              style={{ width: "100%", height: "100%", border: "none" }} 
            />
          </>
        )}
      </div>
    </div>
  );
});

export default ArtifactPanel;
