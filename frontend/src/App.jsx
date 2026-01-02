import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './auth';
import Nav from './components/Nav';
import UserBadge from './components/UserBadge';

const SignIn = React.lazy(() => import('./pages/SignIn'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AddWorkout = React.lazy(() => import('./pages/AddWorkout'));
const EditWorkout = React.lazy(() => import('./pages/EditWorkout'));
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function Layout({ children }) {
  return (
    <>
      <Nav />
      <UserBadge />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<SignIn />} />
              <Route
                path="/dashboard"
                element={(
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                )}
              />
              <Route
                path="/workouts/new"
                element={(
                  <RequireAuth>
                    <AddWorkout />
                  </RequireAuth>
                )}
              />
              <Route
                path="/workouts/:id/edit"
                element={(
                  <RequireAuth>
                    <EditWorkout />
                  </RequireAuth>
                )}
              />
              <Route
                path="/history"
                element={(
                  <RequireAuth>
                    <History />
                  </RequireAuth>
                )}
              />
              <Route
                path="/settings"
                element={(
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
