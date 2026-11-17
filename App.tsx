import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ComparisonPage = React.lazy(() => import('./pages/ComparisonPage').then(m => ({ default: m.ComparisonPage })));
const Assistant = React.lazy(() => import('./pages/Assistant').then(m => ({ default: m.Assistant })));
const ToolDetails = React.lazy(() => import('./pages/ToolDetails').then(m => ({ default: m.ToolDetails })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Stacks = React.lazy(() => import('./pages/Stacks').then(m => ({ default: m.Stacks })));
const StarterStacks = React.lazy(() => import('./pages/StarterStacks').then(m => ({ default: m.StarterStacks })));
const StackDetails = React.lazy(() => import('./pages/StackDetails').then(m => ({ default: m.StackDetails })));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Support = React.lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const Documentation = React.lazy(() => import('./pages/Documentation').then(m => ({ default: m.Documentation })));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs').then(m => ({ default: m.ApiDocs })));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="w-16 h-1.5 hazard-stripe" />
    <span className="text-xs font-mono uppercase tracking-widest text-surface-muted">Loading module...</span>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:id" element={<ToolDetails />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stacks" element={<Stacks />} />
          <Route path="/starter-stacks" element={<StarterStacks />} />
          <Route path="/stack/:id" element={<StackDetails />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <ScrollToTop />
          <Layout>
            <AppRoutes />
          </Layout>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
