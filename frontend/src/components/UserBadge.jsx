import React from 'react';
import { useAuth } from '../auth';
import { getAvatarDataUrl } from '../utils/avatar';

function initialsFromUsername(username) {
  const s = String(username || '').trim();
  if (!s) return '?';
  const parts = s.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return letters.join('') || s[0].toUpperCase();
}

export default function UserBadge() {
  const { user } = useAuth();
  const [avatarSrc, setAvatarSrc] = React.useState(null);

  React.useEffect(() => {
    if (!user?.userId) {
      setAvatarSrc(null);
      return;
    }

    const key = `momentum.avatar.${user.userId}`;
    const update = () => setAvatarSrc(getAvatarDataUrl(user.userId));
    update();

    function onStorage(e) {
      if (e.key === key) update();
    }

    function onAvatarUpdated(e) {
      const updatedUserId = e?.detail?.userId;
      if (updatedUserId === user.userId) update();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('momentum:avatar-updated', onAvatarUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('momentum:avatar-updated', onAvatarUpdated);
    };
  }, [user?.userId]);

  if (!user) return null;

  const initials = initialsFromUsername(user.username);

  return (
    <div className="user-badge" aria-label="Signed in user">
      {avatarSrc ? (
        <img className="user-badge__avatar" src={avatarSrc} alt="User avatar" />
      ) : (
        <div className="user-badge__avatar user-badge__avatar--fallback" aria-hidden="true">{initials}</div>
      )}
      <div className="user-badge__name">{user.username}</div>
    </div>
  );
}
