import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//providers:
import { AuthProvider } from "./contexts/AuthContext";
import { UserProjectsProvider } from "./contexts/UserProjectsContext";

//routes:
<<<<<<< HEAD
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
import CustomNavbar from './components/common/Navbar';
<<<<<<< HEAD
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
=======
import NewProject from './components/tabs/NewProject';
import ManageProjects from './components/tabs/ManageProjects'
>>>>>>> 21f5840 (commit)

function App() {
<<<<<<< HEAD
  return (
    <Router>
      <AuthProvider>
          <UserProjectsProvider>
            <CustomNavbar />
              <Routes>
                <Route path="/" element={<Info/>} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/project" element={<NewProject />} />
                <Route path="/manage_projects" element={<ManageProjects/>} />
              </Routes>
            </UserProjectsProvider>
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
