<script>
  import { onMount } from 'svelte';
  import { VibeLens } from './core/VibeLens.ts';

  export let basePath = '/.vibelens/docs';
  export let position = 'bottom';
  export let fixed = true;
  export let appName = '';
  export let theme = 'dark';

  let container;
  let instance;
  let mounted = false;

  onMount(() => {
    mounted = true;
    instance = new VibeLens({ basePath, position, fixed, appName, theme });
    instance.mount(container);
    return () => instance?.destroy();
  });

  function remount(..._) {
    if (!mounted) return;
    instance?.destroy();
    instance = new VibeLens({ basePath, position, fixed, appName, theme });
    instance.mount(container);
  }

  $: remount(basePath, position, fixed, appName, theme);
</script>

<div bind:this={container}></div>
