import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//providers:
import { AuthProvider } from "./contexts/AuthContext";
import { UserProjectsProvider } from "./contexts/UserProjectsContext";
import { ChatProvider } from "./contexts/ChatContext";

//routes:
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
import CustomNavbar from './components/common/Navbar';
import NewProject from './components/tabs/NewProject';
import ManageProjects from './components/tabs/ManageProjects'
import Chat from "./components/tabs/Chat";

function App() {
  return (
    <Router>
      <AuthProvider>
          <UserProjectsProvider>
            <ChatProvider>
              <CustomNavbar />
                  <Routes>
                    <Route path="/" element={<Info/>} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/project" element={<NewProject />} />
                    <Route path="/manage_projects" element={<ManageProjects/>} />
                    <Route path="/chat" element={<Chat />} />
                  </Routes>
              </ChatProvider>
            </UserProjectsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
