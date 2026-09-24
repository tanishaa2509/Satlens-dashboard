import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { SceneProvider, useScene } from "./context/SceneContext";
import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";
import InputSelection from "./components/input/InputSelection";
import JobSelection from "./components/jobs/JobSelection";
import MapViewer from "./components/map/MapViewer";
import ResultsSection from "./components/results/ResultsSection";

function DashboardContent() {
  const { activeTab, setActiveTab, jobs, showSuccessPopup } = useScene();

  return (
    <div
      className="main-content__inner"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {/* TABS NAVIGATION HEADER */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          borderBottom: "1px solid #27272a",
          paddingBottom: "12px",
          marginBottom: "4px",
        }}
      >
        <button
          onClick={() => setActiveTab("input")}
          style={{
            background: activeTab === "input" ? "#27272a" : "transparent",
            color: activeTab === "input" ? "#ffffff" : "#a1a1aa",
            border: "1px solid",
            borderColor: activeTab === "input" ? "#3f3f46" : "transparent",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          🗂️ Input Selection
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            background: activeTab === "jobs" ? "#27272a" : "transparent",
            color: activeTab === "jobs" ? "#ffffff" : "#a1a1aa",
            border: "1px solid",
            borderColor: activeTab === "jobs" ? "#3f3f46" : "transparent",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          📋 Job Selection
          <span
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              color: "#60a5fa",
              padding: "2px 6px",
              borderRadius: "10px",
              fontSize: "0.75rem",
            }}
          >
            {jobs.length}
          </span>
        </button>
      </div>

      {/* CONDITIONAL TAB RENDERING */}
      {activeTab === "input" ? (
        <>
          <InputSelection />
          <div className="divider" />
        </>
      ) : (
        <JobSelection />
      )}

      {/* COMPACT WRAPPER FOR MAP & RESULTS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "4px",
        }}
      >
        <MapViewer />
        <ResultsSection />
      </div>

      {/* SUCCESS POP-UP TOAST NOTIFICATION */}
      {showSuccessPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            fontWeight: "600",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✅</span> Job Successfully Submitted & Added to Job Selection!
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider>
      <SceneProvider>
        <div className="app-layout">
          <TopBar
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            sidebarOpen={sidebarOpen}
          />

          <div className="app-body">
            <Sidebar collapsed={!sidebarOpen} />

            <main className="main-content">
              <DashboardContent />
            </main>
          </div>
        </div>
      </SceneProvider>
    </ThemeProvider>
  );
}
