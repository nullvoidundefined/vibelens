import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../../src/core/markdown.ts';

// ---------------------------------------------------------------------------
// Headings
// ---------------------------------------------------------------------------

describe('markdownToHtml – headings', () => {
  it('renders # as h1 with id', () => {
    const result = markdownToHtml('# Hello World');
    expect(result).toContain('<h1 id="hello-world">Hello World</h1>');
  });

  it('renders ## as h2 with id', () => {
    const result = markdownToHtml('## Section Title');
    expect(result).toContain('<h2 id="section-title">Section Title</h2>');
  });

  it('renders ### as h3 with id', () => {
    const result = markdownToHtml('### Sub Section');
    expect(result).toContain('<h3 id="sub-section">Sub Section</h3>');
  });

  it('slugifies heading id (lowercases, replaces non-word chars with dash)', () => {
    const result = markdownToHtml('# Hello, World!');
    expect(result).toContain('id="hello-world"');
  });
});

// ---------------------------------------------------------------------------
// h3 severity badges
// ---------------------------------------------------------------------------

describe('markdownToHtml – h3 severity badges', () => {
  it('renders CRITICAL badge inside h3', () => {
    const result = markdownToHtml('### Title — CRITICAL');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-critical">CRITICAL</span>');
  });

  it('renders HIGH badge inside h3', () => {
    const result = markdownToHtml('### Finding — HIGH');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-high">HIGH</span>');
  });

  it('renders MEDIUM badge inside h3', () => {
    const result = markdownToHtml('### Note — MEDIUM');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-medium">MEDIUM</span>');
  });

  it('renders LOW badge inside h3', () => {
    const result = markdownToHtml('### Issue — LOW');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-low">LOW</span>');
  });

  it('renders INFO badge inside h3', () => {
    const result = markdownToHtml('### Observation — INFO');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-info">INFO</span>');
  });

  it('does not add badge for unknown severity keyword', () => {
    const result = markdownToHtml('### Title — UNKNOWN');
    expect(result).not.toContain('vibe-lens-severity-badge');
  });
});

// ---------------------------------------------------------------------------
// Code blocks
// ---------------------------------------------------------------------------

describe('markdownToHtml – code blocks', () => {
  it('renders fenced code block with language class', () => {
    const result = markdownToHtml('```typescript\nconst x = 1;\n```');
    expect(result).toContain('<pre><code class="language-typescript">');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('</code></pre>');
  });

  it('escapes HTML inside code blocks', () => {
    const result = markdownToHtml('```html\n<div>&amp;</div>\n```');
    expect(result).toContain('&lt;div&gt;');
    expect(result).toContain('&amp;amp;');
  });

  it('renders fenced code block without language', () => {
    const result = markdownToHtml('```\nplain code\n```');
    expect(result).toContain('<pre><code class="language-">');
  });
});

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

describe('markdownToHtml – tables', () => {
  it('renders a pipe-delimited table with header separator', () => {
    const md = `| Name | Age |
| --- | --- |
| Alice | 30 |
| Bob | 25 |`;

    const result = markdownToHtml(md);
    expect(result).toContain('<table>');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');
    expect(result).toContain('<th>Name</th>');
    expect(result).toContain('<th>Age</th>');
    expect(result).toContain('<td>Alice</td>');
    expect(result).toContain('<td>30</td>');
    expect(result).toContain('<td>Bob</td>');
    expect(result).toContain('<td>25</td>');
  });

  it('does not include separator row as a data row', () => {
    const md = `| A | B |
| --- | --- |
| 1 | 2 |`;
    const result = markdownToHtml(md);
    expect(result).not.toContain('<td>---</td>');
  });
});

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

