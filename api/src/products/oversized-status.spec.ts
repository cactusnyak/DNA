import { resolveEffectiveOversizedStatus } from './oversized-status';

describe('resolveEffectiveOversizedStatus', () => {
  it('inherits only the immediate category value for null override', () => {
    expect(resolveEffectiveOversizedStatus(null, true)).toBe(true);
    expect(resolveEffectiveOversizedStatus(null, false)).toBe(false);
  });
  it('allows a product to force oversized', () => {
    expect(resolveEffectiveOversizedStatus(true, false)).toBe(true);
  });
  it('allows a product to opt out', () => {
    expect(resolveEffectiveOversizedStatus(false, true)).toBe(false);
  });
});
