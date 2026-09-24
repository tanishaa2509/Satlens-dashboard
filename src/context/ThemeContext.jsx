import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

const THEMES = {
  dark: {
    name: "dark",
    background: "#09090b",
    backgroundSecondary: "#18181b",
    panel: "#27272a",
    border: "#27272a",
    textPrimary: "#f4f4f5",
    textSecondary: "#d4d4d8",
    textMuted: "#a1a1aa",
    accent: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
  },
  light: {
    name: "light",
    background: "#fafafa",
    backgroundSecondary: "#ffffff",
    panel: "#f4f4f5",
    border: "#e4e4e7",
    textPrimary: "#09090b",
    textSecondary: "#27272a",
    textMuted: "#71717a",
    accent: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const theme = isDark ? THEMES.dark : THEMES.light;

  // Sync theme values to CSS custom properties on :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-base", theme.background);
    root.style.setProperty("--bg-surface", theme.backgroundSecondary);
    root.style.setProperty("--bg-elevated", theme.panel);
    root.style.setProperty("--border-default", theme.border);
    root.style.setProperty("--text-primary", theme.textPrimary);
    root.style.setProperty("--text-secondary", theme.textSecondary);
    root.style.setProperty("--text-muted", theme.textMuted);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--error", theme.error);
  }, [theme]);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      theme,
    }),
    [isDark, toggleTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
