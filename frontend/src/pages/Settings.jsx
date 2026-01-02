import React from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';

export default function Settings() {
  const { user, setUser } = useAuth();

  usePageMeta({ title: 'Momentum — Settings', description: 'Update your Momentum account settings.' });

  const [newUsername, setNewUsername] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const [avatarPreview, setAvatarPreview] = React.useState(() => user?.avatarUrl || null);

  React.useEffect(() => {
    setAvatarPreview(user?.avatarUrl || null);
  }, [user?.avatarUrl]);

  async function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    setError('');
    setSuccess('');

    if (!file.type?.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const body = new FormData();
      body.append('file', file);
      const updated = await apiFetch('/users/me/avatar', { method: 'POST', body });
      setUser(updated);
      setAvatarPreview(updated?.avatarUrl || null);
      setSuccess('Avatar updated');
    } catch (err) {
      setError(err?.message || 'Failed to upload avatar');
    }
  }

  async function onAvatarRemove() {
    if (!user?.userId) return;

    setError('');
    setSuccess('');

    try {
      const updated = await apiFetch('/users/me/avatar', { method: 'DELETE' });
      setUser(updated);
      setAvatarPreview(updated?.avatarUrl || null);
      setSuccess('Avatar removed');
    } catch (err) {
      setError(err?.message || 'Failed to remove avatar');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

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
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="main-content">
      <div className="page page-narrow">
        <h2>Settings</h2>
        <div>Signed in as: <strong>{user?.username}</strong></div>

        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-card__title">Avatar</div>
          <div className="settings-avatar-row">
            {avatarPreview ? (
              <img className="settings-avatar" src={avatarPreview} alt="Current avatar" />
            ) : (
              <div className="settings-avatar settings-avatar--empty" aria-hidden="true">—</div>
            )}
            <div className="settings-avatar-actions">
              <input type="file" accept="image/*" onChange={onAvatarChange} />
              <button type="button" className="btn-primary" onClick={onAvatarRemove} disabled={!avatarPreview}>Remove avatar</button>
            </div>
          </div>
          <div className="settings-help">Avatar is saved to your account.</div>
        </div>

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

          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </form>
      </div>
    </div>
  );
}
