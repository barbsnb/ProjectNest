import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserVisitsProvider } from './contexts/UserVisitsContext';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
import CustomNavbar from './components/common/Navbar';
import ScheduleAppointment from './components/ScheduleAppointment';


function App() {
  return (
    <Router>
      <AuthProvider>
        <UserVisitsProvider>
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Info/>} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/schedule" element={<ScheduleAppointment />} />
        </Routes>
        </UserVisitsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
