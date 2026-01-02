import React from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';
import { clearAvatarDataUrl, getAvatarDataUrl, setAvatarDataUrl } from '../utils/avatar';

export default function Settings() {
  const { user, setUser } = useAuth();

  usePageMeta({ title: 'Momentum — Settings', description: 'Update your Momentum account settings.' });

  const [newUsername, setNewUsername] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const [avatarPreview, setAvatarPreview] = React.useState(() => getAvatarDataUrl(user?.userId));

  React.useEffect(() => {
    setAvatarPreview(getAvatarDataUrl(user?.userId));
  }, [user?.userId]);

  async function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    if (!file.type?.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Local-only avatar storage (browser). Can be upgraded later to server upload.
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;
      setAvatarDataUrl(user.userId, dataUrl);
      setAvatarPreview(dataUrl);
      setSuccess('Avatar updated');
    };
    reader.onerror = () => setError('Failed to read image');
    reader.readAsDataURL(file);
  }

  function onAvatarRemove() {
    if (!user?.userId) return;
    clearAvatarDataUrl(user.userId);
    setAvatarPreview(null);
    setSuccess('Avatar removed');
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
          <div className="settings-help">Avatar is saved in this browser only for now.</div>
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
