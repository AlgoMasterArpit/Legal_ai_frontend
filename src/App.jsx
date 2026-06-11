import { useState } from 'react';
import Dashboard from './pages/CaseDetails';
import NewCaseFlow from './pages/NewCaseFlow';

function App() {
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  return isNewCaseOpen ? (
    <NewCaseFlow onClose={() => setIsNewCaseOpen(false)} />
  ) : (
    <Dashboard onCreateNewCase={() => setIsNewCaseOpen(true)} />
  );
}

export default App;