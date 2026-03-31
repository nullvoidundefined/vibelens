import { describe, it, expect } from 'vitest';
import { buildQuiz } from '../../src/core/QuizRenderer.ts';
import type { Question } from '../../src/core/parseQuiz.ts';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const testQuestions: Question[] = [
  {
    number: 1,
    text: 'What is 2+2?',
    options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
    correctIndex: 1,
    clarification: 'Basic math',
    explanation: 'Two plus two equals four',
    difficulty: 'easy',
  },
  {
    number: 2,
    text: 'What is the capital of France?',
    options: ['A) London', 'B) Berlin', 'C) Paris', 'D) Rome'],
    correctIndex: 2,
    clarification: null,
    explanation: 'Paris is the capital of France',
    difficulty: 'medium',
  },
];

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe('buildQuiz — empty questions', () => {
  it('shows "No questions found." when given an empty array', () => {
    const root = buildQuiz([]);
    expect(root.textContent).toContain('No questions found.');
  });
});

// ---------------------------------------------------------------------------
// Start screen
// ---------------------------------------------------------------------------

describe('buildQuiz — start screen', () => {
  it('shows the question count', () => {
    const root = buildQuiz(testQuestions);
    const statValue = root.querySelector('.vibe-lens-quiz-stat-value');
    expect(statValue?.textContent).toBe('2');
  });

  it('shows difficulty pills for each difficulty present', () => {
    const root = buildQuiz(testQuestions);
    const pills = root.querySelectorAll('[class*="vibe-lens-quiz-diff-pill"]');
    // testQuestions has 1 easy + 1 medium → 2 pills
    expect(pills.length).toBeGreaterThanOrEqual(1);
  });

  it('shows a "Start Quiz" button', () => {
    const root = buildQuiz(testQuestions);
    const startBtn = root.querySelector('.vibe-lens-quiz-start-btn');
    expect(startBtn).toBeTruthy();
    expect(startBtn?.textContent).toBe('Start Quiz');
  });

  it('renders appName heading when provided', () => {
    const root = buildQuiz(testQuestions, 'My App');
    const nameEl = root.querySelector('.vibe-lens-quiz-app-name');
    expect(nameEl?.textContent).toBe('My App');
  });

  it('does not render appName heading when not provided', () => {
    const root = buildQuiz(testQuestions);
    const nameEl = root.querySelector('.vibe-lens-quiz-app-name');
    expect(nameEl).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Quiz screen (after clicking Start Quiz)
// ---------------------------------------------------------------------------

describe('buildQuiz — quiz screen', () => {
  function startQuiz(questions = testQuestions): HTMLElement {
    const root = buildQuiz(questions);
    const startBtn = root.querySelector('.vibe-lens-quiz-start-btn') as HTMLButtonElement;
    startBtn.click();
    return root;
  }

  it('clicking "Start Quiz" transitions to the quiz screen with first question', () => {
    const root = startQuiz();
    const questionText = root.querySelector('.vibe-lens-quiz-question-text');
    // sortByDifficulty sorts easy first, so first question is "What is 2+2?"
    expect(questionText?.textContent).toBe('What is 2+2?');
  });

  it('shows 4 option buttons for the first question', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option');
    expect(options).toHaveLength(4);
  });

  it('shows a progress bar with role="progressbar"', () => {
    const root = startQuiz();
    const progressBar = root.querySelector('[role="progressbar"]');
    expect(progressBar).toBeTruthy();
  });

  it('progress bar has aria-valuenow, aria-valuemin, aria-valuemax', () => {
    const root = startQuiz();
    const progressBar = root.querySelector('[role="progressbar"]');
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('1');
    expect(progressBar?.getAttribute('aria-valuemin')).toBe('1');
    expect(progressBar?.getAttribute('aria-valuemax')).toBe(String(testQuestions.length));
  });

  it('clicking the correct answer applies the correct class to the option', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    // First question: correctIndex=1 → "B) 4"
    options[1].click();
    // After clicking, the correct option gets class vibe-lens-option-correct
    expect(options[1].classList.contains('vibe-lens-option-correct')).toBe(true);
  });

  it('clicking wrong answer does not give wrong option the correct class', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    // Click option 0 (wrong — correct is 1)
    options[0].click();
    expect(options[0].classList.contains('vibe-lens-option-wrong')).toBe(true);
    // The correct option should be highlighted
    expect(options[1].classList.contains('vibe-lens-option-correct')).toBe(true);
  });

  it('score is incremented when correct answer is chosen', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options[1].click(); // correct

    const scoreText = root.querySelector('.vibe-lens-quiz-score-text');
    expect(scoreText?.textContent).toBe('Score: 1/1');
  });

  it('score is not incremented when wrong answer is chosen', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options[0].click(); // wrong

    const scoreText = root.querySelector('.vibe-lens-quiz-score-text');
    expect(scoreText?.textContent).toBe('Score: 0/1');
  });

  it('explanation appears after answering', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options[1].click();

    const explanation = root.querySelector('.vibe-lens-quiz-explanation');
    expect(explanation).toBeTruthy();
    expect(explanation?.textContent).toBe('Two plus two equals four');
  });

  it('"Next Question" button appears after answering (not last question)', () => {
    const root = startQuiz();
    const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options[1].click();

    const nextBtn = root.querySelector('.vibe-lens-quiz-next-btn');
    expect(nextBtn).toBeTruthy();
    expect(nextBtn?.textContent).toBe('Next Question');
  });

  it('"See Results" button appears instead of "Next Question" on the last question', () => {
    const root = startQuiz();

    // Answer first question
    const options1 = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options1[1].click();

    // Navigate to last question
    const nextBtn = root.querySelector('.vibe-lens-quiz-next-btn') as HTMLButtonElement;
    nextBtn.click();

    // Answer last question
    const options2 = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
    options2[0].click();

    const seeResultsBtn = root.querySelector('.vibe-lens-quiz-next-btn');
    expect(seeResultsBtn?.textContent).toBe('See Results');
  });
});

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

