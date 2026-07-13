import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css'; // Ensure Tailwind CSS is loaded

import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import CaptainLogin from './pages/CaptainLogin';
import CaptainSignup from './pages/CaptainSignup';
import Start from './pages/Start';
import CaptainDashboard from './pages/CaptainDashboard.jsx'; // Adjust path if needed
import AvailablePartners from './pages/AvailablePartners.jsx'; // Adjust path if needed
import MyBookings from './pages/MyBookings';
import CaptainLogout from './pages/CaptainLogout.jsx';
import Contact from './pages/Contact.jsx';  
import Success from './pages/Success.jsx';
import Cancel from './pages/Cancel.jsx';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/captain-signup" element={<CaptainSignup />} />
      <Route path="/home" element={<Home/>} />
      <Route path="/captain-dashboard" element={<CaptainDashboard />} />
      <Route path="/available-partners" element={<AvailablePartners />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/captain-logout" element={<CaptainLogout />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />


    </Routes>
  );
};

export default App;
