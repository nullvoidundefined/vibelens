import { VibeLens } from './core/VibeLens.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

/**
 * <vibe-lens> — a custom element wrapping VibeLens.
 *
 * Works in any framework (Angular, Ember, plain HTML, etc.)
 * without framework-specific setup.
 *
 * Attributes (kebab-case):
 *   base-path, position, fixed (boolean — present=true, absent or "false"=false),
 *   app-name, theme
 *
 * Usage:
 *   <vibe-lens app-name="My App" theme="dark"></vibe-lens>
 *   <vibe-lens app-name="My App" fixed="false" position="top"></vibe-lens>
 */
class VibeLensElement extends HTMLElement {
  static observedAttributes = ['base-path', 'position', 'fixed', 'app-name', 'theme'];

  #instance: InstanceType<typeof VibeLens> | null = null;

  connectedCallback() {
    this.#mount();
  }

  disconnectedCallback() {
    this.#instance?.destroy();
    this.#instance = null;
  }

  attributeChangedCallback() {
    if (this.#instance) {
      this.#instance.destroy();
      this.#mount();
    }
  }

  #mount() {
    const fixedAttr = this.getAttribute('fixed');
    const fixed = fixedAttr === null ? true : fixedAttr !== 'false';

    this.#instance = new VibeLens({
      basePath: this.getAttribute('base-path') ?? DEFAULT_OPTIONS.basePath,
      position: (this.getAttribute('position') as 'top' | 'bottom') ?? DEFAULT_OPTIONS.position,
      fixed,
      appName: this.getAttribute('app-name') ?? DEFAULT_OPTIONS.appName,
      theme: (this.getAttribute('theme') as 'dark' | 'light') ?? DEFAULT_OPTIONS.theme,
    });
    this.#instance.mount(this);
  }
}

if (!customElements.get('vibe-lens')) {
  customElements.define('vibe-lens', VibeLensElement);
}

export { VibeLensElement };
