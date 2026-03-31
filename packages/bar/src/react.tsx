import { useEffect, useRef } from 'react';
import { VibeLens, type VibeLensOptions } from './core/VibeLens.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

export type VibeLensProps = VibeLensOptions;

export default function VibeLensComponent(props: VibeLensProps) {
  const {
    basePath = DEFAULT_OPTIONS.basePath,
    position = DEFAULT_OPTIONS.position,
    fixed = DEFAULT_OPTIONS.fixed,
    appName = DEFAULT_OPTIONS.appName,
    theme = DEFAULT_OPTIONS.theme,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = new VibeLens({ basePath, position, fixed, appName, theme });
    instance.mount(containerRef.current);
    return () => instance.destroy();
  }, [basePath, position, fixed, appName, theme]);

  return <div ref={containerRef} />;
}
