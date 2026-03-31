import { describe, it, expect } from 'vitest';
import { DEFAULT_BASE_PATH, DEFAULT_OPTIONS } from '../../src/core/constants.ts';

describe('DEFAULT_BASE_PATH', () => {
  it("is '/.vibelens/docs'", () => {
    expect(DEFAULT_BASE_PATH).toBe('/.vibelens/docs');
  });
});

describe('DEFAULT_OPTIONS', () => {
  it('has basePath equal to DEFAULT_BASE_PATH', () => {
    expect(DEFAULT_OPTIONS.basePath).toBe(DEFAULT_BASE_PATH);
  });

  it("has position equal to 'bottom'", () => {
    expect(DEFAULT_OPTIONS.position).toBe('bottom');
  });

  it('has fixed equal to true', () => {
    expect(DEFAULT_OPTIONS.fixed).toBe(true);
  });

  it("has appName equal to empty string ''", () => {
    expect(DEFAULT_OPTIONS.appName).toBe('');
  });

  it("has theme equal to 'dark'", () => {
    expect(DEFAULT_OPTIONS.theme).toBe('dark');
  });

  it('has exactly the expected keys', () => {
    const keys = Object.keys(DEFAULT_OPTIONS).sort();
    expect(keys).toEqual(['appName', 'basePath', 'fixed', 'position', 'theme']);
  });
});
