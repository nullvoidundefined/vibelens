import React, { useState, useCallback } from 'react';

interface Question {
  number: number;
  text: string;
  options: string[];
  correctIndex: number;
  clarification: string | null;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Inline parser — same logic as core/parseQuiz.ts but avoids import path issues
function parseQuiz(markdown: string): Question[] {
  const questions: Question[] = [];
  const blocks = markdown.split(/\n(?=\*\*\d+\.)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const questionMatch = trimmed.match(/^\*\*(\d+)\.\s+([\s\S]+?)\*\*/);
    if (!questionMatch) continue;

    const number = parseInt(questionMatch[1], 10);
    const text = questionMatch[2].trim();

    const options: string[] = [];
    let correctIndex = -1;
    const optionLines = trimmed.match(/^- (\*\*)?([A-D]\)[\s\S]+?)(\*\*)?$/gm) || [];

    for (let i = 0; i < optionLines.length; i++) {
      const line = optionLines[i];
      const isBold = /^- \*\*/.test(line);
      const optionText = line.replace(/^- \*\*/, '').replace(/\*\*$/, '').replace(/^- /, '').trim();
      options.push(optionText);
      if (isBold) correctIndex = i;
    }

    const clarificationLines = (trimmed.match(/^\? .+$/gm) || []).map((l) => l.replace(/^\? /, '').trim());
    const clarification = clarificationLines.length > 0 ? clarificationLines.join(' ') : null;

    const explanationLines = (trimmed.match(/^> .+$/gm) || []).map((l) => l.replace(/^> /, '').trim());
    const explanation = explanationLines.length > 0 ? explanationLines.join(' ') : null;

    const difficultyMatch = trimmed.match(/^@ ?(easy|medium|hard)$/im);
    const difficulty = (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium') as Question['difficulty'];

    if (options.length >= 2 && correctIndex >= 0) {
      questions.push({ number, text, options, correctIndex, clarification, explanation, difficulty });
    }
  }

  return questions;
}

function sortByDifficulty(questions: Question[]): Question[] {
  const order = { easy: 0, medium: 1, hard: 2 };
  return [...questions].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
}

function getGrade(pct: number): string {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

function getResultMessage(pct: number): string {
  if (pct >= 90) return "You really know your stuff! You could explain this project to someone else.";
  if (pct >= 70) return "Solid understanding! A few gaps to fill — check the explanations for the ones you missed.";
  if (pct >= 50) return "You're getting there! Re-read the Stack Guide and Technical Summary to fill in the gaps.";
  return "Looks like there's a lot to learn here — and that's totally fine! Start with the Stack Guide and work your way through.";
}

const GRADE_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#3b82f6', C: '#eab308', D: '#f97316', F: '#dc2626',
};

const DIFF_COLORS: Record<string, string> = {
  easy: '#16a34a', medium: '#d97706', hard: '#dc2626',
};

interface QuizViewProps {
  content: string;
}

export function QuizView({ content }: QuizViewProps) {
  const allQuestions = sortByDifficulty(parseQuiz(content));
  const [screen, setScreen] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const q = allQuestions[currentIndex];

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !q) return;
    setSelectedId(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }, [answered, q]);

  const handleNext = useCallback(() => {
    if (currentIndex >= allQuestions.length - 1) {
      setScreen('results');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  }, [currentIndex, allQuestions.length]);

  const handleRestart = useCallback(() => {
    setScreen('start');
    setCurrentIndex(0);
    setScore(0);
    setSelectedId(null);
    setAnswered(false);
  }, []);

  if (!allQuestions.length) {
    return <div className="vl-quiz-empty">No quiz questions found.</div>;
  }

  // Start screen
  if (screen === 'start') {
    const easy = allQuestions.filter((q) => q.difficulty === 'easy').length;
    const medium = allQuestions.filter((q) => q.difficulty === 'medium').length;
    const hard = allQuestions.filter((q) => q.difficulty === 'hard').length;

    return (
      <div className="vl-quiz-start">
        <h2>Test Your Knowledge</h2>
        <div className="vl-quiz-stat">{allQuestions.length} questions</div>
        <div className="vl-quiz-diff-row">
          {easy > 0 && <span className="vl-quiz-diff-pill" style={{ borderColor: DIFF_COLORS.easy, color: DIFF_COLORS.easy }}>{easy} Easy</span>}
          {medium > 0 && <span className="vl-quiz-diff-pill" style={{ borderColor: DIFF_COLORS.medium, color: DIFF_COLORS.medium }}>{medium} Medium</span>}
          {hard > 0 && <span className="vl-quiz-diff-pill" style={{ borderColor: DIFF_COLORS.hard, color: DIFF_COLORS.hard }}>{hard} Hard</span>}
        </div>
        <button className="vl-quiz-btn" onClick={() => setScreen('quiz')}>Start Quiz</button>
      </div>
    );
  }

  // Results screen
  if (screen === 'results') {
    const pct = Math.round((score / allQuestions.length) * 100);
    const grade = getGrade(pct);

    return (
      <div className="vl-quiz-start">
        <h2>Quiz Complete</h2>
        <div className="vl-quiz-grade" style={{ color: GRADE_COLORS[grade] }}>{grade}</div>
        <div className="vl-quiz-score-line">{score} / {allQuestions.length} correct ({pct}%)</div>
        <p className="vl-quiz-message">{getResultMessage(pct)}</p>
        <button className="vl-quiz-btn" onClick={handleRestart}>Retake Quiz</button>
      </div>
    );
  }

  // Quiz screen
  const isLast = currentIndex >= allQuestions.length - 1;

  return (
    <div>
      <div className="vl-quiz-progress-row">
        <span>Question {currentIndex + 1} of {allQuestions.length}</span>
        <span>Score: {score}/{currentIndex + (answered ? 1 : 0)}</span>
      </div>
      <div className="vl-quiz-progress-bar">
        <div className="vl-quiz-progress-fill" style={{ width: `${((currentIndex + (answered ? 1 : 0)) / allQuestions.length) * 100}%` }} />
      </div>

      <div className="vl-quiz-card">
        <div className="vl-quiz-qnum">
          Question {currentIndex + 1}
          <span className="vl-quiz-diff-badge" style={{ borderColor: DIFF_COLORS[q.difficulty], color: DIFF_COLORS[q.difficulty] }}>
            {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
          </span>
        </div>
        <p className="vl-quiz-qtext">{q.text}</p>

        {q.clarification && (
          <div className="vl-quiz-clarification">{q.clarification}</div>
        )}

        <div className="vl-quiz-options">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selectedId;
            let cls = 'vl-quiz-option';
            if (answered) {
              if (isCorrect) cls += ' vl-quiz-option-correct';
              else if (isSelected) cls += ' vl-quiz-option-wrong';
              else cls += ' vl-quiz-option-dim';
            }
            return (
              <button key={i} className={cls} disabled={answered} onClick={() => handleAnswer(i)}>
                {opt}
                {answered && isCorrect && ' \u2713'}
                {answered && isSelected && !isCorrect && ' \u2717'}
              </button>
            );
          })}
        </div>

        {answered && q.explanation && (
          <div className="vl-quiz-explanation">{q.explanation}</div>
        )}

        {answered && (
          <button className="vl-quiz-btn vl-quiz-next-btn" onClick={handleNext}>
            {isLast ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
