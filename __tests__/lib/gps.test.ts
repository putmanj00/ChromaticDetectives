import { describe, it, expect } from 'vitest';
import { getDistanceInMeters, isWithinRadius } from '../../lib/gps';

describe('gps', () => {
  it('calculates zero distance for same point', () => {
    const dist = getDistanceInMeters(39.1031, -84.5120, 39.1031, -84.5120);
    expect(dist).toBe(0);
  });

  it('calculates known distance between Cincinnati landmarks', () => {
    // Sleepy Bee to Roebling Bridge (approx 0.54km)
    const dist = getDistanceInMeters(39.1001, -84.5123, 39.0953, -84.5089);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(700);
  });

  it('calculates reasonable distance for nearby points', () => {
    // ~100m offset
    const dist = getDistanceInMeters(39.1031, -84.5120, 39.1040, -84.5120);
    expect(dist).toBeGreaterThan(80);
    expect(dist).toBeLessThan(120);
  });

  it('isWithinRadius returns true when within range', () => {
    const result = isWithinRadius(
      { lat: 39.1031, lng: -84.5120 },
      { lat: 39.1031, lng: -84.5120 },
      50
    );
    expect(result).toBe(true);
  });

  it('isWithinRadius returns false when out of range', () => {
    const result = isWithinRadius(
      { lat: 39.1001, lng: -84.5123 },
      { lat: 39.0953, lng: -84.5089 },
      50
    );
    expect(result).toBe(false);
  });
});
