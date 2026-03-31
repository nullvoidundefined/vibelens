import { el } from './dom.ts';
import { sortByDifficulty, getDifficultyBreakdown } from './parseQuiz.ts';
import type { Question, Difficulty } from './parseQuiz.ts';

type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'F';

const GRADES: readonly { min: number; letter: GradeLetter }[] = [
  { min: 90, letter: 'A' },
  { min: 80, letter: 'B' },
  { min: 70, letter: 'C' },
  { min: 60, letter: 'D' },
  { min: 0, letter: 'F' },
] as const;

const GRADE_COLORS: Record<GradeLetter, string> = {
  A: '#16a34a',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#dc2626',
};

const RESULT_MESSAGES: Record<GradeLetter, string> = {
  A: 'Absolutely nailed it. You know this codebase inside and out.',
  B: 'Solid work. A few gaps, but you clearly understand the architecture.',
  C: 'Not bad, but there\'s room to grow. Re-read the technical overview.',
  D: 'Barely scraping by. Time to revisit the docs.',
  F: 'Ouch. Did you even read the documentation?',
};

function getGrade(pct: number): GradeLetter {
  return GRADES.find((g) => pct >= g.min)?.letter ?? 'F';
}

export function buildQuiz(parsed: Question[], appName?: string): HTMLElement {
  const questions = sortByDifficulty(parsed);
  const root = el('div', 'vibe-lens-quiz-view');

  if (!questions.length) {
    const empty = el('div', 'vibe-lens-quiz-empty');
    empty.textContent = 'No questions found.';
    root.appendChild(empty);
    return root;
  }

  let screen: 'start' | 'quiz' | 'results' = 'start';
  let currentIndex = 0;
  let score = 0;
  let answers: Record<number, boolean> = {};

  const render = (): void => {
    root.innerHTML = '';
    if (screen === 'start') renderStart();
    else if (screen === 'quiz') renderQuestion();
    else if (screen === 'results') renderResults();
  };

  const renderStart = (): void => {
    const breakdown = getDifficultyBreakdown(questions);

    if (appName) {
      const nameEl = el('h2', 'vibe-lens-quiz-app-name');
      nameEl.textContent = appName;
      root.appendChild(nameEl);
    }

    const subtitle = el('p', 'vibe-lens-quiz-subtitle');
    subtitle.textContent = 'Test your knowledge';
    root.appendChild(subtitle);

    const stats = el('div', 'vibe-lens-quiz-stats');
    const countStat = el('div', 'vibe-lens-quiz-stat');
    const countValue = el('span', 'vibe-lens-quiz-stat-value');
    countValue.textContent = String(questions.length);
    const countLabel = el('span', 'vibe-lens-quiz-stat-label');
    countLabel.textContent = 'Questions';
    countStat.appendChild(countValue);
    countStat.appendChild(countLabel);
    stats.appendChild(countStat);

    const diffEl = el('div', 'vibe-lens-quiz-difficulty-breakdown');
    for (const [level, count] of Object.entries(breakdown) as [Difficulty, number][]) {
      if (count === 0) continue;
      const pill = el('span', `vibe-lens-quiz-diff-pill vibe-lens-quiz-diff-${level}`);
      pill.textContent = `${count} ${level.charAt(0).toUpperCase() + level.slice(1)}`;
      diffEl.appendChild(pill);
    }
    stats.appendChild(diffEl);
    root.appendChild(stats);

    const startBtn = el('button', 'vibe-lens-quiz-start-btn');
    startBtn.textContent = 'Start Quiz';
    startBtn.addEventListener('click', () => {
      screen = 'quiz';
      render();
    });
    root.appendChild(startBtn);
  };

  const renderQuestion = (): void => {
    const q = questions[currentIndex];
    if (!q) return;

    // Progress header with aria-live for screen readers
    const progressHeader = el('div', 'vibe-lens-quiz-progress-header');
    progressHeader.setAttribute('aria-live', 'polite');
    progressHeader.setAttribute('aria-atomic', 'true');
    const progressText = el('span', 'vibe-lens-quiz-progress-text');
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    const scoreText = el('span', 'vibe-lens-quiz-score-text');
    scoreText.textContent = `Score: ${score}/${Object.keys(answers).length}`;
    progressHeader.appendChild(progressText);
    progressHeader.appendChild(scoreText);
    root.appendChild(progressHeader);

    // Progress bar with ARIA
    const progressBar = el('div', 'vibe-lens-quiz-progress-bar', {
      role: 'progressbar',
      'aria-valuenow': String(currentIndex + 1),
      'aria-valuemin': '1',
      'aria-valuemax': String(questions.length),
      'aria-label': `Question ${currentIndex + 1} of ${questions.length}`,
    });
    const progressFill = el('div', 'vibe-lens-quiz-progress-fill');
    progressFill.style.width = `${(currentIndex / questions.length) * 100}%`;
    progressBar.appendChild(progressFill);
    root.appendChild(progressBar);

    // Question card with fade-in transition
    const card = el('div', 'vibe-lens-quiz-card vibe-lens-fade-in');

    const numEl = el('div', 'vibe-lens-quiz-question-num');
    numEl.textContent = `Question ${currentIndex + 1}`;
    const badge = el('span', `vibe-lens-quiz-diff-badge vibe-lens-quiz-diff-${q.difficulty}`);
    badge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
    numEl.appendChild(badge);
    card.appendChild(numEl);

    const textEl = el('p', 'vibe-lens-quiz-question-text');
    textEl.textContent = q.text;
    card.appendChild(textEl);

    if (q.clarification) {
      const clarEl = el('div', 'vibe-lens-quiz-clarification');
      const icon = el('span', 'vibe-lens-quiz-clarification-icon');
      icon.textContent = '?';
      clarEl.appendChild(icon);
      clarEl.appendChild(document.createTextNode(q.clarification));
      card.appendChild(clarEl);
    }

    const optionsEl = el('div', 'vibe-lens-quiz-options');
    let answered = false;

    const buttons: HTMLElement[] = q.options.map((option, i) => {
      if (!option || typeof option !== 'string') return null;
      const btn = el('button', 'vibe-lens-quiz-option');
      btn.textContent = option;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const isCorrect = i === q.correctIndex;
        answers[currentIndex] = isCorrect;
        if (isCorrect) score++;

        card.classList.add(isCorrect ? 'vibe-lens-correct' : 'vibe-lens-incorrect');

        buttons.forEach((b, j) => {
          if (!b) return;
          (b as HTMLButtonElement).disabled = true;
          if (j === q.correctIndex) {
            b.className = 'vibe-lens-quiz-option vibe-lens-option-correct';
          } else if (j === i && !isCorrect) {
            b.className = 'vibe-lens-quiz-option vibe-lens-option-wrong';
          } else {
            b.className = 'vibe-lens-quiz-option vibe-lens-option-dim';
          }
        });

        scoreText.textContent = `Score: ${score}/${Object.keys(answers).length}`;
        progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
        progressBar.setAttribute('aria-valuenow', String(currentIndex + 1));

        if (q.explanation) {
          const explEl = el('div', 'vibe-lens-quiz-explanation');
          explEl.textContent = q.explanation;
          card.appendChild(explEl);
        }

        const isLast = currentIndex === questions.length - 1;
        const nextBtn = el('button', 'vibe-lens-quiz-next-btn');
        nextBtn.textContent = isLast ? 'See Results' : 'Next Question';
        nextBtn.addEventListener('click', () => {
          if (isLast) {
            screen = 'results';
          } else {
            currentIndex++;
          }
          render();
        });
        card.appendChild(nextBtn);
      });
      return btn;
    }).filter((btn): btn is HTMLElement => btn !== null);

    buttons.forEach((btn) => optionsEl.appendChild(btn));
    card.appendChild(optionsEl);
    root.appendChild(card);
  };

  const renderResults = (): void => {
    const correct = Object.values(answers).filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade = getGrade(pct);

    const container = el('div', 'vibe-lens-quiz-results vibe-lens-fade-in');

    if (appName) {
      const nameEl = el('h2', 'vibe-lens-quiz-app-name');
      nameEl.textContent = appName;
      container.appendChild(nameEl);
    }

    const title = el('h3', 'vibe-lens-quiz-results-title');
    title.textContent = 'Quiz Complete';
    container.appendChild(title);

    const gradeEl = el('div', 'vibe-lens-quiz-grade');
    gradeEl.textContent = grade;
    gradeEl.style.color = GRADE_COLORS[grade] || '#3b82f6';
    container.appendChild(gradeEl);

    const scoreEl = el('div', 'vibe-lens-quiz-score');
    scoreEl.textContent = `${correct} / ${questions.length}`;
    container.appendChild(scoreEl);

    const pctEl = el('div', 'vibe-lens-quiz-pct');
    pctEl.textContent = `${pct}%`;
    container.appendChild(pctEl);

    const msgEl = el('div', 'vibe-lens-quiz-result-message');
    msgEl.textContent = RESULT_MESSAGES[grade] || '';
    container.appendChild(msgEl);

    const retakeBtn = el('button', 'vibe-lens-quiz-start-btn');
    retakeBtn.textContent = 'Retake Quiz';
    retakeBtn.addEventListener('click', () => {
      screen = 'start';
      currentIndex = 0;
      score = 0;
      answers = {};
      render();
    });
    container.appendChild(retakeBtn);

    root.appendChild(container);
  };

  render();
  return root;
}
