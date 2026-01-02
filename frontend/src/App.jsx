import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './auth';
import Nav from './components/Nav';

import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AddWorkout from './pages/AddWorkout';
import EditWorkout from './pages/EditWorkout';
import History from './pages/History';
import Settings from './pages/Settings';

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
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
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
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
