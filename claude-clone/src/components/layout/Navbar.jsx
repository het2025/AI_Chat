import { memo, useState, useRef, useEffect, useCallback } from "react";
import { IconHamburger, IconChevronDown, IconCheck, IconShare, IconSun, IconMoon } from "../icons/index.jsx";
import Avatar from "./Avatar.jsx";
import { MODELS } from "../../utils/constants.js";
import { PERSONAS } from "../../utils/personas.js";

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
      height: 52, borderBottom: "1px solid var(--border)", display: "flex",
      alignItems: "center", justifyContent: "space-between", padding: "0 16px",
      flexShrink: 0, position: "relative", zIndex: 10, background: "var(--bg-primary)",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onToggleSidebar} className="sidebar-toggle-btn" style={{
          width: 32, height: 32, borderRadius: "50%", border: "none",
          background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
          alignItems: "center", justifyContent: "center", display: "flex",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        ><IconHamburger /></button>

        {/* Model selector */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button onClick={() => setModelOpen((o) => !o)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            borderRadius: 9999, border: "1px solid var(--border)",
            background: "transparent", color: "var(--text-primary)", fontSize: 13,
            cursor: "pointer", transition: "background 150ms ease",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span>{currentModel.label}</span>
            <IconChevronDown />
          </button>

          {modelOpen && (
            <div className="dropdown-in" style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 220, overflow: "hidden", zIndex: 100,
            }}>
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => { setModel(m.id); setModelOpen(false); }} style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  border: "none", background: "transparent", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 2,
                  color: "var(--text-primary)", transition: "background 100ms",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: model === m.id ? 600 : 500 }}>{m.label}</span>
                      {m.badge && (
                        <span style={{
                          fontSize: 10, padding: "1px 6px", borderRadius: 9999,
                          background: m.badgeColor + "22", color: m.badgeColor, fontWeight: 500,
                        }}>{m.badge}</span>
                      )}
                    </div>
                    {model === m.id && <IconCheck />}
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
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            borderRadius: 9999, border: "1px solid var(--border)",
            background: "transparent", color: "var(--text-primary)", fontSize: 13,
            cursor: "pointer", transition: "background 150ms ease",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 14 }}>{currentPersona.icon}</span>
            <span>{currentPersona.name}</span>
            <IconChevronDown />
          </button>

          {personaOpen && (
            <div className="dropdown-in" style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 260, overflow: "hidden", zIndex: 100,
            }}>
              {PERSONAS.map((p) => (
                <button key={p.id} onClick={() => { setPersonaId(p.id); setPersonaOpen(false); }} style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  border: "none", background: "transparent", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 2,
                  color: "var(--text-primary)", transition: "background 100ms",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: personaId === p.id ? 600 : 500 }}>{p.name}</span>
                    </div>
                    {personaId === p.id && <IconCheck />}
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
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { icon: <IconShare />, action: onShare, title: "Export Markdown" },
          { icon: <span style={{ fontSize: 16 }}>📄</span>, action: onExportPDF, title: "Export PDF" },
          { icon: <span key={darkKey} className="spin-in">{darkMode ? <IconSun /> : <IconMoon />}</span>, action: handleToggle, title: "Toggle Theme" },
          { icon: <Avatar size={28} />, action: () => {} },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} title={btn.title} style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: "transparent", cursor: "pointer", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 150ms",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
});

export default Navbar;
