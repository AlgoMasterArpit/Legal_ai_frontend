import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import NewCaseFlow from "./pages/NewCaseFlow";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem("legalai_token"));

  const handleAuthSuccess = (token) => {
    setAuthenticated(true);
    setCurrentView("dashboard");
  };

  if (!authenticated) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {currentView === "dashboard" && (
        <Dashboard 
          onCreateCase={() => setCurrentView("new-case")} 
        />
      )}

      {currentView === "new-case" && (
        <NewCaseFlow 
          onBack={() => setCurrentView("dashboard")} 
        />
      )}
    </>
  );
}