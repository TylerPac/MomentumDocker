import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAccessToken } from '../api';
import { useAuth } from '../auth';

export default function Nav() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  React.useEffect(() => {
    if (!user) return undefined;
    document.body.classList.add('dashboard-body');
    document.body.classList.remove('login-body');
    return () => {
      document.body.classList.remove('dashboard-body');
    };
  }, [user]);

  async function onLogout() {
    clearAccessToken();
    setUser(null);
    navigate('/', { replace: true });
  }

  if (!user) return null;

  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar-header">
        <img className="sidebar-logo-img" src="/logo512.png" alt="Momentum logo" />
      </div>

      <div className="sidebar-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/workouts/new">Add Workout</Link>
        <Link to="/history">Workout History</Link>
        <Link to="/settings">Settings</Link>
      </div>

      <div className="logout-form-container">
        <button type="button" className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
