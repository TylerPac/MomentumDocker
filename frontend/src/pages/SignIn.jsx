import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, setAccessToken } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';

export default function SignIn() {
  const navigate = useNavigate();
  const { user, loading, refresh, setUser } = useAuth();
  const [mode, setMode] = React.useState('signin');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

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

    try {
      const endpoint = mode === 'create' ? '/auth/register' : '/auth/login';
      const tokenRes = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
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
    }
  }

  return (
    <>
      <img className="logo" src="/MomentumLogo.png" alt="Momentum logo" />
      <form onSubmit={onSubmit} className="login-form" style={{ width: 'min(420px, 90vw)' }}>
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
