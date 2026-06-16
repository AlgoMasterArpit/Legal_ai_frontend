import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import NewCaseFlow from "./pages/NewCaseFlow";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem("legalai_token"));
  
  // NEW STATE: Tracks if we are resuming an incomplete case or starting completely fresh
  const [activeCaseData, setActiveCaseData] = useState(null);

  const handleAuthSuccess = (token) => {
    setAuthenticated(true);
    setCurrentView("dashboard");
  };

  // Triggers when user clicks on any pending/incomplete case log row inside dashboard
  const handleResumeCasePipeline = (caseId, status) => {
    setActiveCaseData({ id: caseId, currentStatus: status });
    setCurrentView("new-case");
  };

  // Triggers when user clicks the fresh "+ Create New Case" button
  const handleStartFreshCase = () => {
    setActiveCaseData(null); // Explicitly clean past reference traces
    setCurrentView("new-case");
  };

  if (!authenticated) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {currentView === "dashboard" && (
        <Dashboard 
          onCreateCase={handleStartFreshCase} 
          onResumeCase={handleResumeCasePipeline}
        />
      )}

      {currentView === "new-case" && (
        <NewCaseFlow 
          resumeData={activeCaseData}
          onBack={() => {
            setActiveCaseData(null);
            setCurrentView("dashboard");
          }} 
        />
      )}
    </>
  );
}