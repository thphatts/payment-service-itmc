import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import Attendance from './pages/Attendance.jsx';
import FundAdmin from './pages/FundAdmin.jsx';
import MyPayment from './pages/MyPayment.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout dùng chung cho tất cả các trang */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="directory" element={<Members />} />
          <Route path="fund-admin" element={<FundAdmin />} />
          <Route path="my-payment" element={<MyPayment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
