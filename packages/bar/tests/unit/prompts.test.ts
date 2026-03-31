import { describe, it, expect } from 'vitest';
import {
  VIBELENS_FORMAT_VERSION,
  VERSION_COMMENT,
  PROMPTS,
  COMBINED_PROMPT,
  parseDocVersion,
} from '../../src/core/prompts.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('VIBELENS_FORMAT_VERSION', () => {
  it('is 1', () => {
    expect(VIBELENS_FORMAT_VERSION).toBe(1);
  });
});

describe('VERSION_COMMENT', () => {
  it('is the correct HTML comment string', () => {
    expect(VERSION_COMMENT).toBe('<!-- vibelens format:1 -->');
  });
});

// ---------------------------------------------------------------------------
// PROMPTS
// ---------------------------------------------------------------------------

describe('PROMPTS', () => {
  const expectedKeys = ['summary', 'stack', 'technical-summary', 'technical-overview', 'quiz', 'review'];

  it('has all required keys', () => {
    for (const key of expectedKeys) {
      expect(PROMPTS).toHaveProperty(key);
    }
  });

  it('has non-empty strings for all keys', () => {
    for (const key of expectedKeys) {
      expect(typeof PROMPTS[key]).toBe('string');
      expect(PROMPTS[key].trim().length).toBeGreaterThan(0);
    }
  });

  it('does not have unexpected keys', () => {
    const keys = Object.keys(PROMPTS);
    expect(keys).toHaveLength(expectedKeys.length);
    for (const key of keys) {
      expect(expectedKeys).toContain(key);
    }
  });
});

// ---------------------------------------------------------------------------
// COMBINED_PROMPT
// ---------------------------------------------------------------------------

describe('COMBINED_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof COMBINED_PROMPT).toBe('string');
    expect(COMBINED_PROMPT.trim().length).toBeGreaterThan(0);
  });

  it('contains the word "six" (referencing all 6 files)', () => {
    expect(COMBINED_PROMPT.toLowerCase()).toContain('six');
  });

  it('contains the text of the summary prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['summary']);
  });

  it('contains the text of the stack prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['stack']);
  });

  it('contains the text of the technical-summary prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['technical-summary']);
  });

  it('contains the text of the technical-overview prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['technical-overview']);
  });

  it('contains the text of the quiz prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['quiz']);
  });

  it('contains the text of the review prompt', () => {
    expect(COMBINED_PROMPT).toContain(PROMPTS['review']);
  });
});

// ---------------------------------------------------------------------------
// parseDocVersion
// ---------------------------------------------------------------------------

describe('parseDocVersion', () => {
  it('parses version 1 from a valid stamp', () => {
    expect(parseDocVersion('<!-- vibelens format:1 -->')).toBe(1);
  });

  it('parses version 2 from a valid stamp', () => {
    expect(parseDocVersion('<!-- vibelens format:2 -->')).toBe(2);
  });

  it('parses version when stamp is followed by more content', () => {
    expect(parseDocVersion('<!-- vibelens format:1 -->\n\n# My Doc\nContent here.')).toBe(1);
  });

  it('returns null when version stamp is missing', () => {
    expect(parseDocVersion('# Just a regular markdown file')).toBeNull();
  });

  it('returns null for malformed stamp (wrong keyword)', () => {
    expect(parseDocVersion('<!-- vibe-lens format:1 -->')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDocVersion('')).toBeNull();
  });

  it('returns null for a stamp with no version number', () => {
    expect(parseDocVersion('<!-- vibelens format: -->')).toBeNull();
  });

  it('is strict about requiring digits for version number', () => {
    expect(parseDocVersion('<!-- vibelens format:abc -->')).toBeNull();
  });

  it('handles extra whitespace inside the comment (\\s* allows it, returns the version)', () => {
    // The regex uses \s* around the stamp, so extra internal spaces still match
    expect(parseDocVersion('<!--  vibelens  format:3  -->')).toBe(3);
  });
});
