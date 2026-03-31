import DOMPurify from 'dompurify';
import { el } from './dom.ts';
import { PROMPTS, COMBINED_PROMPT } from './prompts.ts';
import type { NavLink } from './VibeLens.ts';

type PromptReason = 'missing' | 'unversioned' | 'outdated';

export function buildGenerateUI(basePath: string, navLinks: NavLink[]): HTMLElement {
  const wrapper = el('div', 'vibe-lens-prompt-view');

  // --- Step 1: Copy the prompt ---
  const step1 = el('div', 'vibe-lens-prompt-step');

  const header = el('div', 'vibe-lens-prompt-header');
  const title = el('h3', 'vibe-lens-prompt-title');
  title.textContent = 'Let\'s learn about your project';
  header.appendChild(title);

  const desc = el('p', 'vibe-lens-prompt-desc');
  desc.textContent = 'Copy this prompt and paste it into an AI tool that can read your codebase — like Claude Code, Cursor, Windsurf, GitHub Copilot, or ChatGPT with file uploads.';
  header.appendChild(desc);
  step1.appendChild(header);

  const pathInfo = el('div', 'vibe-lens-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `It'll generate these files in <code>${basePath}/</code>`
  );
  step1.appendChild(pathInfo);

  const fileList = el('div', 'vibe-lens-prompt-file-list');
  for (const { file } of navLinks) {
    const fileEl = el('code', 'vibe-lens-prompt-file-item');
    fileEl.textContent = file;
    fileList.appendChild(fileEl);
  }
  step1.appendChild(fileList);

  const copyBtn = el('button', 'vibe-lens-prompt-copy-btn');
  copyBtn.textContent = 'Copy Prompt';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(COMBINED_PROMPT).then(() => {
      // Transition to step 2
      step1.style.display = 'none';
      step2.style.display = 'block';
    });
  });
  step1.appendChild(copyBtn);

  wrapper.appendChild(step1);

  // --- Step 2: Paste into your AI tool ---
  const step2 = el('div', 'vibe-lens-prompt-step');
  step2.style.display = 'none';

  const header2 = el('div', 'vibe-lens-prompt-header');
  const title2 = el('h3', 'vibe-lens-prompt-title');
  title2.textContent = 'Prompt copied! Now paste it into your AI tool';
  header2.appendChild(title2);

  const desc2 = el('p', 'vibe-lens-prompt-desc');
  desc2.textContent = 'Paste the prompt from your clipboard into your AI coding tool. It will read your project\'s source code and generate the documentation files. Once the files are saved, refresh this page to see them.';
  header2.appendChild(desc2);
  step2.appendChild(header2);

  const toolList = el('div', 'vibe-lens-prompt-tool-list');
  const tools = ['Claude Code', 'Cursor', 'Windsurf', 'GitHub Copilot', 'ChatGPT (with file uploads)'];
  for (const tool of tools) {
    const toolEl = el('span', 'vibe-lens-prompt-tool-item');
    toolEl.textContent = tool;
    toolList.appendChild(toolEl);
  }
  step2.appendChild(toolList);

  const savePath = el('div', 'vibe-lens-prompt-path');
  savePath.innerHTML = DOMPurify.sanitize(
    `Your AI will save the files to <code>${basePath}/</code>`
  );
  step2.appendChild(savePath);

  // Warnings go on step 2
  const warning = el('div', 'vibe-lens-prompt-warning');
  const warningIcon = el('span', 'vibe-lens-prompt-warning-icon');
  warningIcon.textContent = '\u26a0';
  warning.appendChild(warningIcon);
  const warningText = el('span');
  warningText.textContent = 'VibeLens does not access, transmit, or store your code. The prompt is copied to your clipboard — you choose which AI tool to use. If you\'re working on a team project, check with your org before sharing code with any AI tool.';
  warning.appendChild(warningText);
  step2.appendChild(warning);

  // Copy again button (in case they need it)
  const copyAgain = el('button', 'vibe-lens-prompt-copy-btn vibe-lens-prompt-copy-secondary');
  copyAgain.textContent = 'Copy Prompt Again';
  copyAgain.addEventListener('click', () => {
    navigator.clipboard.writeText(COMBINED_PROMPT).then(() => {
      copyAgain.textContent = 'Copied!';
      copyAgain.classList.add('vibe-lens-prompt-copy-success');
      setTimeout(() => {
        copyAgain.textContent = 'Copy Prompt Again';
        copyAgain.classList.remove('vibe-lens-prompt-copy-success');
      }, 2000);
    });
  });
  step2.appendChild(copyAgain);

  wrapper.appendChild(step2);

  return wrapper;
}

export function buildPromptUI(
  key: string,
  reason: PromptReason,
  file: string,
  basePath: string,
): HTMLElement {
  const prompt = PROMPTS[key];
  const wrapper = el('div', 'vibe-lens-prompt-view');

  const header = el('div', 'vibe-lens-prompt-header');
  const title = el('h3', 'vibe-lens-prompt-title');
  title.textContent = reason === 'missing' ? 'Document not generated yet' :
    reason === 'unversioned' ? 'Document needs to be regenerated' :
    'Document is outdated';
  header.appendChild(title);

  const desc = el('p', 'vibe-lens-prompt-desc');
  desc.textContent = reason === 'missing'
    ? `Copy the prompt below and paste it into your AI coding tool to generate ${file}.`
    : `This document was generated with an older format. Copy the prompt below and regenerate ${file} to get the latest version.`;
  header.appendChild(desc);
  wrapper.appendChild(header);

  const pathInfo = el('div', 'vibe-lens-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `Save the output to: <code>${basePath}/${file}</code>`
  );
  wrapper.appendChild(pathInfo);

  const copyBtn = el('button', 'vibe-lens-prompt-copy-btn');
  copyBtn.textContent = 'Copy Prompt';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(prompt).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('vibe-lens-prompt-copy-success');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Prompt';
        copyBtn.classList.remove('vibe-lens-prompt-copy-success');
      }, 2000);
    });
  });
  wrapper.appendChild(copyBtn);

  return wrapper;
}
