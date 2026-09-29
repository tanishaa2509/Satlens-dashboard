import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function TopBar({ onToggleSidebar, sidebarOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { isLoggedIn, userName, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    login();
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__icon-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          id="sidebar-toggle"
        >
          {sidebarOpen ? "◁" : "▷"}
        </button>
      </div>

      <div className="topbar__brand">
        <span className="topbar__brand-icon">🛰️</span>
        <h1 className="topbar__title">SatLens Change Analytics</h1>
      </div>

      <div className="topbar__right">
        {isLoggedIn ? (
          <>
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.8125rem",
                marginRight: "4px",
              }}
            >
              Logged in as <strong>{userName}</strong>
            </span>

            <button className="topbar__btn" onClick={logout} id="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <button className="topbar__btn" onClick={handleLogin} id="login-btn">
            Login
          </button>
        )}

        <button
          className="topbar__icon-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          id="theme-toggle"
        >
          {isDark ? "☀" : "🌙"}
        </button>

        <button className="topbar__btn" id="deploy-btn">
          Deploy
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="topbar__icon-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            id="menu-btn"
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 4,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 0",
                minWidth: 140,
                zIndex: 200,
                boxShadow: "var(--shadow-md)",
              }}
            >
              {["Settings", "Export", "Help"].map((item) => (
                <button
                  key={item}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "6px 12px",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: "0.8125rem",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-hover)";
                    e.target.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "var(--text-secondary)";
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
