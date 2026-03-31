import { h, FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { VibeLens, type VibeLensOptions } from './core/VibeLens.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

export type VibeLensProps = VibeLensOptions;

const VibeLensComponent: FunctionComponent<VibeLensProps> = (props) => {
  const {
    basePath = DEFAULT_OPTIONS.basePath,
    position = DEFAULT_OPTIONS.position,
    fixed = DEFAULT_OPTIONS.fixed,
    appName = DEFAULT_OPTIONS.appName,
    theme = DEFAULT_OPTIONS.theme,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const instance = new VibeLens({ basePath, position, fixed, appName, theme });
    instance.mount(containerRef.current);
    return () => instance.destroy();
  }, [basePath, position, fixed, appName, theme]);

  return h('div', { ref: containerRef });
};

export default VibeLensComponent;
