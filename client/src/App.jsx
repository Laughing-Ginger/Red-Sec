import React from 'react';
import { AppProvider } from './context/AppContext';
import { RedactorPage } from './pages/RedactorPage';

function App() {
  return (
    <AppProvider>
      <RedactorPage />
    </AppProvider>
  );
}

export default App;