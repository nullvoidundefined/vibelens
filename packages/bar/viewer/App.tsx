import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { MarkdownView } from './components/MarkdownView';
import { QuizView } from './components/QuizView';
import { useContent } from './hooks/useContent';

const CONTENT_MAP: Record<string, keyof ReturnType<typeof useContent>> = {
  summary: 'summary',
  stack: 'stack',
  'technical-summary': 'technicalSummary',
  'technical-overview': 'technicalOverview',
  quiz: 'quiz',
  review: 'review',
};

export function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const content = useContent();

  const key = CONTENT_MAP[activeTab];
  const raw = content[key];

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'quiz' ? (
        <QuizView content={raw} />
      ) : (
        <MarkdownView content={raw} />
      )}
    </Layout>
  );
}
