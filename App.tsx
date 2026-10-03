
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ComparisonPage } from './pages/ComparisonPage';
import { Assistant } from './pages/Assistant';
import { ToolDetails } from './pages/ToolDetails';
import { Profile } from './pages/Profile';
import { Stacks } from './pages/Stacks';
import { StackDetails } from './pages/StackDetails';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Support } from './pages/Support';
import { Documentation } from './pages/Documentation';
import { ApiDocs } from './pages/ApiDocs';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/tool/:id" element={<ToolDetails />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/stacks" element={<Stacks />} />
        <Route path="/stack/:id" element={<StackDetails />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api" element={<ApiDocs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
