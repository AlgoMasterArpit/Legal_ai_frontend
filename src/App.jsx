import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import NewCaseFlow from "./pages/NewCaseFlow";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem("legalai_token"));
  
  // Naya state jo dashboard se uthaye hue case ko safe rakhega
  const [activeCaseData, setActiveCaseData] = useState(null);

  const handleAuthSuccess = (token) => {
    setAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleResumeCase = (casePayload) => {
    setActiveCaseData(casePayload); // Case payload (id aur status) yahan save ho jayega
    setCurrentView("new-case");     // Aur direct workflow khul jayega
  };

  const handleCreateNewCase = () => {
    setActiveCaseData(null);        // Naya case banate waat purana data clear
    setCurrentView("new-case");
  };

  if (!authenticated) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {currentView === "dashboard" && (
        <Dashboard 
          onCreateCase={handleCreateNewCase} 
          onResumeCase={handleResumeCase} // Dashboard ke component ko resume trigger de diya
        />
      )}

      {currentView === "new-case" && (
        <NewCaseFlow 
          resumeData={activeCaseData} // NewCaseFlow ko saved case data bhej diya
          onBack={() => setCurrentView("dashboard")} 
        />
      )}
    </>
  );
}