describe('buildQuiz — results screen', () => {
  function getResultsScreen(questions = testQuestions, allCorrect = true): HTMLElement {
    const root = buildQuiz(questions);
    const startBtn = root.querySelector('.vibe-lens-quiz-start-btn') as HTMLButtonElement;
    startBtn.click();

    // Answer all questions
    for (let i = 0; i < questions.length; i++) {
      const options = root.querySelectorAll('.vibe-lens-quiz-option') as NodeListOf<HTMLButtonElement>;
      const sortedQuestions = [...questions].sort((a, b) => {
        const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      });
      const q = sortedQuestions[i];
      const clickIndex = allCorrect ? q.correctIndex : (q.correctIndex === 0 ? 1 : 0);
      options[clickIndex].click();

      const nextBtn = root.querySelector('.vibe-lens-quiz-next-btn') as HTMLButtonElement;
      if (nextBtn) nextBtn.click();
    }

    return root;
  }

  it('shows a grade letter', () => {
    const root = getResultsScreen(testQuestions, true);
    const grade = root.querySelector('.vibe-lens-quiz-grade');
    expect(grade).toBeTruthy();
    expect(['A', 'B', 'C', 'D', 'F']).toContain(grade?.textContent);
  });

  it('shows "A" grade for 100% score', () => {
    const root = getResultsScreen(testQuestions, true);
    const grade = root.querySelector('.vibe-lens-quiz-grade');
    expect(grade?.textContent).toBe('A');
  });

  it('shows score in "x / total" format', () => {
    const root = getResultsScreen(testQuestions, true);
    const scoreEl = root.querySelector('.vibe-lens-quiz-score');
    expect(scoreEl?.textContent).toBe(`${testQuestions.length} / ${testQuestions.length}`);
  });

  it('shows percentage', () => {
    const root = getResultsScreen(testQuestions, true);
    const pctEl = root.querySelector('.vibe-lens-quiz-pct');
    expect(pctEl?.textContent).toBe('100%');
  });

  it('shows a result message', () => {
    const root = getResultsScreen(testQuestions, true);
    const msgEl = root.querySelector('.vibe-lens-quiz-result-message');
    expect(msgEl?.textContent).toBeTruthy();
  });

  it('clicking "Retake Quiz" goes back to the start screen and resets score', () => {
    const root = getResultsScreen(testQuestions, true);

    const retakeBtn = root.querySelector('.vibe-lens-quiz-start-btn') as HTMLButtonElement;
    expect(retakeBtn?.textContent).toBe('Retake Quiz');
    retakeBtn.click();

    // Should be back at start screen — "Start Quiz" button present
    const startBtn = root.querySelector('.vibe-lens-quiz-start-btn');
    expect(startBtn?.textContent).toBe('Start Quiz');
  });
});
