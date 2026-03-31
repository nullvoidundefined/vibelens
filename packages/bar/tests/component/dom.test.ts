import { describe, it, expect, vi } from 'vitest';
import { el, createOverlay, createPanel, createLoadingSkeleton } from '../../src/core/dom.ts';

// ---------------------------------------------------------------------------
// el
// ---------------------------------------------------------------------------

describe('el', () => {
  it('creates an element with the correct tag', () => {
    const node = el('div');
    expect(node.tagName.toLowerCase()).toBe('div');
  });

  it('applies className when provided', () => {
    const node = el('span', 'my-class');
    expect(node.className).toBe('my-class');
  });

  it('leaves className empty when not provided', () => {
    const node = el('div');
    expect(node.className).toBe('');
  });

  it('applies multiple attributes', () => {
    const node = el('button', '', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Close' });
    expect(node.getAttribute('role')).toBe('dialog');
    expect(node.getAttribute('aria-modal')).toBe('true');
    expect(node.getAttribute('aria-label')).toBe('Close');
  });

  it('creates a different tag type', () => {
    const node = el('nav');
    expect(node.tagName.toLowerCase()).toBe('nav');
  });
});

// ---------------------------------------------------------------------------
// createOverlay
// ---------------------------------------------------------------------------

describe('createOverlay', () => {
  it('has class vibe-lens-overlay', () => {
    const overlay = createOverlay(() => {});
    expect(overlay.classList.contains('vibe-lens-overlay')).toBe(true);
  });

  it('calls onClose when the overlay itself is clicked', () => {
    const onClose = vi.fn();
    const overlay = createOverlay(onClose);
    document.body.appendChild(overlay);

    // Dispatch a click event with target === overlay
    const event = new MouseEvent('click', { bubbles: false });
    Object.defineProperty(event, 'target', { value: overlay, writable: false });
    overlay.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledOnce();
    document.body.removeChild(overlay);
  });

  it('does not call onClose when a child element is clicked', () => {
    const onClose = vi.fn();
    const overlay = createOverlay(onClose);
    const child = document.createElement('div');
    overlay.appendChild(child);
    document.body.appendChild(overlay);

    // Click the child — target will be the child, not the overlay
    child.click();

    expect(onClose).not.toHaveBeenCalled();
    document.body.removeChild(overlay);
  });
});

// ---------------------------------------------------------------------------
// createPanel
// ---------------------------------------------------------------------------

describe('createPanel', () => {
  it('returns an object with panel and body properties', () => {
    const result = createPanel('my-panel', 'My Title', () => {});
    expect(result).toHaveProperty('panel');
    expect(result).toHaveProperty('body');
  });

  it('panel has role="dialog"', () => {
    const { panel } = createPanel('my-panel', 'My Title', () => {});
    expect(panel.getAttribute('role')).toBe('dialog');
  });

  it('panel has aria-modal="true"', () => {
    const { panel } = createPanel('my-panel', 'My Title', () => {});
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  it('panel has aria-label set to the title', () => {
    const { panel } = createPanel('my-panel', 'My Title', () => {});
    expect(panel.getAttribute('aria-label')).toBe('My Title');
  });

  it('body has class vibe-lens-panel-body', () => {
    const { body } = createPanel('my-panel', 'My Title', () => {});
    expect(body.classList.contains('vibe-lens-panel-body')).toBe(true);
  });

  it('close button contains × and calls onClose when clicked', () => {
    const onClose = vi.fn();
    const { panel } = createPanel('my-panel', 'My Title', onClose);
    const closeBtn = panel.querySelector('.vibe-lens-close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.textContent).toBe('\u00d7');
    closeBtn.click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('panel applies the provided className', () => {
    const { panel } = createPanel('custom-class', 'Title', () => {});
    expect(panel.className).toBe('custom-class');
  });
});

// ---------------------------------------------------------------------------
// createLoadingSkeleton
// ---------------------------------------------------------------------------

describe('createLoadingSkeleton', () => {
  it('has exactly 4 child divs', () => {
    const skeleton = createLoadingSkeleton();
    expect(skeleton.children).toHaveLength(4);
  });

  it('first child has the title class', () => {
    const skeleton = createLoadingSkeleton();
    const first = skeleton.children[0] as HTMLElement;
    expect(first.classList.contains('vibe-lens-skeleton-line-title')).toBe(true);
  });

  it('last child has the short class', () => {
    const skeleton = createLoadingSkeleton();
    const last = skeleton.children[skeleton.children.length - 1] as HTMLElement;
    expect(last.classList.contains('vibe-lens-skeleton-line-short')).toBe(true);
  });

  it('skeleton element has class vibe-lens-skeleton', () => {
    const skeleton = createLoadingSkeleton();
    expect(skeleton.classList.contains('vibe-lens-skeleton')).toBe(true);
  });
});
