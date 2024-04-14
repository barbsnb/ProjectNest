import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import CustomNavbar from './components/common/Navbar';
import ScheduleAppointment from './components/ScheduleAppointment';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/schedule" element={<ScheduleAppointment />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
