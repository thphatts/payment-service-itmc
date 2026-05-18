import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import Attendance from './pages/Attendance.jsx';
import Settings from './pages/Settings.jsx';
import FundAdmin from './pages/FundAdmin.jsx';
import ExpenseAdmin from './pages/ExpenseAdmin.jsx';
import FinanceTransparency from './pages/FinanceTransparency.jsx';
import MyPayment from './pages/MyPayment.jsx';
import Login from './pages/Login.jsx';
import EngagementDashboard from './pages/EngagementDashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="directory" element={<Members />} />
          <Route path="fund-admin" element={<FundAdmin />} />
          <Route path="expenses" element={<ExpenseAdmin />} />
          <Route path="finance" element={<FinanceTransparency />} />
          <Route path="engagement" element={<EngagementDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="my-payment" element={<MyPayment />} />
        </Route>

        {/* Catch all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