describe('markdownToHtml – links', () => {
  it('renders external links with target="_blank"', () => {
    const result = markdownToHtml('[OpenAI](https://openai.com)');
    expect(result).toContain('href="https://openai.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('renders anchor links with vibe-lens-anchor-link class', () => {
    const result = markdownToHtml('[Go to section](#section)');
    expect(result).toContain('href="#section"');
    expect(result).toContain('class="vibe-lens-anchor-link"');
  });

  it('strips javascript: links to plain text', () => {
    const result = markdownToHtml('[click me](javascript:alert(1))');
    expect(result).not.toContain('href=');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click me');
  });

  it('strips data: links to plain text', () => {
    const result = markdownToHtml('[data](data:text/html,<h1>hi</h1>)');
    expect(result).not.toContain('href=');
    expect(result).not.toContain('data:text');
    expect(result).toContain('data');
  });

  it('strips whitespace-bypass javascript: attack (\\njavascript:)', () => {
    const result = markdownToHtml('[xss](\njavascript:alert(1))');
    expect(result).not.toContain('href=');
    expect(result).toContain('xss');
  });
});

// ---------------------------------------------------------------------------
// Bold
// ---------------------------------------------------------------------------

describe('markdownToHtml – bold', () => {
  it('renders **text** as <strong>', () => {
    const result = markdownToHtml('**bold text**');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('renders severity keyword inside bold as a badge', () => {
    const result = markdownToHtml('**CRITICAL issue**');
    expect(result).toContain('<strong>');
    expect(result).toContain('<span class="vibe-lens-severity-badge vibe-lens-severity-critical">CRITICAL</span>');
  });
});

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

describe('markdownToHtml – lists', () => {
  it('renders unordered list items', () => {
    const result = markdownToHtml('- Item one\n- Item two\n- Item three');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item one</li>');
    expect(result).toContain('<li>Item two</li>');
    expect(result).toContain('<li>Item three</li>');
    expect(result).toContain('</ul>');
  });

  it('renders ordered list items', () => {
    const result = markdownToHtml('1. First\n2. Second\n3. Third');
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>First</li>');
    expect(result).toContain('<li>Second</li>');
    expect(result).toContain('<li>Third</li>');
    expect(result).toContain('</ol>');
  });
});

// ---------------------------------------------------------------------------
// Blockquotes
// ---------------------------------------------------------------------------

describe('markdownToHtml – blockquotes', () => {
  it('renders > as <blockquote>', () => {
    const result = markdownToHtml('> This is a quote');
    expect(result).toContain('<blockquote>This is a quote</blockquote>');
  });
});

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

describe('markdownToHtml – images', () => {
  it('renders ![alt](src) as <img>', () => {
    const result = markdownToHtml('![A cat](https://example.com/cat.png)');
    expect(result).toContain('<img alt="A cat" src="https://example.com/cat.png">');
  });

  it('renders image with empty alt text', () => {
    const result = markdownToHtml('![](https://example.com/img.png)');
    expect(result).toContain('<img alt="" src="https://example.com/img.png">');
  });
});

// ---------------------------------------------------------------------------
// Inline code
// ---------------------------------------------------------------------------

describe('markdownToHtml – inline code', () => {
  it('renders `code` as <code>', () => {
    const result = markdownToHtml('Use `const` keyword');
    expect(result).toContain('<code>const</code>');
  });
});

// ---------------------------------------------------------------------------
// Paragraphs
// ---------------------------------------------------------------------------

describe('markdownToHtml – paragraphs', () => {
  it('wraps plain text in <p> tags', () => {
    const result = markdownToHtml('Just some plain text here.');
    expect(result).toContain('<p>Just some plain text here.</p>');
  });

  it('does not double-wrap headings in <p>', () => {
    const result = markdownToHtml('# My Heading');
    expect(result).not.toContain('<p><h1');
  });
});

// ---------------------------------------------------------------------------
// Horizontal rule
// ---------------------------------------------------------------------------

describe('markdownToHtml – horizontal rule', () => {
  it('renders --- as <hr>', () => {
    const result = markdownToHtml('---');
    expect(result).toContain('<hr>');
  });
});

// ---------------------------------------------------------------------------
// Italic
// ---------------------------------------------------------------------------

describe('markdownToHtml – italic', () => {
  it('renders *text* as <em>', () => {
    const result = markdownToHtml('*italic text*');
    expect(result).toContain('<em>italic text</em>');
  });
});
