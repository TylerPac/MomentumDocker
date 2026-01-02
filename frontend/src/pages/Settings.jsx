import React from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../auth';

export default function Settings() {
  const { user, setUser } = useAuth();

  const [newUsername, setNewUsername] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updated = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ newUsername, currentPassword, newPassword }),
      });
      setUser(updated);
      setSuccess('Settings updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err?.message || 'Failed to update settings');
    }
  }

  return (
    <div className="main-content">
      <div className="page page-narrow">
        <h2>Settings</h2>
        <div>Signed in as: <strong>{user?.username}</strong></div>

        <form onSubmit={onSubmit} className="workout-form" style={{ marginTop: 12 }}>
        <label>
          New Username (optional)
          <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
        </label>

        <label>
          Current Password (required)
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </label>

        <label>
          New Password (optional)
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>

          {error ? <div className="error-message">{error}</div> : null}
          {success ? <div className="success-message">{success}</div> : null}

          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
