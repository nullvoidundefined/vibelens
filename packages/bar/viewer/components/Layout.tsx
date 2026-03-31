import React from 'react';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'stack', label: 'Stack Guide' },
  { key: 'technical-summary', label: 'Technical Summary' },
  { key: 'technical-overview', label: 'Technical Overview' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'review', label: 'Review' },
];

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="vl-layout">
      <header className="vl-header">
        <span className="vl-logo">VibeLens</span>
        <nav className="vl-nav">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`vl-tab ${activeTab === key ? 'vl-tab-active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="vl-main">
        <article className="vl-content">
          {children}
        </article>
      </main>
    </div>
  );
}
