import React from 'react';
import { useAuth } from '../auth';

function initialsFromUsername(username) {
  const s = String(username || '').trim();
  if (!s) return '?';
  const parts = s.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return letters.join('') || s[0].toUpperCase();
}

export default function UserBadge() {
  const { user } = useAuth();

  const avatarSrc = user?.avatarUrl || null;

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
