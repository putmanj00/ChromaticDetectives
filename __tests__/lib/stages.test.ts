import { describe, it, expect } from 'vitest';
import { STAGES, getStageById, getStageByRoute } from '../../lib/stages';

describe('stages', () => {
  it('should have exactly 15 stages', () => {
    expect(STAGES).toHaveLength(15);
  });

  it('should have sequential IDs from 1 to 15', () => {
    const ids = STAGES.map((s) => s.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('every stage should have required fields', () => {
    for (const stage of STAGES) {
      expect(stage.title).toBeTruthy();
      expect(stage.location).toBeTruthy();
      expect(stage.coordinates.lat).toBeTypeOf('number');
      expect(stage.coordinates.lng).toBeTypeOf('number');
      expect(stage.route).toMatch(/^\/stage-\d{2}$/);
      expect(['gps', 'scan', 'puzzle', 'time']).toContain(stage.unlockType);
      expect(stage.unlockRadius).toBeGreaterThan(0);
      expect(stage.hints).toHaveLength(3);
      expect(stage.clueText).toBeTruthy();
    }
  });

  it('getStageById returns correct stage', () => {
    const stage = getStageById(7);
    expect(stage?.title).toBe('THE TRANSIT');
  });

  it('getStageById returns undefined for invalid id', () => {
    expect(getStageById(99)).toBeUndefined();
  });

  it('getStageByRoute returns correct stage', () => {
    const stage = getStageByRoute('/stage-15');
    expect(stage?.title).toBe('PROTOCOL OMEGA');
  });

  it('coordinates are within Cincinnati area', () => {
    for (const stage of STAGES) {
      expect(stage.coordinates.lat).toBeGreaterThan(38.9);
      expect(stage.coordinates.lat).toBeLessThan(39.2);
      expect(stage.coordinates.lng).toBeGreaterThan(-84.6);
      expect(stage.coordinates.lng).toBeLessThan(-84.4);
    }
  });
});
