// @vibelens-docs alias is configured at runtime by the serve command
// Vite resolves these imports to the actual docs directory
import summaryRaw from '@vibelens-docs/summary.md?raw';
import stackRaw from '@vibelens-docs/stack.md?raw';
import technicalSummaryRaw from '@vibelens-docs/technical-summary.md?raw';
import technicalOverviewRaw from '@vibelens-docs/technical-overview.md?raw';
import quizRaw from '@vibelens-docs/quiz.md?raw';
import reviewRaw from '@vibelens-docs/review.md?raw';

export interface DocContent {
  summary: string;
  stack: string;
  technicalSummary: string;
  technicalOverview: string;
  quiz: string;
  review: string;
}

export function useContent(): DocContent {
  return {
    summary: summaryRaw,
    stack: stackRaw,
    technicalSummary: technicalSummaryRaw,
    technicalOverview: technicalOverviewRaw,
    quiz: quizRaw,
    review: reviewRaw,
  };
}
