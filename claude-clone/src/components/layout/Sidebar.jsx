import { memo, useState, useMemo } from "react";
import { ClaudeLogo, IconPencil, IconSearch, IconDots, IconStar } from "../icons/index.jsx";
import Avatar from "./Avatar.jsx";

const Sidebar = memo(function Sidebar({ 
  conversations, activeId, onNew, onSelect, onDelete, onRename, onShare, onLogout, user,
  darkMode, toggleDark, mobile, onClose, searchInputRef 
}) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return conversations;
    const lowerSearch = search.toLowerCase();
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(lowerSearch)) return true;
      if (c.messages && c.messages.some(m => m.content.toLowerCase().includes(lowerSearch))) return true;
      return false;
    }).map(c => {
      // Find the first matching message for the snippet
      if (!c.title.toLowerCase().includes(lowerSearch) && c.messages) {
        const match = c.messages.find(m => m.content.toLowerCase().includes(lowerSearch));
        if (match) {
          const idx = match.content.toLowerCase().indexOf(lowerSearch);
          const start = Math.max(0, idx - 15);
          const snippet = (start > 0 ? "..." : "") + match.content.substring(start, idx + lowerSearch.length + 20) + "...";
          return { ...c, snippet };
        }
      }
      return c;
    });
  }, [search, conversations]);

  const groups = useMemo(() => {
    const g = { today: [], yesterday: [], week: [], older: [] };
    filtered.forEach((c) => {
      if (g[c.time]) g[c.time].push(c);
      else g.older.push(c);
    });
    return g;
  }, [filtered]);

  const handleRenameSubmit = (id) => {
    if (renameValue.trim()) {
      onRename(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const GroupSection = ({ label, items }) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)",
          padding: "4px 12px 6px", textTransform: "capitalize", letterSpacing: "0.03em",
        }}>{label}</div>
        {items.map((c) => (
          <div key={c.id} style={{ position: "relative" }}
            onMouseEnter={() => setHoveredId(c.id)}
            onMouseLeave={() => { setHoveredId(null); if (menuOpenId === c.id) setMenuOpenId(null); }}
          >
            {renamingId === c.id ? (
              <div style={{ padding: "4px 12px" }}>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(c.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit(c.id)}
                  style={{
                    width: "100%", padding: "5px 8px", borderRadius: 6,
                    border: "1px solid var(--accent)", background: "var(--bg-primary)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none"
                  }}
                />
              </div>
            ) : (
              <>
                <button
                  onClick={() => { onSelect(c.id); if (mobile) onClose(); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "7px 12px", borderRadius: 8, border: "none",
                    background: activeId === c.id ? "var(--bg-tertiary)" : "transparent",
                    color: "var(--text-primary)", fontSize: 13,
                    fontWeight: activeId === c.id ? 500 : 400,
                    cursor: "pointer", transition: "background 100ms ease",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    paddingRight: hoveredId === c.id ? 36 : 12,
                  }}
                  onMouseEnter={(e) => { if (activeId !== c.id) e.currentTarget.style.background = "var(--bg-tertiary)"; }}
                  onMouseLeave={(e) => { if (activeId !== c.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.title}
                  </div>
                  {c.snippet && (
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.snippet}
                    </div>
                  )}
                </button>
                {(hoveredId === c.id || menuOpenId === c.id) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === c.id ? null : c.id);
                    }}
                    style={{
                      position: "absolute", right: 6, top: 7,
                      width: 24, height: 24, borderRadius: 6, border: "none",
                      background: menuOpenId === c.id ? "var(--bg-secondary)" : "var(--bg-tertiary)", 
                      color: "var(--text-secondary)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 10
                    }}
                  ><IconDots /></button>
                )}

                {/* Dropdown Menu */}
                {menuOpenId === c.id && (
                  <div style={{
                    position: "absolute", right: 6, top: 34,
                    width: 140, background: "var(--bg-primary)",
                    borderRadius: 8, border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 100,
                    padding: "4px 0"
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(c.id);
                        setRenameValue(c.title);
                        setMenuOpenId(null);
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 12px",
                        background: "transparent", border: "none", color: "var(--text-primary)",
                        fontSize: 13, cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >Rename</button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(c.id);
                        setMenuOpenId(null);
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 12px",
                        background: "transparent", border: "none", color: "var(--text-primary)",
                        fontSize: 13, cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >Share</button>
                    <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this chat?")) onDelete(c.id);
                        setMenuOpenId(null);
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 12px",
                        background: "transparent", border: "none", color: "#ef4444",
                        fontSize: 13, cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        width: 260, flexShrink: 0, background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
        height: "100%", userSelect: "none",
        ...(mobile ? { position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50, boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)" } : {}),
      }}
      className={mobile ? "sidebar-slide" : ""}
    >
      {/* Header */}
      <div style={{ padding: "14px 12px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <ClaudeLogo size={22} />
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>Patel</span>
        {mobile && (
          <button onClick={onClose} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>✕</button>
        )}
      </div>

      {/* New chat */}
      <div style={{ padding: "0 10px 10px" }}>
        <button onClick={onNew} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
          background: "transparent", color: "var(--text-primary)", fontSize: 13,
          cursor: "pointer", transition: "background 150ms ease",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>New chat</span>
          <IconPencil />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 10px 10px", position: "relative" }}>
        <div style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
          <IconSearch />
        </div>
        <input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          style={{
            width: "100%", padding: "7px 10px 7px 30px", borderRadius: 8,
            border: "none", outline: "none", background: "var(--bg-tertiary)",
            color: "var(--text-primary)", fontSize: 13,
          }}
        />
      </div>

      {/* Conversations */}
      <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>
        {GroupSection({ label: "Today", items: groups.today })}
        {GroupSection({ label: "Yesterday", items: groups.yesterday })}
        {GroupSection({ label: "Previous 7 days", items: groups.week })}
        {GroupSection({ label: "Older", items: groups.older })}
      </div>

      {/* Bottom User Area */}
      <div style={{ borderTop: "1px solid var(--border)", padding: 10, position: "relative" }}>
        {userMenuOpen && (
          <div style={{
            position: "absolute", bottom: "100%", left: 10, right: 10,
            background: "var(--bg-primary, #ffffff)", // SOLID BACKGROUND
            borderRadius: 12, border: "1px solid var(--border)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", marginBottom: 8, overflow: "hidden",
            zIndex: 1000
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.user_metadata?.full_name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={() => { onLogout(); setUserMenuOpen(false); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 16px",
                background: "transparent", border: "none", color: "#ef4444",
                fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >Log out</button>
          </div>
        )}

        <div 
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{ 
            display: "flex", alignItems: "center", gap: 8, padding: "6px 6px", 
            borderRadius: 8, cursor: "pointer", transition: "background 150ms"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Avatar size={28} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
          </span>
          <button style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}><IconDots /></button>
        </div>
        
        <button style={{
          display: "flex", alignItems: "center", gap: 5, width: "100%",
          padding: "5px 6px", border: "none", background: "transparent",
          cursor: "pointer", color: "var(--accent)", fontSize: 12, borderRadius: 6,
          transition: "background 150ms", marginTop: 4
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconStar /><span>Upgrade plan</span>
        </button>
      </div>
    </div>
  );
});

export default Sidebar;
