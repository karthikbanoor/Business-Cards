import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SharedFolderView from './components/SharedFolderView';
import SharedCardView from './components/SharedCardView';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/share/folder/:token" element={<SharedFolderView />} />
            <Route path="/share/card/:token" element={<SharedCardView />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
