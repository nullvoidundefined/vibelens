import DOMPurify from 'dompurify';
import { el } from './dom.ts';
import { PROMPTS, COMBINED_PROMPT } from './prompts.ts';
import type { NavLink } from './VibeLens.ts';

type PromptReason = 'missing' | 'unversioned' | 'outdated';

function createCopyButton(text: string, label: string): HTMLElement {
  const btn = el('button', 'vibe-lens-prompt-copy-btn');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('vibe-lens-prompt-copy-success');
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('vibe-lens-prompt-copy-success');
      }, 2000);
    });
  });
  return btn;
}

export function buildGenerateUI(basePath: string, navLinks: NavLink[]): HTMLElement {
  const wrapper = el('div', 'vibe-lens-prompt-view');

  const header = el('div', 'vibe-lens-prompt-header');
  const title = el('h3', 'vibe-lens-prompt-title');
  title.textContent = 'Let\'s learn about your project';
  header.appendChild(title);

  const desc = el('p', 'vibe-lens-prompt-desc');
  desc.textContent = 'Grab this prompt, drop it into ChatGPT or Claude, and it\'ll explain your entire project to you. You\'ll get a summary, a guide to your tech stack, architecture docs, a quiz, and a code review.';
  header.appendChild(desc);
  wrapper.appendChild(header);

  const warning = el('div', 'vibe-lens-prompt-warning');
  const warningIcon = el('span', 'vibe-lens-prompt-warning-icon');
  warningIcon.textContent = '\u26a0';
  warning.appendChild(warningIcon);
  const warningText = el('span');
  warningText.textContent = 'This copies a prompt to your clipboard — you\'ll paste it into your own AI tool. Nothing is sent anywhere automatically. If you\'re working on a team project, check with your org before sharing code with an AI.';
  warning.appendChild(warningText);
  wrapper.appendChild(warning);

  const pathInfo = el('div', 'vibe-lens-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `It'll generate these files: <code>${basePath}/</code>`
  );
  wrapper.appendChild(pathInfo);

  const fileList = el('div', 'vibe-lens-prompt-file-list');
  for (const { file } of navLinks) {
    const fileEl = el('code', 'vibe-lens-prompt-file-item');
    fileEl.textContent = file;
    fileList.appendChild(fileEl);
  }
  wrapper.appendChild(fileList);

  wrapper.appendChild(createCopyButton(COMBINED_PROMPT, 'Copy Prompt'));

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
    ? `Copy the prompt below and paste it into your preferred AI assistant along with your project's source code to generate ${file}.`
    : `This document was generated with an older format. Copy the prompt below and regenerate ${file} to get the latest version.`;
  header.appendChild(desc);
  wrapper.appendChild(header);

  const pathInfo = el('div', 'vibe-lens-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `Save the output to: <code>${basePath}/${file}</code>`
  );
  wrapper.appendChild(pathInfo);

  wrapper.appendChild(createCopyButton(prompt, 'Copy Prompt to Clipboard'));

  return wrapper;
}
