import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//providers:
import { AuthProvider } from './contexts/AuthContext';
import { UserVisitsProvider } from './contexts/UserVisitsContext';
import { AllVisitsProvider } from './contexts/AllVisitsContext';

//routes:
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
import CustomNavbar from './components/common/Navbar';
import ScheduleAppointment from './components/tabs/ScheduleAppointment';
import AllVisitsList from './components/tabs/AllVisitsList';
import AppointmentExtension from './components/tabs/AppointmentExtention';
import ManageVisits from './components/tabs/ManageVisits'
import ReportingComponent from './components/tabs/ReportingComponent';


function App() {
  return (
    <Router>
      <AuthProvider>
        <AllVisitsProvider>
          <UserVisitsProvider>
            <CustomNavbar />
              <Routes>
                <Route path="/" element={<Info/>} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/schedule" element={<ScheduleAppointment />} />
                <Route path="/visit_list" element={<AllVisitsList/>} />
                <Route path="/visit_extension" element={<AppointmentExtension/>} />
                <Route path="/manage_visits" element={<ManageVisits/>} />
                <Route path="/reports" element={<ReportingComponent />} />
              </Routes>
            </UserVisitsProvider>
          </AllVisitsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
