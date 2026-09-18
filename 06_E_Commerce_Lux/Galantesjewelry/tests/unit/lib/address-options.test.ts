import { describe, expect, it } from 'vitest';
import { getCityOptions, getStateById } from '@/lib/address-options';

describe('address options', () => {
  it('returns Florida cities for the Florida state id', () => {
    expect(getStateById(10)?.label).toBe('Florida');
    expect(getCityOptions(10)).toContain('Islamorada');
    expect(getCityOptions(10)).toContain('Miami');
  });

  it('returns no city suggestions for an unknown state id', () => {
    expect(getCityOptions(9999)).toEqual([]);
  });
});
