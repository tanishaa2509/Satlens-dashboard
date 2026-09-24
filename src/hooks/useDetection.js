import { useState, useCallback } from "react";

export function useDetection({ inputMode, selectedVillage, t1Scene, t2Scene, uploadedFiles, setJobs }) {
  const [detectionStatus, setDetectionStatus] = useState("idle");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const resetDetection = useCallback(() => {
    setDetectionStatus("idle");
  }, []);

  const isVillageSelected = Boolean(
    selectedVillage && selectedVillage.trim() !== "",
  );

  const isDirectoryValid = Boolean(
    isVillageSelected &&
    t1Scene &&
    t1Scene.trim() !== "" &&
    t2Scene &&
    t2Scene.trim() !== ""
  );

  const isUploadValid = Boolean(uploadedFiles && uploadedFiles.length >= 2);

  const canRunDetection =
    inputMode === "directory" ? isDirectoryValid : isUploadValid;

  const runDirectoryDetection = useCallback(() => {
    if (!isDirectoryValid || detectionStatus === "running") return;

    setDetectionStatus("running");

    setTimeout(() => {
      setDetectionStatus("complete");

      const randomJobId = Math.floor(1000 + Math.random() * 9000).toString();
      const newSubmittedJob = {
        id: randomJobId,
        village: selectedVillage,
        t1: t1Scene,
        t2: t2Scene,
        status: "Submitted",
      };

      setJobs((prevJobs) => [newSubmittedJob, ...prevJobs]);

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
    }, 2000);
  }, [isDirectoryValid, detectionStatus, selectedVillage, t1Scene, t2Scene, setJobs]);

  const runUploadDetection = useCallback(() => {
    if (!isUploadValid || detectionStatus === "running") return;

    setDetectionStatus("running");

    setTimeout(() => {
      setDetectionStatus("complete");

      const randomJobId = Math.floor(1000 + Math.random() * 9000).toString();
      const newSubmittedJob = {
        id: randomJobId,
        village: "Custom Upload",
        t1: uploadedFiles[0]?.name || "T1_File",
        t2: uploadedFiles[1]?.name || "T2_File",
        status: "Submitted",
      };

      setJobs((prevJobs) => [newSubmittedJob, ...prevJobs]);

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
    }, 2000);
  }, [isUploadValid, detectionStatus, uploadedFiles, setJobs]);

  const runDetection = useCallback(() => {
    if (!canRunDetection || detectionStatus === "running") {
      return;
    }

    if (inputMode === "directory") {
      runDirectoryDetection();
    } else {
      runUploadDetection();
    }
  }, [canRunDetection, detectionStatus, inputMode, runDirectoryDetection, runUploadDetection]);

  return {
    detectionStatus,
    canRunDetection,
    runDetection,
    resetDetection,
    showSuccessPopup,
  };
}