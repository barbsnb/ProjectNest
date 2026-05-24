import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import LoginForm from "./components/auth/LoginForm";
import BaseLayout from "./components/common/BaseLayout";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./components/home/Home";
import Info from "./components/home/Info";
import DevPath from "./components/tabs/DevPath";
import NewProject from "./components/tabs/NewProject";
import ProjectAnalysisView from "./components/tabs/ProjectAnalysis";
import RegistrationForm from "./components/auth/RegistrationForm";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { UserProjectsProvider } from "./contexts/UserProjectsContext";

const protectedElement = (children) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProjectsProvider>
          <ChatProvider>
            <Routes>
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
              <Route path="/home" element={protectedElement(<Home />)} />
              <Route path="/project" element={protectedElement(<NewProject />)} />
              <Route path="/analysis/:projectId" element={protectedElement(<ProjectAnalysisView />)} />
              <Route path="/devpath" element={protectedElement(<DevPath />)} />
              <Route path="/chat" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChatProvider>
        </UserProjectsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
