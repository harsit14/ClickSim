<script lang="ts">
  import { VERDANCE_ARCHIVE_SILHOUETTES } from '../render/verdance/archive-silhouettes'

  let { index = 0 }: { index?: number } = $props()
  const silhouette = $derived(VERDANCE_ARCHIVE_SILHOUETTES[Math.max(0, Math.min(VERDANCE_ARCHIVE_SILHOUETTES.length - 1, index))])
</script>

<svg class="verdance-archive-silhouette" viewBox="0 0 40 40" aria-hidden="true">
  <path class="body" d={silhouette.primaryPath}></path>
  <path class="vein" d={silhouette.accentPath}></path>
</svg>

<style>
  svg { width: 2.85rem; height: 2.85rem; overflow: visible; filter: drop-shadow(0 0 .55rem color-mix(in srgb, var(--amber) 34%, transparent)); }
  .body { fill: color-mix(in srgb, var(--bg) 82%, #102819); stroke: color-mix(in srgb, var(--gold) 72%, #d8ffc0); stroke-width: 1.5; stroke-linejoin: round; }
  .vein { fill: none; stroke: color-mix(in srgb, var(--amber) 72%, white); stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; }
  :global(html[data-contrast='high']) .body { fill: #07120b; stroke: white; stroke-width: 2; }
  :global(html[data-contrast='high']) .vein { stroke: #e5ffad; stroke-width: 1.75; }
</style>
