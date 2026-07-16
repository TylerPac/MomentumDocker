import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearAccessToken } from '../api';
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

export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  usePageMeta({ title: 'Momentum — Settings', description: 'Update your Momentum account settings.' });

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
  const [deleteSaving, setDeleteSaving] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');

  const isSecurityDirty = Boolean(currentPassword || newPassword || confirmNewPassword);

  React.useEffect(() => {
    function onBeforeUnload(e) {
      if (!isSecurityDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isSecurityDirty]);

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
    } catch (err) {
      setSecurityError(err?.message || 'Failed to update password');
      setSecurityFieldErrors(getFieldErrors(err));
    } finally {
      setSecuritySaving(false);
    }
  }

  async function onDeleteAccount() {
    setDeleteError('');
    const confirmed = window.confirm('Delete your account permanently? This will remove all workouts and cannot be undone.');
    if (!confirmed) return;

    setDeleteSaving(true);
    try {
      await apiFetch('/settings/account', { method: 'DELETE' });
      clearAccessToken();
      setUser(null);
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete account');
    } finally {
      setDeleteSaving(false);
    }
  }

  return (
    <div className="main-content">
      <div className="page page-narrow settings-page">
        <h2>Settings</h2>
        <p className="settings-page__subtitle">Manage your account security and data.</p>

        <div className="settings-card settings-card--security">
          <div className="settings-card__title">Security</div>
          <div className="settings-help">
            Signed in as: <strong>{user?.username || 'N/A'}</strong>
          </div>
          <form onSubmit={onSecuritySubmit} className="workout-form settings-form">
              <label>
                Current password
                <div className="password-field-row">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-primary password-toggle-btn"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              {securityFieldErrors?.currentPassword ? <div className="error-message">{securityFieldErrors.currentPassword}</div> : null}

              <label>
                New password
                <div className="password-field-row">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-primary password-toggle-btn"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              {securityFieldErrors?.newPassword ? <div className="error-message">{securityFieldErrors.newPassword}</div> : null}

              <div className="settings-checklist" aria-label="Password requirements">
                <div className="settings-checklist__title">Password requirements</div>
                <div className="settings-checklist__item">8+ chars: {passwordChecklist(newPassword).length ? 'Yes' : 'No'}</div>
                <div className="settings-checklist__item">1 uppercase: {passwordChecklist(newPassword).hasUpper ? 'Yes' : 'No'}</div>
                <div className="settings-checklist__item">1 number: {passwordChecklist(newPassword).hasDigit ? 'Yes' : 'No'}</div>
                <div className="settings-checklist__item">Passwords match: {newPassword && confirmNewPassword && confirmNewPassword === newPassword ? 'Yes' : 'No'}</div>
              </div>

              <label>
                Confirm new password
                <div className="password-field-row">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-primary password-toggle-btn"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              {confirmNewPassword && newPassword && confirmNewPassword !== newPassword ? (
                <div className="error-message">Passwords do not match</div>
              ) : null}

              {securityError ? <div className="error-message">{securityError}</div> : null}
              {securitySuccess ? <div className="success-message">{securitySuccess}</div> : null}

              <div className="settings-actions">
                <button type="submit" className="btn-primary" disabled={securitySaving || !isSecurityDirty}>
                  {securitySaving ? 'Saving...' : 'Update password'}
                </button>
              </div>
            </form>
        </div>

        <div className="settings-card settings-card--danger">
          <div className="settings-card__title">Danger Zone</div>
          <div className="settings-help">
            Deleting your account permanently removes your workout history and cannot be undone.
          </div>
          {deleteError ? <div className="error-message">{deleteError}</div> : null}
          <button
            type="button"
            className="btn-danger"
            onClick={onDeleteAccount}
            disabled={deleteSaving}
          >
            {deleteSaving ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}
