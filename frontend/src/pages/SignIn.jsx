import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, setAccessToken } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';

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
  const { user, loading, refresh, setUser } = useAuth();
  const [mode, setMode] = React.useState('signin');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCreatePassword, setShowCreatePassword] = React.useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
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
        ? { username, password, email, firstName, lastName }
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
    <>
      <img className="logo" src="/MomentumLogo.png" alt="Momentum logo" />
      <form onSubmit={onSubmit} className="login-form" style={{ width: 'min(420px, 90vw)' }}>
        {mode === 'create' ? (
          <>
            <div className="settings-card" style={{ marginTop: 0 }}>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
              {fieldErrors?.firstName ? <div className="error-message">{fieldErrors.firstName}</div> : null}

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
              />
              {fieldErrors?.lastName ? <div className="error-message">{fieldErrors.lastName}</div> : null}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              {fieldErrors?.email ? <div className="error-message">{fieldErrors.email}</div> : null}

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {fieldErrors?.username ? <div className="error-message">{fieldErrors.username}</div> : null}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowCreatePassword((v) => !v)}
                  aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                  title={showCreatePassword ? 'Hide password' : 'Show password'}
                  style={{ width: 48, padding: 12 }}
                >
                  {showCreatePassword ? '🙈' : '👁'}
                </button>
              </div>
              {fieldErrors?.password ? <div className="error-message">{fieldErrors.password}</div> : null}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type={showCreateConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowCreateConfirm((v) => !v)}
                  aria-label={showCreateConfirm ? 'Hide password' : 'Show password'}
                  title={showCreateConfirm ? 'Hide password' : 'Show password'}
                  style={{ width: 48, padding: 12 }}
                >
                  {showCreateConfirm ? '🙈' : '👁'}
                </button>
              </div>

              <div className="settings-help" style={{ marginTop: 10 }}>
                Password requirements:
                <div>8+ chars: {passwordChecklist(password).length ? '✓' : '—'}</div>
                <div>1 uppercase: {passwordChecklist(password).hasUpper ? '✓' : '—'}</div>
                <div>1 number: {passwordChecklist(password).hasDigit ? '✓' : '—'}</div>
                <div>Passwords match: {password && confirmPassword && password === confirmPassword ? '✓' : '—'}</div>
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
    </>
  );
}
