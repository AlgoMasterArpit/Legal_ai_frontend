import { useState } from "react";

import Dashboard from "./pages/CaseDetails";
import NewCaseFlow from "./pages/NewCaseFlow";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activePage, setActivePage] =
    useState("dashboard");

  // Login Screen
  if (!isLoggedIn) {
    return (
      <Login
        onAuthSuccess={() =>
          setIsLoggedIn(true)
        }
      />
    );
  }

  // Main App
  return (
    <>
      {activePage === "dashboard" && (
        <Dashboard
          onCreateCase={() =>
            setActivePage("new-case")
          }
        />
      )}

      {activePage === "new-case" && (
        <NewCaseFlow
          onBack={() =>
            setActivePage("dashboard")
          }
        />
      )}
    </>
  );
}

export default App;