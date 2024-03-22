import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//providers:
import { AuthProvider } from "./contexts/AuthContext";
import { UserVisitsProvider } from "./contexts/UserVisitsContext";
import { AllVisitsProvider } from "./contexts/AllVisitsContext";

//routes:
<<<<<<< HEAD
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
=======
import LoginForm from "./components/auth/LoginForm";
import RegistrationForm from "./components/auth/RegistrationForm";
import Home from "./components/home/Home";
import Info from "./components/home/Info";
import CustomNavbar from "./components/common/Navbar";
import ScheduleAppointment from "./components/tabs/ScheduleAppointment";
import AllVisitsList from "./components/tabs/AllVisitsList";
import AppointmentExtension from "./components/tabs/AppointmentExtention";
import ManageVisits from "./components/tabs/ManageVisits";
>>>>>>> d56c873 (refresh problem fix)

import StartVisit from "./components/tabs/StartVisit";
import CompleteVisit from "./components/tabs/CompleteVisit";

function App() {
<<<<<<< HEAD
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
=======
   return (
      <Router>
         <AuthProvider>
            <AllVisitsProvider>
               <UserVisitsProvider>
                  <CustomNavbar />
                  <Routes>
                     <Route path="/" element={<Info />} />
                     <Route path="/home" element={<Home />} />
                     <Route path="/login" element={<LoginForm />} />
                     <Route path="/register" element={<RegistrationForm />} />
                     <Route
                        path="/schedule"
                        element={<ScheduleAppointment />}
                     />
                     <Route path="/visit_list" element={<AllVisitsList />} />
                     <Route
                        path="/visit_extension"
                        element={<AppointmentExtension />}
                     />
                     <Route path="/manage_visits" element={<ManageVisits />} />

                     <Route
                        path="/start_visit/:visitId"
                        element={<StartVisit />}
                     />
                     <Route
                        path="/complete_visit/:visitId"
                        element={<CompleteVisit />}
                     />
                  </Routes>
               </UserVisitsProvider>
            </AllVisitsProvider>
         </AuthProvider>
      </Router>
   );
>>>>>>> d56c873 (refresh problem fix)
}

export default App;
