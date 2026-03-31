import { describe, it, expect } from 'vitest';
import {
  parseQuiz,
  sortByDifficulty,
  getDifficultyBreakdown,
  shuffleQuestions,
  type Question,
  type Difficulty,
} from '../../src/core/parseQuiz.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    number: 1,
    text: 'What is 2 + 2?',
    options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
    correctIndex: 1,
    clarification: null,
    explanation: null,
    difficulty: 'medium',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// parseQuiz
// ---------------------------------------------------------------------------

describe('parseQuiz', () => {
  it('parses a single valid question with all components', () => {
    const md = `**1. What is TypeScript?**
- A) A database
- **B) A typed superset of JavaScript**
- C) A CSS framework
- D) A test runner

? TypeScript adds static types to JavaScript.

> It was developed by Microsoft and released in 2012.

@ easy`;

    const questions = parseQuiz(md);
    expect(questions).toHaveLength(1);

    const q = questions[0];
    expect(q.number).toBe(1);
    expect(q.text).toBe('What is TypeScript?');
    expect(q.options).toHaveLength(4);
    expect(q.correctIndex).toBe(1);
    expect(q.clarification).toBe('TypeScript adds static types to JavaScript.');
    expect(q.explanation).toBe('It was developed by Microsoft and released in 2012.');
    expect(q.difficulty).toBe('easy');
  });

  it('parses multiple questions', () => {
    const md = `**1. First question?**
- A) Wrong
- **B) Right**
- C) Also wrong

**2. Second question?**
- **A) Correct**
- B) Incorrect
- C) Nope`;

    const questions = parseQuiz(md);
    expect(questions).toHaveLength(2);
    expect(questions[0].number).toBe(1);
    expect(questions[1].number).toBe(2);
    expect(questions[0].correctIndex).toBe(1);
    expect(questions[1].correctIndex).toBe(0);
  });

  it('returns empty array for empty input', () => {
    expect(parseQuiz('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(parseQuiz('   \n\n  ')).toEqual([]);
  });

  it('drops a question that has fewer than 2 options', () => {
    const md = `**1. Only one option?**
- **A) Only option**`;

    const questions = parseQuiz(md);
    expect(questions).toHaveLength(0);
  });

  it('drops a question with no correct answer (no bold option)', () => {
    const md = `**1. No correct answer marked?**
- A) Option one
- B) Option two
- C) Option three`;

    const questions = parseQuiz(md);
    expect(questions).toHaveLength(0);
  });

  it('defaults difficulty to medium when @ line is absent', () => {
    const md = `**1. What is Node.js?**
- A) A browser
- **B) A JavaScript runtime**
- C) A framework`;

    const [q] = parseQuiz(md);
    expect(q.difficulty).toBe('medium');
  });

  it('parses @ easy difficulty', () => {
    const md = `**1. Easy question?**
- A) Wrong
- **B) Right**
@ easy`;
    const [q] = parseQuiz(md);
    expect(q.difficulty).toBe('easy');
  });

  it('parses @ medium difficulty', () => {
    const md = `**1. Medium question?**
- A) Wrong
- **B) Right**
@ medium`;
    const [q] = parseQuiz(md);
    expect(q.difficulty).toBe('medium');
  });

  it('parses @ hard difficulty', () => {
    const md = `**1. Hard question?**
- A) Wrong
- **B) Right**
@ hard`;
    const [q] = parseQuiz(md);
    expect(q.difficulty).toBe('hard');
  });

  it('joins multiple clarification lines with a space', () => {
    const md = `**1. Multi-clarification?**
- A) Wrong
- **B) Right**
? First clarification line.
? Second clarification line.`;

    const [q] = parseQuiz(md);
    expect(q.clarification).toBe('First clarification line. Second clarification line.');
  });

  it('joins multiple explanation lines with a space', () => {
    const md = `**1. Multi-explanation?**
- A) Wrong
- **B) Right**
> First explanation line.
> Second explanation line.`;

    const [q] = parseQuiz(md);
    expect(q.explanation).toBe('First explanation line. Second explanation line.');
  });

  it('sets clarification to null when absent', () => {
    const md = `**1. No clarification?**
- A) Wrong
- **B) Right**`;
    const [q] = parseQuiz(md);
    expect(q.clarification).toBeNull();
  });

  it('sets explanation to null when absent', () => {
    const md = `**1. No explanation?**
- A) Wrong
- **B) Right**`;
    const [q] = parseQuiz(md);
    expect(q.explanation).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// sortByDifficulty
// ---------------------------------------------------------------------------

describe('sortByDifficulty', () => {
  it('sorts questions in easy → medium → hard order', () => {
    const questions: Question[] = [
      makeQuestion({ number: 1, difficulty: 'hard' }),
      makeQuestion({ number: 2, difficulty: 'easy' }),
      makeQuestion({ number: 3, difficulty: 'medium' }),
    ];

    const sorted = sortByDifficulty(questions);
    expect(sorted.map((q) => q.difficulty)).toEqual(['easy', 'medium', 'hard']);
  });

  it('does not mutate the input array', () => {
    const questions: Question[] = [
      makeQuestion({ number: 1, difficulty: 'hard' }),
      makeQuestion({ number: 2, difficulty: 'easy' }),
    ];
    const original = [...questions];
    sortByDifficulty(questions);
    expect(questions).toEqual(original);
  });

  it('handles an empty array', () => {
    expect(sortByDifficulty([])).toEqual([]);
  });

  it('returns a new array reference', () => {
    const questions = [makeQuestion()];
    const sorted = sortByDifficulty(questions);
    expect(sorted).not.toBe(questions);
  });
});

// ---------------------------------------------------------------------------
// getDifficultyBreakdown
// ---------------------------------------------------------------------------

describe('getDifficultyBreakdown', () => {
  it('counts questions per difficulty level', () => {
    const questions: Question[] = [
      makeQuestion({ difficulty: 'easy' }),
      makeQuestion({ difficulty: 'easy' }),
      makeQuestion({ difficulty: 'medium' }),
      makeQuestion({ difficulty: 'hard' }),
      makeQuestion({ difficulty: 'hard' }),
      makeQuestion({ difficulty: 'hard' }),
    ];

    const breakdown = getDifficultyBreakdown(questions);
    expect(breakdown).toEqual({ easy: 2, medium: 1, hard: 3 });
  });

  it('returns {easy:0, medium:0, hard:0} for an empty array', () => {
    expect(getDifficultyBreakdown([])).toEqual({ easy: 0, medium: 0, hard: 0 });
  });

  it('returns correct counts when only one difficulty present', () => {
    const questions = [makeQuestion({ difficulty: 'hard' }), makeQuestion({ difficulty: 'hard' })];
    const breakdown = getDifficultyBreakdown(questions);
    expect(breakdown).toEqual({ easy: 0, medium: 0, hard: 2 });
  });
});

// ---------------------------------------------------------------------------
// shuffleQuestions
// ---------------------------------------------------------------------------

describe('shuffleQuestions', () => {
  it('does not mutate the input array', () => {
    const questions: Question[] = [
      makeQuestion({ number: 1 }),
      makeQuestion({ number: 2 }),
      makeQuestion({ number: 3 }),
    ];
    const copy = [...questions];
    shuffleQuestions(questions);
    expect(questions).toEqual(copy);
  });

  it('returns an array of the same length', () => {
    const questions = [makeQuestion({ number: 1 }), makeQuestion({ number: 2 }), makeQuestion({ number: 3 })];
    expect(shuffleQuestions(questions)).toHaveLength(3);
  });

  it('contains the same items as the original', () => {
    const questions: Question[] = [
      makeQuestion({ number: 1, difficulty: 'easy' }),
      makeQuestion({ number: 2, difficulty: 'medium' }),
      makeQuestion({ number: 3, difficulty: 'hard' }),
    ];
    const shuffled = shuffleQuestions(questions);
    expect(shuffled).toHaveLength(questions.length);
    for (const q of questions) {
      expect(shuffled).toContainEqual(q);
    }
  });

  it('returns a new array reference', () => {
    const questions = [makeQuestion()];
    const shuffled = shuffleQuestions(questions);
    expect(shuffled).not.toBe(questions);
  });

  it('handles an empty array', () => {
    expect(shuffleQuestions([])).toEqual([]);
  });
});
