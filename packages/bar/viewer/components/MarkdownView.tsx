import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
}

// Custom heading renderer that adds severity badge styling and id attributes
function HeadingRenderer({ level, children, ...props }: any) {
  const text = String(children);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const id = slugify(text);

  // Detect severity badges in h3 headings (e.g., "### Title — CRITICAL")
  if (level === 3) {
    const severityMatch = text.match(/\b(CRITICAL|HIGH|MEDIUM|LOW|INFO)\b/);
    if (severityMatch) {
      const severity = severityMatch[1];
      const badgeClass = `vl-severity-${severity.toLowerCase()}`;
      const parts = text.split(severity);
      return (
        <Tag id={id} {...props}>
          {parts[0]}
          <span className={`vl-severity-badge ${badgeClass}`}>{severity}</span>
          {parts[1]}
        </Tag>
      );
    }
  }

  return <Tag id={id} {...props}>{children}</Tag>;
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
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const id = href.slice(1);
                    const target = document.getElementById(id);
                    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {cleaned}
      </Markdown>
    </div>
  );
}
