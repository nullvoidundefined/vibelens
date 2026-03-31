/**
 * Vanilla JS entry point for VibeLens.
 *
 * Usage (manual mount):
 *
 *   import { VibeLens } from 'vibelens/vanilla';
 *   import 'vibelens/styles.css';
 *
 *   const bar = new VibeLens({
 *     basePath: '/.vibelens/docs',
 *     appName: 'My App',
 *     position: 'top',
 *     theme: 'dark',
 *   });
 *   bar.mount(document.getElementById('vibe-lens'));
 *
 *   // Later, to clean up:
 *   bar.destroy();
 *
 * Usage (auto-inject):
 *
 *   import { inject } from 'vibelens/vanilla';
 *   import 'vibelens/styles.css';
 *
 *   const bar = inject({ appName: 'My App' });
 */
import { VibeLens } from './core/VibeLens.ts';

export { VibeLens };

export interface InjectOptions {
  basePath?: string;
  position?: 'top' | 'bottom';
  fixed?: boolean;
  appName?: string;
  theme?: 'dark' | 'light';
}

/**
 * Creates a container div, prepends it to document.body, and mounts
 * a VibeLens instance. Returns the instance (call .destroy() to remove).
 */
export function inject(options: InjectOptions = {}): InstanceType<typeof VibeLens> {
  const container = document.createElement('div');
  container.setAttribute('data-vibe-lens', '');
  document.body.prepend(container);

  const instance = new VibeLens(options);
  instance.mount(container);
  return instance;
}
