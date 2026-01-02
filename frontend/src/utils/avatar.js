const AVATAR_PREFIX = 'momentum.avatar.';
const AVATAR_UPDATED_EVENT = 'momentum:avatar-updated';

function keyForUserId(userId) {
  if (userId == null) return null;
  return `${AVATAR_PREFIX}${userId}`;
}

export function getAvatarDataUrl(userId) {
  const key = keyForUserId(userId);
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setAvatarDataUrl(userId, dataUrl) {
  const key = keyForUserId(userId);
  if (!key) return;
  try {
    if (!dataUrl) localStorage.removeItem(key);
    else localStorage.setItem(key, dataUrl);
  } catch {
    // ignore
  }

  // `storage` event does not fire in the same window/tab that made the change.
  try {
    window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { userId } }));
  } catch {
    // ignore
  }
}

export function clearAvatarDataUrl(userId) {
  setAvatarDataUrl(userId, null);
}
