const METRIC = 'metric';
const IMPERIAL = 'imperial';

export function normalizeUnitSystem(unitSystem) {
  const normalized = String(unitSystem || '').trim().toLowerCase();
  return normalized === IMPERIAL ? IMPERIAL : METRIC;
}

export function getUnitPreference(unitSystem) {
  const normalized = normalizeUnitSystem(unitSystem);
  return {
    unitSystem: normalized,
    distanceUnit: normalized === IMPERIAL ? 'mi' : 'km',
    weightUnit: normalized === IMPERIAL ? 'lb' : 'kg',
    paceUnit: normalized === IMPERIAL ? 'min/mi' : 'min/km',
  };
}

export function formatDisplayNumber(value, maximumFractionDigits = 2) {
  if (value == null || value === '') return '';

  const n = Number(value);
  if (!Number.isFinite(n)) return '';

  const factor = 10 ** maximumFractionDigits;
  return String(Math.round(n * factor) / factor);
}