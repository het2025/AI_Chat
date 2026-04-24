import { useState, useCallback, useEffect } from "react";

/**
 * Manages dark/light theme with localStorage persistence
 * and system preference detection on first load.
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("patel-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("patel-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Apply class on <html> for CSS variable switching
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  return { darkMode, toggleDark };
}
