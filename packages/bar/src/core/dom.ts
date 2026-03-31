/**
 * Shared DOM helpers used across all modules.
 */

export function el(
  tag: string,
  className?: string,
  attrs: Record<string, string> = {},
): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function createOverlay(onClose: () => void): HTMLElement {
  const overlay = el('div', 'vibe-lens-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });
  return overlay;
}

export function createPanel(
  className: string,
  title: string,
  onClose: () => void,
): { panel: HTMLElement; body: HTMLElement } {
  const panel = el('div', className, {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });
  panel.addEventListener('click', (e) => e.stopPropagation());

  const header = el('div', 'vibe-lens-panel-header');
  const h2 = el('h2', 'vibe-lens-panel-title');
  h2.textContent = title;
  const closeBtn = el('button', 'vibe-lens-close', { 'aria-label': 'Close' });
  closeBtn.textContent = '\u00d7';
  closeBtn.addEventListener('click', onClose);
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const body = el('div', 'vibe-lens-panel-body');
  panel.appendChild(body);

  return { panel, body };
}

export function createLoadingSkeleton(): HTMLElement {
  const skeleton = el('div', 'vibe-lens-skeleton');
  for (let i = 0; i < 4; i++) {
    const line = el('div', i === 0 ? 'vibe-lens-skeleton-line vibe-lens-skeleton-line-title' : 'vibe-lens-skeleton-line');
    if (i === 3) line.classList.add('vibe-lens-skeleton-line-short');
    skeleton.appendChild(line);
  }
  return skeleton;
}
