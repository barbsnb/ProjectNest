import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { UserProjectsProvider } from "./contexts/UserProjectsContext";
import { ChatProvider } from "./contexts/ChatContext";

<<<<<<< HEAD
//routes:
<<<<<<< HEAD
=======
>>>>>>> db447ae (Dodany sidebar, zmiana głównej strony)
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
<<<<<<< HEAD
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
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 21f5840 (commit)
=======
import Chat from "./components/tabs/Chat";
>>>>>>> 6ce1929 (zaslepka na chat)
=======
import Chat from "./components/chat/Chat";
import ProjectAnalysisView from "./components/chat/ProjectAnalysis";


>>>>>>> 9cf03ab (Dodana analiza do fronta)
=======
import NewProject from './components/tabs/NewProject';
import ManageProjects from './components/tabs/ManageProjects';
import Chat from "./components/chat/Chat";
import ProjectAnalysisView from "./components/chat/ProjectAnalysis";

import Layout from './components/common/Layout';        // z sidebar
import BaseLayout from './components/common/BaseLayout'; // bez sidebar
>>>>>>> db447ae (Dodany sidebar, zmiana głównej strony)

function App() {
<<<<<<< HEAD
  return (
    <Router>
      <AuthProvider>
        <UserProjectsProvider>
          <ChatProvider>
            <Routes>
              {/* Publiczne strony (bez sidebar) */}
              <Route
                path="/"
                element={
                  <BaseLayout>
                    <Info />
                  </BaseLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <BaseLayout>
                    <LoginForm />
                  </BaseLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <BaseLayout>
                    <RegistrationForm />
                  </BaseLayout>
                }
              />

              {/* Chronione strony (z sidebar) */}
              <Route
                path="/home"
                element={
                  <Layout>
                    <Home />
                  </Layout>
                }
              />
              <Route
                path="/project"
                element={
                  <Layout>
                    <NewProject />
                  </Layout>
                }
              />
              <Route
                path="/manage_projects"
                element={
                  <Layout>
                    <ManageProjects />
                  </Layout>
                }
              />
              <Route
                path="/chat"
                element={
                  <Layout>
                    <Chat />
                  </Layout>
                }
              />
              <Route
                path="/analysis/:projectId"
                element={
                  <Layout>
                    <ProjectAnalysisView />
                  </Layout>
                }
              />
            </Routes>
          </ChatProvider>
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
