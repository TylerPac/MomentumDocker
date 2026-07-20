import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch, setAccessToken } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';
import '../styles/pages/SignIn.css';

function passwordChecklist(password) {
  const value = password || '';
  return {
    length: value.length >= 8,
    hasUpper: /[A-Z]/.test(value),
    hasDigit: /\d/.test(value),
  };
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, refresh, setUser } = useAuth();
  const [mode, setMode] = React.useState('signin');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCreatePassword, setShowCreatePassword] = React.useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = React.useState(false);
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState(null);

  usePageMeta({ title: 'Momentum — Sign In', description: 'Sign in to Momentum to track workouts.' });

  React.useEffect(() => {
    document.body.classList.add('login-body');
    document.body.classList.remove('dashboard-body');
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  React.useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [loading, user, navigate]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    setMode(params.get('mode') === 'create' ? 'create' : 'signin');
  }, [location.search]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors(null);

    if (mode === 'create') {
      if (password !== confirmPassword) {
        setError('Passwords must match');
        return;
      }
    }

    try {
      const endpoint = mode === 'create' ? '/auth/register' : '/auth/login';
      const body = mode === 'create'
        ? { username, password }
        : { username, password };
      const tokenRes = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setAccessToken(tokenRes?.accessToken);

      // Optimistic auth: backend now returns the user in the login/register response.
      // This avoids a second round-trip to /auth/me for faster perceived login.
      if (tokenRes?.user) {
        setUser(tokenRes.user);
      } else {
        await refresh();
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Sign-in failed');
      const fe = err?.data?.fieldErrors;
      if (fe && typeof fe === 'object') setFieldErrors(fe);
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-content">
        <Link className="signin-logo-link" to="/" aria-label="Go to home page">
          <img className="signin-logo" src="/MomentumLogo.png" alt="Momentum logo" />
        </Link>
        <form onSubmit={onSubmit} className="login-form" style={{ width: 'min(420px, 90vw)' }}>
        {mode === 'create' ? (
          <>
            <div className="settings-card" style={{ marginTop: 0 }}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {fieldErrors?.username ? <div className="error-message">{fieldErrors.username}</div> : null}

              <div className="password-field-row">
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="btn-primary password-toggle-btn"
                  onClick={() => setShowCreatePassword((v) => !v)}
                  aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                  title={showCreatePassword ? 'Hide password' : 'Show password'}
                >
                  {showCreatePassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors?.password ? <div className="error-message">{fieldErrors.password}</div> : null}

              <div className="password-field-row">
                <input
                  type={showCreateConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="btn-primary password-toggle-btn"
                  onClick={() => setShowCreateConfirm((v) => !v)}
                  aria-label={showCreateConfirm ? 'Hide password' : 'Show password'}
                  title={showCreateConfirm ? 'Hide password' : 'Show password'}
                >
                  {showCreateConfirm ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="settings-help" style={{ marginTop: 10 }}>
                Password requirements:
                <div>8+ chars: {passwordChecklist(password).length ? 'Yes' : 'No'}</div>
                <div>1 uppercase: {passwordChecklist(password).hasUpper ? 'Yes' : 'No'}</div>
                <div>1 number: {passwordChecklist(password).hasDigit ? 'Yes' : 'No'}</div>
                <div>Passwords match: {password && confirmPassword && password === confirmPassword ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </>
        )}

        {error ? <div className="error-message">{error}</div> : null}

        <div className="button-group">
          <button
            type="submit"
            className={mode === 'create' ? 'btn-create' : 'btn-login'}
            disabled={loading}
          >
            {mode === 'create' ? 'Create account' : 'Sign in'}
          </button>

          <button
            type="button"
            className={mode === 'create' ? 'btn-login' : 'btn-create'}
            onClick={() => setMode(mode === 'create' ? 'signin' : 'create')}
            disabled={loading}
          >
            {mode === 'create' ? 'Have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
