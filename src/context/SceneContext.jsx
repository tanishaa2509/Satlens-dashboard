import { createContext, useContext, useState, useCallback } from "react";
import { useJobs } from "../hooks/useJobs";
import { useDetection } from "../hooks/useDetection";

const SceneContext = createContext();

const MOCK_VILLAGES = [
  "Indore",
  "Barwadih",
  "Chandpur",
  "Deogarh",
  "Fatehpur",
  "Govindpur",
  "Hazaribagh",
  "Itkhori",
];

const MOCK_SCENES = [
  "20231013.tif",
  "20230915.tif",
  "20230801.tif",
  "20230620.tif",
  "20230512.tif",
];

const DEFAULT_MODEL_SETTINGS = {
  modelPath: "D:\\tanu\\UI\\encroachm",
  tileSize: 256,
  overlap: 32,
  threshold: 0.5,
};

export function SceneProvider({ children }) {
  const [inputMode, setInputModeState] = useState("directory");
  const [selectedVillage, setSelectedVillageState] = useState("");
  const [t1Scene, setT1SceneState] = useState("");
  const [t2Scene, setT2SceneState] = useState("");
  const [sceneDirectory, setSceneDirectory] = useState("");
  const [uploadedFiles, setUploadedFilesState] = useState([]);
  const [modelSettings, setModelSettings] = useState(DEFAULT_MODEL_SETTINGS);

  const [activeTab, setActiveTab] = useState("input");
  const [overlays, setOverlays] = useState({
    detection: true,
    boundaries: true,
  });

  // Using Custom Hook for Job Management
  const {
    jobs,
    setJobs,
    selectedJob,
    inspectJob: baseInspectJob,
    deleteJob,
    resetToDefaultJobs,
  } = useJobs();

  // Pointer-based architecture wrapper with smart toggle logs & array-safe find
  const inspectJob = useCallback(
    (jobIdOrObject) => {
      if (typeof jobIdOrObject === "string") {
        const isCurrentlySelected = selectedJob?.id === jobIdOrObject;

        if (isCurrentlySelected) {
          console.log(
            "🙈 [Pointer Flow] Hide Details triggered for Job ID:",
            jobIdOrObject,
          );
        } else {
          console.log(
            "🔍 [Pointer Flow] View Details clicked. Passed Job ID:",
            jobIdOrObject,
          );

          const storedJobs = JSON.parse(
            localStorage.getItem("satlens_jobs") || "[]",
          );
          const foundJob = Array.isArray(storedJobs)
            ? storedJobs.find((j) => j.id === jobIdOrObject)
            : jobs.find((j) => j.id === jobIdOrObject);

          console.log("📦 [Database/Storage Lookup Result]:", foundJob);
        }

        const storedJobs = JSON.parse(
          localStorage.getItem("satlens_jobs") || "[]",
        );
        const targetJob = Array.isArray(storedJobs)
          ? storedJobs.find((j) => j.id === jobIdOrObject)
          : jobs.find((j) => j.id === jobIdOrObject);

        baseInspectJob(targetJob || { id: jobIdOrObject });
      } else {
        console.log("⚠ [Legacy] Full object passed directly:", jobIdOrObject);
        baseInspectJob(jobIdOrObject);
      }
    },
    [jobs, selectedJob, baseInspectJob],
  );

  // Using Custom Hook for Detection & Validation
  const {
    detectionStatus,
    canRunDetection,
    runDetection,
    resetDetection,
    showSuccessPopup,
  } = useDetection({
    inputMode,
    selectedVillage,
    t1Scene,
    t2Scene,
    uploadedFiles,
    setJobs,
  });

  const setInputMode = useCallback(
    (mode) => {
      setInputModeState(mode);
      setSelectedVillageState("");
      setT1SceneState("");
      setT2SceneState("");
      setUploadedFilesState([]);
      resetDetection();
    },
    [resetDetection],
  );

  const setSelectedVillage = useCallback(
    (village) => {
      setSelectedVillageState(village);
      resetDetection();
    },
    [resetDetection],
  );

  const setT1Scene = useCallback(
    (scene) => {
      setT1SceneState(scene);
      resetDetection();
    },
    [resetDetection],
  );

  const setT2Scene = useCallback(
    (scene) => {
      setT2SceneState(scene);
      resetDetection();
    },
    [resetDetection],
  );

  const setUploadedFiles = useCallback(
    (files) => {
      setUploadedFilesState(files);
      resetDetection();
    },
    [resetDetection],
  );

  const updateModelSetting = useCallback((key, value) => {
    setModelSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleOverlay = useCallback((key) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  return (
    <SceneContext.Provider
      value={{
        inputMode,
        setInputMode,
        selectedVillage,
        setSelectedVillage,
        villages: MOCK_VILLAGES,
        t1Scene,
        setT1Scene,
        t2Scene,
        setT2Scene,
        scenes: MOCK_SCENES,
        sceneDirectory,
        setSceneDirectory,
        uploadedFiles,
        setUploadedFiles,
        modelSettings,
        updateModelSetting,
        detectionStatus,
        canRunDetection,
        runDetection,
        resetDetection,
        overlays,
        toggleOverlay,
        activeTab,
        setActiveTab,
        jobs,
        showSuccessPopup,
        selectedJob,
        inspectJob,
        deleteJob,
        resetToDefaultJobs,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const context = useContext(SceneContext);

  if (!context) {
    throw new Error("useScene must be used within a SceneProvider");
  }

  return context;
}
