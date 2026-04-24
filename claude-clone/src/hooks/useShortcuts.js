import { useEffect } from "react";

/**
 * Global keyboard shortcuts hook.
 * 
 * Supported Shortcuts:
 * - Ctrl+K / Cmd+K : Focus search input
 * - Ctrl+N / Cmd+N : New conversation
 * - Ctrl+Shift+C / Cmd+Shift+C : Copy last assistant response
 * - Ctrl+/ / Cmd+/ : Toggle sidebar
 * - Escape : Stop streaming / defocus
 */
export function useShortcuts({
  onSearch,
  onNewChat,
  onCopyLast,
  onToggleSidebar,
  onEscape,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts inside textareas/inputs unless it's Escape
      const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
        if (isInput) e.target.blur();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "k":
            e.preventDefault();
            onSearch?.();
            break;
          case "n":
            e.preventDefault();
            onNewChat?.();
            break;
          case "c":
            if (e.shiftKey) {
              e.preventDefault();
              onCopyLast?.();
            }
            break;
          case "/":
            e.preventDefault();
            onToggleSidebar?.();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearch, onNewChat, onCopyLast, onToggleSidebar, onEscape]);
}
