<script lang="ts">
  import type { WorldObjectManifest } from '../content/universes/types'
  import { planKailashFormations } from '../render/canticle/world-layer'

  let {
    objects,
    owned,
    reducedMotion = false,
    quality = 'high',
  }: {
    objects: readonly WorldObjectManifest[]
    owned: Readonly<Record<string, number>>
    reducedMotion?: boolean
    quality?: 'low' | 'balanced' | 'high'
  } = $props()

  const formations = $derived(planKailashFormations(objects, owned, quality))
</script>

<div
  class="kailash-world-layer"
  class:motion-paused={reducedMotion}
  class:low-quality={quality === 'low'}
  data-formation-count={formations.length}
  aria-hidden="true"
>
  {#each formations as formation (formation.id)}
    <figure
      class="formation {formation.kind}"
      data-formation={formation.kind}
      data-ownership-threshold={formation.threshold}
      style={`--formation-x:${formation.xPercent}%;--formation-bottom:${formation.bottomPercent}%;--formation-scale:${formation.scale}`}
    >
      <svg class="formation-art" viewBox="0 0 60 48" role="presentation">
        <path class="formation-mass" d={formation.basePath}></path>
        <path class="formation-detail" d={formation.detailPath}></path>
        {#if formation.threshold >= 10}
          <path class="formation-companion" d={formation.basePath} transform="translate(9 9) scale(.62)"></path>
        {/if}
        {#if formation.threshold >= 25}
          <path class="formation-route" d={formation.routePath}></path>
        {/if}
        {#if formation.threshold >= 50}
          <path class="formation-shelter" d="M22 42V36Q30 28 38 36V42M26 42V37Q30 33 34 37V42"></path>
          <circle class="formation-light" cx="30" cy="38" r="1.3"></circle>
        {/if}
        {#if formation.threshold >= 100}
          <path class="formation-crown" d="M7 12C17 5 25 10 31 5C38 0 46 6 54 2"></path>
        {/if}
      </svg>
    </figure>
  {/each}
</div>

<style>
  .kailash-world-layer { position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;--kailash-stone:#173047;--kailash-snow:#c9dce4;--kailash-river:#87c4d3;--kailash-copper:#c47d4f; }
  .formation { position:absolute;left:var(--formation-x);bottom:var(--formation-bottom);width:clamp(6.4rem,10vw,10rem);height:clamp(5rem,8vw,8rem);margin:0;transform:translateX(-50%) scale(var(--formation-scale));transform-origin:50% 100%;filter:drop-shadow(0 .55rem .8rem color-mix(in srgb,var(--bg) 72%,transparent));opacity:.76; }
  .formation-art { width:100%;height:100%;overflow:visible;animation:formation-breathe 9s ease-in-out infinite alternate; }
  .formation-mass { fill:color-mix(in srgb,var(--kailash-stone) 86%,var(--bg));stroke:color-mix(in srgb,var(--kailash-snow) 28%,transparent);stroke-width:.65; }
  .formation-detail,.formation-route,.formation-shelter,.formation-crown { fill:none;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round; }
  .formation-detail { stroke:color-mix(in srgb,var(--kailash-snow) 50%,transparent);stroke-width:.8; }
  .formation-companion { fill:color-mix(in srgb,var(--kailash-stone) 74%,transparent);stroke:color-mix(in srgb,var(--kailash-snow) 25%,transparent);stroke-width:.7;transform-origin:center; }
  .formation-route { stroke:color-mix(in srgb,var(--kailash-river) 72%,white);stroke-width:1.15;filter:drop-shadow(0 0 .12rem color-mix(in srgb,var(--kailash-river) 42%,transparent)); }
  .formation-shelter { stroke:color-mix(in srgb,var(--kailash-snow) 62%,transparent);stroke-width:.9; }
  .formation-light { fill:color-mix(in srgb,#f0cf91 78%,white);filter:drop-shadow(0 0 .22rem #dca45d); }
  .formation-crown { stroke:color-mix(in srgb,var(--kailash-copper) 72%,var(--gold));stroke-width:1.2;stroke-dasharray:8 3 2 4; }
  [data-ownership-threshold='1'] .formation-art { transform:scale(.72);transform-origin:50% 100%; }
  [data-ownership-threshold='10'] .formation-art { transform:scale(.84);transform-origin:50% 100%; }
  [data-ownership-threshold='25'] .formation-art { transform:scale(.94);transform-origin:50% 100%; }
  [data-ownership-threshold='50'] .formation-art { transform:scale(1.02);transform-origin:50% 100%; }
  [data-ownership-threshold='100'] { opacity:.92;filter:drop-shadow(0 .55rem .9rem color-mix(in srgb,var(--bg) 72%,transparent)) drop-shadow(0 0 .7rem color-mix(in srgb,var(--kailash-river) 12%,transparent)); }
  .ash-grove .formation-mass { fill:color-mix(in srgb,#17211e 82%,var(--bg)); }
  .ash-grove .formation-detail { stroke:color-mix(in srgb,#d0b48d 42%,transparent);stroke-dasharray:4 3; }
  .cairn .formation-mass { fill:color-mix(in srgb,#26343d 84%,var(--bg)); }
  .horizon .formation-detail { stroke:color-mix(in srgb,var(--kailash-copper) 48%,transparent); }
  .motion-paused .formation-art { animation:none; }
  .low-quality .formation-companion,.low-quality .formation-crown { display:none; }
  :global(html[data-contrast='high']) .formation-mass { stroke:white;stroke-width:1.05; }
  :global(html[data-contrast='high']) .formation-detail,:global(html[data-contrast='high']) .formation-shelter { stroke:#dcebf1; }
  :global(html[data-contrast='high']) .formation-route { stroke:#9de5f2; }
  @keyframes formation-breathe { to { translate:0 -.22rem;opacity:.88; } }
</style>
