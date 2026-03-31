import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildGenerateUI, buildPromptUI } from '../../src/core/PromptUI.ts';
import { PROMPTS, COMBINED_PROMPT } from '../../src/core/prompts.ts';
import type { NavLink } from '../../src/core/VibeLens.ts';

// ---------------------------------------------------------------------------
// Mock clipboard
// ---------------------------------------------------------------------------

const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
Object.assign(navigator, { clipboard: mockClipboard });

const NAV_LINKS: NavLink[] = [
  { key: 'summary', label: 'Summary', file: 'summary.md' },
  { key: 'stack', label: 'Stack Guide', file: 'stack.md' },
  { key: 'technical-summary', label: 'Technical Summary', file: 'technical-summary.md' },
  { key: 'technical-overview', label: 'Technical Overview', file: 'technical-overview.md' },
  { key: 'quiz', label: 'Quiz', file: 'quiz.md' },
  { key: 'review', label: 'Review', file: 'review.md' },
];

const BASE_PATH = '/.vibelens/docs';

// ---------------------------------------------------------------------------
// buildGenerateUI
// ---------------------------------------------------------------------------

describe('buildGenerateUI', () => {
  beforeEach(() => {
    mockClipboard.writeText.mockReset();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('step 1 is visible initially', () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const steps = wrapper.querySelectorAll('.vibe-lens-prompt-step');
    expect(steps.length).toBeGreaterThanOrEqual(2);
    const step1 = steps[0] as HTMLElement;
    expect(step1.style.display).not.toBe('none');
  });

  it('step 2 is hidden initially', () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const steps = wrapper.querySelectorAll('.vibe-lens-prompt-step');
    const step2 = steps[1] as HTMLElement;
    expect(step2.style.display).toBe('none');
  });

  it('shows "Let\'s learn about your project" title', () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const titles = wrapper.querySelectorAll('.vibe-lens-prompt-title');
    const firstTitle = titles[0];
    expect(firstTitle?.textContent).toBe("Let's learn about your project");
  });

  it('shows a file list with all 6 files', () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const fileItems = wrapper.querySelectorAll('.vibe-lens-prompt-file-item');
    expect(fileItems).toHaveLength(6);
    const fileNames = Array.from(fileItems).map((el) => el.textContent);
    expect(fileNames).toContain('summary.md');
    expect(fileNames).toContain('stack.md');
    expect(fileNames).toContain('quiz.md');
    expect(fileNames).toContain('review.md');
  });

  it('clicking "Copy Prompt" calls clipboard.writeText with COMBINED_PROMPT', async () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    expect(copyBtn?.textContent).toBe('Copy Prompt');

    copyBtn.click();
    // Allow the promise to resolve
    await vi.waitFor(() => expect(mockClipboard.writeText).toHaveBeenCalledOnce());
    expect(mockClipboard.writeText).toHaveBeenCalledWith(COMBINED_PROMPT);
  });

  it('after copy: step 1 hidden, step 2 visible', async () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const steps = wrapper.querySelectorAll('.vibe-lens-prompt-step');
    const step1 = steps[0] as HTMLElement;
    const step2 = steps[1] as HTMLElement;

    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();

    await vi.waitFor(() => expect(step1.style.display).toBe('none'));
    expect(step2.style.display).toBe('block');
  });

  it('step 2 shows Claude Code in the tool list', async () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();
    await vi.waitFor(() => mockClipboard.writeText.mock.calls.length > 0);

    const toolItems = wrapper.querySelectorAll('.vibe-lens-prompt-tool-item');
    const toolNames = Array.from(toolItems).map((el) => el.textContent);
    expect(toolNames).toContain('Claude Code');
  });

  it('step 2 shows Cursor in the tool list', async () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();
    await vi.waitFor(() => mockClipboard.writeText.mock.calls.length > 0);

    const toolItems = wrapper.querySelectorAll('.vibe-lens-prompt-tool-item');
    const toolNames = Array.from(toolItems).map((el) => el.textContent);
    expect(toolNames).toContain('Cursor');
  });

  it('step 2 shows a privacy warning', async () => {
    const wrapper = buildGenerateUI(BASE_PATH, NAV_LINKS);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();
    await vi.waitFor(() => mockClipboard.writeText.mock.calls.length > 0);

    const warning = wrapper.querySelector('.vibe-lens-prompt-warning');
    expect(warning).toBeTruthy();
    expect(warning?.textContent).toContain('VibeLens does not access');
  });
});

// ---------------------------------------------------------------------------
// buildPromptUI
// ---------------------------------------------------------------------------

describe('buildPromptUI', () => {
  beforeEach(() => {
    mockClipboard.writeText.mockReset();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('reason="missing" → title "Document not generated yet"', () => {
    const wrapper = buildPromptUI('summary', 'missing', 'summary.md', BASE_PATH);
    const title = wrapper.querySelector('.vibe-lens-prompt-title');
    expect(title?.textContent).toBe('Document not generated yet');
  });

  it('reason="unversioned" → title "Document needs to be regenerated"', () => {
    const wrapper = buildPromptUI('summary', 'unversioned', 'summary.md', BASE_PATH);
    const title = wrapper.querySelector('.vibe-lens-prompt-title');
    expect(title?.textContent).toBe('Document needs to be regenerated');
  });

  it('reason="outdated" → title "Document is outdated"', () => {
    const wrapper = buildPromptUI('summary', 'outdated', 'summary.md', BASE_PATH);
    const title = wrapper.querySelector('.vibe-lens-prompt-title');
    expect(title?.textContent).toBe('Document is outdated');
  });

  it('shows the file path in a code element', () => {
    const wrapper = buildPromptUI('summary', 'missing', 'summary.md', BASE_PATH);
    const code = wrapper.querySelector('code');
    expect(code).toBeTruthy();
    expect(code?.textContent).toContain('summary.md');
  });

  it('copy button calls clipboard.writeText with the correct prompt for the key', async () => {
    const key = 'summary';
    const wrapper = buildPromptUI(key, 'missing', 'summary.md', BASE_PATH);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();

    await vi.waitFor(() => expect(mockClipboard.writeText).toHaveBeenCalledOnce());
    expect(mockClipboard.writeText).toHaveBeenCalledWith(PROMPTS[key]);
  });

  it('copy button uses the correct prompt for "quiz" key', async () => {
    const key = 'quiz';
    const wrapper = buildPromptUI(key, 'missing', 'quiz.md', BASE_PATH);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn') as HTMLButtonElement;
    copyBtn.click();

    await vi.waitFor(() => expect(mockClipboard.writeText).toHaveBeenCalledOnce());
    expect(mockClipboard.writeText).toHaveBeenCalledWith(PROMPTS[key]);
  });

  it('copy button copy has initial text "Copy Prompt"', () => {
    const wrapper = buildPromptUI('summary', 'missing', 'summary.md', BASE_PATH);
    const copyBtn = wrapper.querySelector('.vibe-lens-prompt-copy-btn');
    expect(copyBtn?.textContent).toBe('Copy Prompt');
  });

  it('shows description mentioning the file name for reason="missing"', () => {
    const wrapper = buildPromptUI('summary', 'missing', 'summary.md', BASE_PATH);
    const desc = wrapper.querySelector('.vibe-lens-prompt-desc');
    expect(desc?.textContent).toContain('summary.md');
  });
});
