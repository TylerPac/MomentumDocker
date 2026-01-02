export function isClockInputMaybeValid(value) {
  return /^\d{0,4}(:\d{0,2})?$/.test(value);
}

export function parseClockToMinutes(input) {
  const s = String(input ?? '').trim();
  if (!s) return null;

  if (!/^\d+:\d{2}$/.test(s)) {
    throw new Error('Time must be in m:ss format (example: 3:30)');
  }

  const [minutesStr, secondsStr] = s.split(':');
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);

  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error('Minutes must be a non-negative number');
  }
  if (!Number.isFinite(seconds) || seconds < 0 || seconds >= 60) {
    throw new Error('Seconds must be between 00 and 59');
  }

  return minutes + seconds / 60;
}

export function formatMinutesAsClock(value) {
  if (value == null) return '';

  const n = Number(value);
  if (!Number.isFinite(n)) return '';

  const totalSeconds = Math.max(0, Math.round(n * 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
