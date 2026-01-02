import React from 'react';
import { apiFetch, setAccessToken } from '../api';
import { useAuth } from '../auth';
import { usePageMeta } from '../utils/pageMeta';

function getFieldErrors(err) {
  const data = err?.data;
  return (data && typeof data === 'object' && data.fieldErrors && typeof data.fieldErrors === 'object')
    ? data.fieldErrors
    : null;
}

function passwordChecklist(password) {
  const value = password || '';
  return {
    length: value.length >= 8,
    hasUpper: /[A-Z]/.test(value),
    hasDigit: /\d/.test(value),
  };
}

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

export default function Settings() {
  const { user, setUser } = useAuth();

  usePageMeta({ title: 'Momentum — Settings', description: 'Update your Momentum account settings.' });

  // Profile (avatar)
  const [avatarPreview, setAvatarPreview] = React.useState(() => user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarSaving, setAvatarSaving] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState('');
  const [avatarSuccess, setAvatarSuccess] = React.useState('');

  // Profile details (name/email)
  const [profileEmail, setProfileEmail] = React.useState(() => user?.email || '');
  const [profileFirstName, setProfileFirstName] = React.useState(() => user?.firstName || '');
  const [profileLastName, setProfileLastName] = React.useState(() => user?.lastName || '');
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [profileSuccess, setProfileSuccess] = React.useState('');
  const [profileFieldErrors, setProfileFieldErrors] = React.useState(null);

  // Account (username)
  const [newUsername, setNewUsername] = React.useState('');
  const [accountSaving, setAccountSaving] = React.useState(false);
  const [accountError, setAccountError] = React.useState('');
  const [accountSuccess, setAccountSuccess] = React.useState('');
  const [accountFieldErrors, setAccountFieldErrors] = React.useState(null);
  const [usernameCheckStatus, setUsernameCheckStatus] = React.useState('idle'); // idle|invalid|checking|available|taken|same

  // Security (password)
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [securitySaving, setSecuritySaving] = React.useState(false);
  const [securityError, setSecurityError] = React.useState('');
  const [securitySuccess, setSecuritySuccess] = React.useState('');
  const [securityFieldErrors, setSecurityFieldErrors] = React.useState(null);

  React.useEffect(() => {
    setAvatarPreview(user?.avatarUrl || null);
    setProfileEmail(user?.email || '');
    setProfileFirstName(user?.firstName || '');
    setProfileLastName(user?.lastName || '');
  }, [user?.avatarUrl, user?.email, user?.firstName, user?.lastName]);

  const isAvatarDirty = Boolean(avatarFile);
  const isProfileDetailsDirty =
    (profileEmail || '') !== (user?.email || '') ||
    (profileFirstName || '') !== (user?.firstName || '') ||
    (profileLastName || '') !== (user?.lastName || '');

  const isProfileDirty = isAvatarDirty || isProfileDetailsDirty;
  const normalizedNewUsername = (newUsername || '').trim();
  const isAccountDirty = Boolean(normalizedNewUsername) && normalizedNewUsername !== (user?.username || '');
  const isSecurityDirty = Boolean(currentPassword || newPassword || confirmNewPassword);

  React.useEffect(() => {
    const candidate = (newUsername || '').trim();
    const current = user?.username || '';

    if (!candidate) {
      setUsernameCheckStatus('idle');
      return;
    }
    if (candidate === current) {
      setUsernameCheckStatus('same');
      return;
    }
    if (!USERNAME_PATTERN.test(candidate)) {
      setUsernameCheckStatus('invalid');
      return;
    }

    const controller = new AbortController();
    setUsernameCheckStatus('checking');
    const t = setTimeout(async () => {
      try {
        const resp = await apiFetch(`/settings/account/username/check?username=${encodeURIComponent(candidate)}`, {
          signal: controller.signal,
        });
        setUsernameCheckStatus(resp?.available ? 'available' : 'taken');
      } catch (err) {
        // If aborted or failed, just fall back to idle; submit will still validate.
        if (err?.name === 'AbortError') return;
        setUsernameCheckStatus('idle');
      }
    }, 350);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [newUsername, user?.username]);

  React.useEffect(() => {
    function onBeforeUnload(e) {
      if (!isProfileDirty && !isAccountDirty && !isSecurityDirty) return;
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isProfileDirty, isAccountDirty, isSecurityDirty]);

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess('');

    if (!file.type?.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    setAvatarFile(file);
    try {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      // cleanup previous objectURL if any
      return () => URL.revokeObjectURL(url);
    } catch {
      // ignore preview errors
    }
  }

  async function onProfileSubmit(e) {
    e.preventDefault();
    if (!avatarFile) return;

    setAvatarError('');
    setAvatarSuccess('');
    setAvatarSaving(true);

    try {
      const body = new FormData();
      body.append('file', avatarFile);
      const resp = await apiFetch('/settings/profile/avatar', { method: 'POST', body });
      const updatedUser = resp?.user || null;
      if (updatedUser) {
        setUser(updatedUser);
        setAvatarPreview(updatedUser?.avatarUrl || null);
      }
      setAvatarFile(null);
      setAvatarSuccess(resp?.message || 'Avatar updated');
    } catch (err) {
      setAvatarError(err?.message || 'Failed to upload avatar');
    } finally {
      setAvatarSaving(false);
    }
  }

  async function onAvatarRemove() {
    setAvatarError('');
    setAvatarSuccess('');
    setAvatarSaving(true);

    try {
      const resp = await apiFetch('/settings/profile/avatar/remove', { method: 'POST' });
      const updatedUser = resp?.user || null;
      if (updatedUser) {
        setUser(updatedUser);
        setAvatarPreview(updatedUser?.avatarUrl || null);
      }
      setAvatarFile(null);
      setAvatarSuccess(resp?.message || 'Avatar removed');
    } catch (err) {
      setAvatarError(err?.message || 'Failed to remove avatar');
    } finally {
      setAvatarSaving(false);
    }
  }

  async function onProfileDetailsSubmit(e) {
    e.preventDefault();
    if (!isProfileDetailsDirty) return;

    setProfileError('');
    setProfileSuccess('');
    setProfileFieldErrors(null);
    setProfileSaving(true);

    try {
      const resp = await apiFetch('/settings/profile', {
        method: 'POST',
        body: JSON.stringify({
          email: profileEmail,
          firstName: profileFirstName,
          lastName: profileLastName,
        }),
      });
      const updatedUser = resp?.user || null;
      if (updatedUser) setUser(updatedUser);
      setProfileSuccess(resp?.message || 'Profile updated');
    } catch (err) {
      setProfileError(err?.message || 'Failed to update profile');
      setProfileFieldErrors(getFieldErrors(err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function onAccountSubmit(e) {
    e.preventDefault();

    const next = (newUsername || '').trim();
    if (!next || next === (user?.username || '')) return;

    if (!USERNAME_PATTERN.test(next)) {
      setAccountError('');
      setAccountSuccess('');
      setAccountFieldErrors({ newUsername: '3–20 characters, letters/numbers/underscore' });
      setUsernameCheckStatus('invalid');
      return;
    }

    setAccountError('');
    setAccountSuccess('');
    setAccountFieldErrors(null);
    setAccountSaving(true);

    try {
      // Quick availability check so the user gets feedback before attempting update.
      const check = await apiFetch(`/settings/account/username/check?username=${encodeURIComponent(next)}`);
      if (!check?.available) {
        setAccountFieldErrors({ newUsername: 'Username already taken' });
        setUsernameCheckStatus('taken');
        return;
      }

      const resp = await apiFetch('/settings/account/username', {
        method: 'POST',
        body: JSON.stringify({ newUsername: next }),
      });

      if (resp?.accessToken) {
        setAccessToken(resp.accessToken);
      }
      const updatedUser = resp?.user || null;
      if (updatedUser) setUser(updatedUser);
      setNewUsername('');
      setAccountSuccess(resp?.message || 'Username updated');
    } catch (err) {
      const fe = getFieldErrors(err);
      setAccountFieldErrors(fe);
      setAccountError(fe ? '' : (err?.message || 'Failed to update username'));
    } finally {
      setAccountSaving(false);
    }
  }

  async function onSecuritySubmit(e) {
    e.preventDefault();

    setSecurityError('');
    setSecuritySuccess('');
    setSecurityFieldErrors(null);

    const checklist = passwordChecklist(newPassword);
    if (!checklist.length || !checklist.hasUpper || !checklist.hasDigit) {
      setSecurityError('Password does not meet requirements');
      return;
    }
    if (!confirmNewPassword || confirmNewPassword !== newPassword) {
      setSecurityError('Confirm password must match');
      return;
    }
    if (!currentPassword) {
      setSecurityError('Current password is required');
      return;
    }

    setSecuritySaving(true);
    try {
      const resp = await apiFetch('/settings/security/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const updatedUser = resp?.user || null;
      if (updatedUser) setUser(updatedUser);
      setSecuritySuccess(resp?.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setSecurityError(err?.message || 'Failed to update password');
      setSecurityFieldErrors(getFieldErrors(err));
    } finally {
      setSecuritySaving(false);
    }
  }

  return (
    <div className="main-content">
      <div className="page page-narrow">
        <h2>Settings</h2>

        {/* Profile */}
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-card__title">Profile</div>
          <form onSubmit={onProfileSubmit} className="workout-form" style={{ marginTop: 10 }}>
            <div className="settings-avatar-row">
              {avatarPreview ? (
                <img className="settings-avatar" src={avatarPreview} alt="Current avatar" />
              ) : (
                <div className="settings-avatar settings-avatar--empty" aria-hidden="true">—</div>
              )}
              <div className="settings-avatar-actions">
                <input type="file" accept="image/*" onChange={onAvatarChange} />
                <button type="button" className="btn-primary" onClick={onAvatarRemove} disabled={avatarSaving || !avatarPreview}>
                  Remove avatar
                </button>
              </div>
            </div>

            {avatarError ? <div className="error-message">{avatarError}</div> : null}
            {avatarSuccess ? <div className="success-message">{avatarSuccess}</div> : null}

            <button type="submit" className="btn-primary" disabled={avatarSaving || !isAvatarDirty}>
              {avatarSaving ? 'Saving…' : 'Save avatar'}
            </button>
          </form>

          <form onSubmit={onProfileDetailsSubmit} className="workout-form" style={{ marginTop: 12 }}>
            <label>
              First name
              <input value={profileFirstName} onChange={(e) => setProfileFirstName(e.target.value)} />
            </label>
            {profileFieldErrors?.firstName ? <div className="error-message">{profileFieldErrors.firstName}</div> : null}

            <label>
              Last name
              <input value={profileLastName} onChange={(e) => setProfileLastName(e.target.value)} />
            </label>
            {profileFieldErrors?.lastName ? <div className="error-message">{profileFieldErrors.lastName}</div> : null}

            <label>
              Email
              <input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
            </label>
            {profileFieldErrors?.email ? <div className="error-message">{profileFieldErrors.email}</div> : null}

            {profileError ? <div className="error-message">{profileError}</div> : null}
            {profileSuccess ? <div className="success-message">{profileSuccess}</div> : null}

            <button type="submit" className="btn-primary" disabled={profileSaving || !isProfileDetailsDirty}>
              {profileSaving ? 'Saving…' : 'Save profile'}
            </button>
          </form>

          <div className="settings-help">Update your name, email, and avatar.</div>
        </div>

        {/* Account */}
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-card__title">Account</div>
          <div className="settings-help" style={{ marginTop: 6 }}>
            Current username: <strong>{user?.username || '—'}</strong>
          </div>
          <form onSubmit={onAccountSubmit} className="workout-form" style={{ marginTop: 10 }}>
            <label>
              New username
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            </label>
            <div className="settings-help">3–20 characters, letters/numbers/underscore</div>
            <div className="settings-help">
              Availability: {
                usernameCheckStatus === 'checking' ? 'Checking…' :
                usernameCheckStatus === 'available' ? '✓ Available' :
                usernameCheckStatus === 'taken' ? '— Taken' :
                usernameCheckStatus === 'invalid' ? '— Invalid' :
                usernameCheckStatus === 'same' ? '✓ Same as current' :
                '—'
              }
            </div>
            {accountFieldErrors?.newUsername ? <div className="error-message">{accountFieldErrors.newUsername}</div> : null}

            {accountError ? <div className="error-message">{accountError}</div> : null}
            {accountSuccess ? <div className="success-message">{accountSuccess}</div> : null}

            <button type="submit" className="btn-primary" disabled={accountSaving || !isAccountDirty || usernameCheckStatus !== 'available'}>
              {accountSaving ? 'Saving…' : 'Update username'}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-card__title">Security</div>

          {!showPasswordForm ? (
            <button type="button" className="btn-primary" onClick={() => {
              setSecurityError('');
              setSecuritySuccess('');
              setSecurityFieldErrors(null);
              setShowPasswordForm(true);
            }}>
              Change password
            </button>
          ) : (
            <form onSubmit={onSecuritySubmit} className="workout-form" style={{ marginTop: 10 }}>
              <label>
                Current password
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    style={{ width: 48, padding: 12, backgroundColor: showCurrentPassword ? 'var(--color-error)' : undefined }}
                  >
                    {'👁'}
                  </button>
                </div>
              </label>
              {securityFieldErrors?.currentPassword ? <div className="error-message">{securityFieldErrors.currentPassword}</div> : null}

              <label>
                New password
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{ width: 48, padding: 12, backgroundColor: showNewPassword ? 'var(--color-error)' : undefined }}
                  >
                    {'👁'}
                  </button>
                </div>
              </label>
              {securityFieldErrors?.newPassword ? <div className="error-message">{securityFieldErrors.newPassword}</div> : null}

              <div className="settings-help">
                Password requirements:
                <div>8+ chars: {passwordChecklist(newPassword).length ? '✓' : '—'}</div>
                <div>1 uppercase: {passwordChecklist(newPassword).hasUpper ? '✓' : '—'}</div>
                <div>1 number: {passwordChecklist(newPassword).hasDigit ? '✓' : '—'}</div>
                <div>Passwords match: {newPassword && confirmNewPassword && confirmNewPassword === newPassword ? '✓' : '—'}</div>
              </div>

              <label>
                Confirm new password
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{ width: 48, padding: 12, backgroundColor: showConfirmPassword ? 'var(--color-error)' : undefined }}
                  >
                    {'👁'}
                  </button>
                </div>
              </label>
              {confirmNewPassword && newPassword && confirmNewPassword !== newPassword ? (
                <div className="error-message">Passwords do not match</div>
              ) : null}

              {securityError ? <div className="error-message">{securityError}</div> : null}
              {securitySuccess ? <div className="success-message">{securitySuccess}</div> : null}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className="btn-primary" disabled={securitySaving || !isSecurityDirty}>
                  {securitySaving ? 'Saving…' : 'Update password'}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                    setSecurityError('');
                    setSecuritySuccess('');
                    setSecurityFieldErrors(null);
                  }}
                  disabled={securitySaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
