import React from 'react';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </div>
  );
}

export default App;
