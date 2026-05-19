import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import AttendanceTime from './pages/AttendanceTime';
import Performance from './pages/Performance';
import HiringOnboarding from './pages/HiringOnboarding';
import EmployeeExperience from './pages/EmployeeExperience';
import SystemTools from './pages/SystemTools';

// Protected Route Guard Wrapper
const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-350 tracking-wider">Syncing CloudMojo HR Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Collapsible Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Page Content Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Main Endpoints */}
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/employees" element={<ProtectedLayout><EmployeeDirectory /></ProtectedLayout>} />
          <Route path="/attendance" element={<ProtectedLayout><AttendanceTime /></ProtectedLayout>} />
          <Route path="/performance" element={<ProtectedLayout><Performance /></ProtectedLayout>} />
          <Route path="/hiring" element={<ProtectedLayout><HiringOnboarding /></ProtectedLayout>} />
          <Route path="/experience" element={<ProtectedLayout><EmployeeExperience /></ProtectedLayout>} />
          <Route path="/system" element={<ProtectedLayout><SystemTools /></ProtectedLayout>} />
          
          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
