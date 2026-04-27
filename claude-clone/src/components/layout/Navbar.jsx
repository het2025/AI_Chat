import { memo, useState, useRef, useEffect, useCallback } from "react";
import { IconHamburger, IconChevronDown, IconCheck, IconShare, IconSun, IconMoon } from "../icons/index.jsx";
import Avatar from "./Avatar.jsx";
import { MODELS } from "../../utils/constants.js";
import { PERSONAS } from "../../utils/personas.js";
import { MagneticButton } from "../ui/MagneticButton.jsx";

const Navbar = memo(function Navbar({ model, setModel, personaId, setPersonaId, darkMode, toggleDark, onToggleSidebar, onShare, onExportPDF }) {
  const [modelOpen, setModelOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [darkKey, setDarkKey] = useState(0);
  const dropRef = useRef(null);
  const personaRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setModelOpen(false);
      if (personaRef.current && !personaRef.current.contains(e.target)) setPersonaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = useCallback(() => {
    setDarkKey((k) => k + 1);
    toggleDark();
  }, [toggleDark]);

  const currentModel = MODELS.find((m) => m.id === model) || MODELS[1];
  const currentPersona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  return (
    <div style={{
      height: 56, 
      borderBottom: "1px solid var(--border)", 
      display: "flex",
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "0 20px",
      flexShrink: 0, 
      position: "relative",
      zIndex: 1000, 
      background: "var(--bg-primary, #ffffff)", // SOLID FALLBACK
      opacity: 1, // FORCE FULL OPACITY
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onToggleSidebar} className="sidebar-toggle-btn" style={{
          width: 36, height: 36, borderRadius: 10, border: "none",
          background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
          alignItems: "center", justifyContent: "center", display: "flex",
          transition: "all 0.15s ease"
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        ><IconHamburger size={20} /></button>

        {/* Model selector */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button onClick={() => setModelOpen((o) => !o)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
            borderRadius: 12, border: "1px solid var(--border)",
            background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13,
            fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
            onMouseEnter={(e) => (e.currentTarget.style.border = "1px solid var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid var(--border)")}
          >
            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentModel.label}
            </span>
            <IconChevronDown size={14} />
          </button>

          {modelOpen && (
            <div className="dropdown-in shadow-xl" style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0,
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              minWidth: 260, overflow: "hidden", zIndex: 100,
              padding: 6
            }}>
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => { setModel(m.id); setModelOpen(false); }} style={{
                  width: "100%", textAlign: "left", padding: "10px 12px",
                  border: "none", borderRadius: 8, background: model === m.id ? "var(--bg-tertiary)" : "transparent", 
                  cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
                  color: "var(--text-primary)", transition: "background 150ms",
                }}
                  onMouseEnter={(e) => { if (model !== m.id) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                  onMouseLeave={(e) => { if (model !== m.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: model === m.id ? 700 : 500 }}>{m.label}</span>
                      {m.badge && (
                        <span style={{
                          fontSize: 9, padding: "1px 6px", borderRadius: 6,
                          background: m.badgeColor, color: "white", fontWeight: 700,
                        }}>{m.badge}</span>
                      )}
                    </div>
                    {model === m.id && <IconCheck size={14} color="#D97757" />}
                  </div>
                  {m.description && (
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                      {m.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Persona selector */}
        <div ref={personaRef} style={{ position: "relative" }}>
          <button onClick={() => setPersonaOpen((o) => !o)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
            borderRadius: 12, border: "1px solid var(--border)",
            background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13,
            fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease"
          }}
          >
            <span style={{ fontSize: 14 }}>{currentPersona.icon}</span>
            <span>{currentPersona.name}</span>
            <IconChevronDown size={14} />
          </button>

          {personaOpen && (
            <div className="dropdown-in shadow-xl" style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0,
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              minWidth: 260, overflow: "hidden", zIndex: 100,
              padding: 6
            }}>
              {PERSONAS.map((p) => (
                <button key={p.id} onClick={() => { setPersonaId(p.id); setPersonaOpen(false); }} style={{
                  width: "100%", textAlign: "left", padding: "10px 12px",
                  border: "none", borderRadius: 8, background: personaId === p.id ? "var(--bg-tertiary)" : "transparent", 
                  cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
                  color: "var(--text-primary)", transition: "background 150ms",
                }}
                  onMouseEnter={(e) => { if (personaId !== p.id) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                  onMouseLeave={(e) => { if (personaId !== p.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: personaId === p.id ? 700 : 500 }}>{p.name}</span>
                    </div>
                    {personaId === p.id && <IconCheck size={14} color="#D97757" />}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", paddingLeft: 24 }}>
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[
          { icon: <IconShare size={18} />, action: onShare, title: "Export Markdown" },
          { icon: <span style={{ fontSize: 18 }}>📄</span>, action: onExportPDF, title: "Export PDF" },
          { icon: <span key={darkKey} className="spin-in">{darkMode ? <IconSun size={18} /> : <IconMoon size={18} />}</span>, action: handleToggle, title: "Toggle Theme" },
          { icon: <Avatar size={32} />, action: () => {} },
        ].map((btn, i) => (
          <MagneticButton 
            key={i} 
            onClick={btn.action} 
            title={btn.title} 
            variant="none"
            size="none"
            radius={40}
            strength={0.3}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {btn.icon}
          </MagneticButton>
        ))}
      </div>
    </div>
  );
});

export default Navbar;
