import { describe, it, expect } from 'vitest';

// Basic test example for Vitest setup

describe('Basic math test', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle edge case: 0 + 0', () => {
    expect(0 + 0).toBe(0);
  });

  it('should fail for incorrect addition', () => {
    expect(2 + 2).not.toBe(5);
  });
});
