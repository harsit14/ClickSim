<script lang="ts">
  import type { ChamberArchiveUniverse } from '../render/chamber-archive-marks'
  import { CHAMBER_ARCHIVE_MARK_BY_ID } from '../render/chamber-archive-marks'

  let { id, universeId, silhouette = false }: { id: string; universeId: ChamberArchiveUniverse; silhouette?: boolean } = $props()
  const mark = $derived.by(() => {
    const candidate = CHAMBER_ARCHIVE_MARK_BY_ID.get(id)
    return candidate?.universeId === universeId ? candidate : undefined
  })
</script>

{#if mark}
  <svg class="world-material-silhouette {universeId}" class:silhouette viewBox="0 0 40 40" aria-hidden="true" data-object-card={mark.label}>
    {#if universeId === 'brahmalok'}
      <path class="material-body" d="M4 8L20 11L36 8V31L20 35L4 31ZM20 11V35"></path>
    {:else if universeId === 'vishnulok'}
      <path class="material-body" d="M3 30C9 23 15 28 20 20C25 28 31 23 37 30L34 36H6Z"></path>
    {:else}
      <path class="material-body" d="M3 35L11 23L16 28L24 9L37 35Z"></path>
    {/if}
    <path class="object-form" d={mark.diagramPath}></path>
    <path class="object-accent" d={mark.accentPath}></path>
  </svg>
{/if}

<style>
  svg { width:3.15rem;height:3.15rem;overflow:visible;filter:drop-shadow(0 .3rem .55rem color-mix(in srgb,var(--bg) 56%,transparent)); }
  path { vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round; }
  .material-body { stroke-width:1.2; }
  .object-form { fill:none;stroke-width:1.85; }
  .object-accent { fill:none;stroke-width:1.35;stroke-dasharray:2.2 1.5; }
  .brahmalok .material-body { fill:color-mix(in srgb,#5b351f 78%,var(--panel));stroke:color-mix(in srgb,var(--gold) 52%,#d6a765); }
  .brahmalok .object-form { stroke:#fff1ca; }
  .brahmalok .object-accent { stroke:#8ecbe0; }
  .vishnulok .material-body { fill:color-mix(in srgb,#0a2440 86%,var(--panel));stroke:color-mix(in srgb,var(--gold) 54%,#6ca2c7); }
  .vishnulok .object-form { stroke:#d8ebff; }
  .vishnulok .object-accent { stroke:#efd78f; }
  .kailash .material-body { fill:color-mix(in srgb,#182b38 86%,var(--panel));stroke:color-mix(in srgb,var(--gold) 46%,#8ba4b6); }
  .kailash .object-form { stroke:#edf7ff; }
  .kailash .object-accent { stroke:#d39a70; }
  :global(html[data-contrast='high']) .material-body { stroke:white;stroke-width:1.8; }
  :global(html[data-contrast='high']) .object-form { stroke:white;stroke-width:2.25; }
  :global(html[data-motion='reduced']) .object-accent { stroke-dasharray:none; }
  .silhouette .material-body,.silhouette .object-accent { display:none; }
  .silhouette .object-form { stroke:#000;stroke-width:3.4;filter:none; }
</style>
