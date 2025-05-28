import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { UserProjectsProvider } from "./contexts/UserProjectsContext";
import { ChatProvider } from "./contexts/ChatContext";

import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Home from './components/home/Home';
import Info from './components/home/Info';
import NewProject from './components/tabs/NewProject';
import ManageProjects from './components/tabs/ManageProjects';
import Chat from "./components/chat/Chat";
import ProjectAnalysisView from "./components/chat/ProjectAnalysis";

import Layout from './components/common/Layout';        // z sidebar
import BaseLayout from './components/common/BaseLayout'; // bez sidebar

function App() {
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
}

export default App;
