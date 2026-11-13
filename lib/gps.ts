import { Coordinates } from './types';

/**
 * Haversine formula: calculates distance in meters between two GPS coordinates.
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if current position is within unlock radius of a stage.
 */
export function isWithinRadius(
  current: Coordinates,
  target: Coordinates,
  radiusMeters: number
): boolean {
  const distance = getDistanceInMeters(current.lat, current.lng, target.lat, target.lng);
  return distance <= radiusMeters;
}

/**
 * Get mock position from window global (for ?mock=true testing).
 */
export function getMockPosition(): Coordinates | null {
  const win = window as unknown as { __mockPosition?: Coordinates };
  return win.__mockPosition ?? null;
}

/**
 * Check if mock mode is enabled via URL param or localStorage.
 */
export function isMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem('mock_mode') === 'true') return true;
  } catch { /* ignore */ }
  const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
  return params.get('mock') === 'true';
}
