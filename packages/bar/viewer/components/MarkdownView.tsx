import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

// Custom heading renderer that adds severity badge styling
function HeadingRenderer({ level, children, ...props }: any) {
  const text = String(children);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // Detect severity badges in h3 headings (e.g., "### Title — CRITICAL")
  if (level === 3) {
    const severityMatch = text.match(/\b(CRITICAL|HIGH|MEDIUM|LOW|INFO)\b/);
    if (severityMatch) {
      const severity = severityMatch[1];
      const badgeClass = `vl-severity-${severity.toLowerCase()}`;
      const parts = text.split(severity);
      return (
        <Tag {...props}>
          {parts[0]}
          <span className={`vl-severity-badge ${badgeClass}`}>{severity}</span>
          {parts[1]}
        </Tag>
      );
    }
  }

  return <Tag {...props}>{children}</Tag>;
}

export function MarkdownView({ content }: MarkdownViewProps) {
  // Strip the version stamp comment from display
  const cleaned = content.replace(/^<!--.*?-->\n?/, '');

  return (
    <div className="vl-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <HeadingRenderer level={1} {...props} />,
          h2: (props) => <HeadingRenderer level={2} {...props} />,
          h3: (props) => <HeadingRenderer level={3} {...props} />,
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
        }}
      >
        {cleaned}
      </Markdown>
    </div>
  );
}
