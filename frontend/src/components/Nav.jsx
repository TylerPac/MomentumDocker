import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAccessToken } from '../api';
import { useAuth } from '../auth';

export default function Nav() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
    setMobileOpen(false);
    navigate('/', { replace: true });
  }

  function toggleMobileMenu() {
    setMobileOpen((v) => !v);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  React.useEffect(() => {
    if (!mobileOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  if (!user) return null;

  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar-header">
        <img className="sidebar-logo-img" src="/logo512.png" alt="Momentum logo" />

        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={toggleMobileMenu}
        >
          <span className={mobileOpen ? 'mobile-menu-icon mobile-menu-icon--open' : 'mobile-menu-icon'} aria-hidden="true" />
        </button>
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

      <div className={mobileOpen ? 'mobile-menu mobile-menu--open' : 'mobile-menu'} aria-hidden={!mobileOpen}>
        <div className="mobile-menu__content" role="dialog" aria-label="Menu">
          <div className="mobile-menu__spacer" />
          <div className="mobile-menu__nav" aria-label="Mobile navigation">
            <Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
            <Link to="/workouts/new" onClick={closeMobileMenu}>Add Workout</Link>
            <Link to="/history" onClick={closeMobileMenu}>Workout History</Link>
            <Link to="/settings" onClick={closeMobileMenu}>Settings</Link>
          </div>
          <div className="mobile-menu__footer">
            <button type="button" className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
