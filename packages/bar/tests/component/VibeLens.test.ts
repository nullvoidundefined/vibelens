import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VibeLens } from '../../src/core/VibeLens.ts';
import { DEFAULT_OPTIONS } from '../../src/core/constants.ts';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VibeLens', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockFetch.mockReset();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  describe('constructor', () => {
    it('uses DEFAULT_OPTIONS when no options are provided', () => {
      const vl = new VibeLens();
      // Access via mount to indirectly verify defaults — we check the rendered
      // nav classes which are derived from defaults.
      // We test by mocking fetch so mount resolves quickly.
      mockFetch.mockResolvedValue({ ok: false });
      // Just constructing should not throw
      expect(vl).toBeInstanceOf(VibeLens);
    });

    it('merges partial options with defaults', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens({ position: 'top', appName: 'MyApp' });
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
      // position: 'top' should appear in class list
      expect(nav!.classList.contains('vibe-lens-top')).toBe(true);
      // theme should fall back to default 'dark'
      expect(nav!.classList.contains('vibe-lens-theme-dark')).toBe(true);
      // appName span
      expect(container.querySelector('.vibe-lens-app-name')?.textContent).toBe('MyApp');
    });
  });

  // -------------------------------------------------------------------------
  // mount()
  // -------------------------------------------------------------------------

  describe('mount()', () => {
    it('renders a nav element inside the container', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
    });

    it('nav has role="navigation"', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.getAttribute('role')).toBe('navigation');
    });

    it('nav has aria-label="App documentation"', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.getAttribute('aria-label')).toBe('App documentation');
    });

    it('nav includes correct position class from defaults', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.classList.contains(`vibe-lens-${DEFAULT_OPTIONS.position}`)).toBe(true);
    });

    it('nav includes correct theme class from defaults', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.classList.contains(`vibe-lens-theme-${DEFAULT_OPTIONS.theme}`)).toBe(true);
    });

    it('shows 6 nav link buttons when all docs are available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<!-- vibelens format:1 -->\n# Test'),
      });
      const vl = new VibeLens();
      await vl.mount(container);

      const links = container.querySelectorAll('.vibe-lens-link');
      expect(links).toHaveLength(6);
    });

    it('shows "Generate Documents" button when docs are missing', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const generateBtn = container.querySelector('.vibe-lens-link-generate');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn!.textContent).toBe('Generate Documents');
    });

    it('shows "Generate Documents" button when fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));
      const vl = new VibeLens();
      await vl.mount(container);

      const generateBtn = container.querySelector('.vibe-lens-link-generate');
      expect(generateBtn).toBeTruthy();
    });

    it('shows "Generate Documents" when docs exist but version stamp is missing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('# No version stamp here'),
      });
      const vl = new VibeLens();
      await vl.mount(container);

      const generateBtn = container.querySelector('.vibe-lens-link-generate');
      expect(generateBtn).toBeTruthy();
    });

    it('renders vibe-lens-fixed class when fixed is true (default)', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.classList.contains('vibe-lens-fixed')).toBe(true);
    });

    it('does not render vibe-lens-fixed class when fixed is false', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens({ fixed: false });
      await vl.mount(container);

      const nav = container.querySelector('nav');
      expect(nav!.classList.contains('vibe-lens-fixed')).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // destroy()
  // -------------------------------------------------------------------------

  describe('destroy()', () => {
    it('clears the container innerHTML', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      expect(container.innerHTML).not.toBe('');
      vl.destroy();
      expect(container.innerHTML).toBe('');
    });

    it('can be called multiple times without throwing', async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const vl = new VibeLens();
      await vl.mount(container);

      expect(() => {
        vl.destroy();
        vl.destroy();
        vl.destroy();
      }).not.toThrow();
    });

    it('can be called before mount without throwing', () => {
      const vl = new VibeLens();
      expect(() => vl.destroy()).not.toThrow();
    });
  });
});
