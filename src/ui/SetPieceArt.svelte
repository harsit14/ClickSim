<script lang="ts">
  import type { SetPieceStage } from '../render/emberlight/set-piece-registry'

  let {
    stage,
    silhouette = false,
    monochrome = false,
    animate = false,
    label = stage.name,
  }: {
    stage: SetPieceStage
    silhouette?: boolean
    monochrome?: boolean
    animate?: boolean
    label?: string
  } = $props()
</script>

<svg
  class="set-piece-art"
  class:silhouette
  class:monochrome
  class:animate
  class:kindle={animate && stage.entrance === 'kindle'}
  class:build={animate && stage.entrance === 'build'}
  class:condense={animate && stage.entrance === 'condense'}
  class:draw={animate && stage.entrance === 'draw'}
  viewBox="0 0 100 100"
  role={silhouette ? 'img' : undefined}
  aria-label={silhouette ? `${label} flat-black silhouette` : undefined}
  aria-hidden={silhouette ? undefined : 'true'}
  data-object-id={stage.objectId}
  data-entrance={stage.entrance}
>
  {#each stage.paths as layer (layer.id)}
    <path
      class:body={layer.role === 'body'}
      class:light={layer.role === 'light'}
      class:shadow={layer.role === 'shadow'}
      class:line={layer.role === 'line'}
      class:void={layer.role === 'void'}
      data-path-id={layer.id}
      d={layer.d}
      fill-rule={layer.fillRule ?? 'nonzero'}
      clip-rule={layer.fillRule ?? 'nonzero'}
      pathLength={layer.role === 'line' ? 1 : undefined}
    ></path>
  {/each}
</svg>

<style>
  .set-piece-art { width: 100%; height: 100%; display: block; overflow: visible; }
  path { vector-effect: non-scaling-stroke; }
  .body { fill: var(--set-piece-body, color-mix(in srgb, var(--amber) 72%, #5a2b21)); }
  .light { fill: var(--set-piece-light, color-mix(in srgb, var(--gold) 88%, white)); }
  .shadow { fill: var(--set-piece-shadow, color-mix(in srgb, var(--bg) 76%, #301d27)); }
  .void { fill: var(--set-piece-void, var(--bg)); }
  .line { fill: none; stroke: var(--set-piece-line, color-mix(in srgb, var(--gold) 78%, white)); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }

  .silhouette path:not(.void):not(.line) { fill: #000; }
  .silhouette .line { fill: none; stroke: #000; stroke-width: 8; }
  .silhouette .void { fill: #fff; }
  .monochrome path:not(.void):not(.line) { fill: currentColor; }
  .monochrome .line { fill: none; stroke: currentColor; stroke-width: 7; }
  .monochrome .void { fill: var(--panel); }

  .animate.kindle { animation: kindle-in 620ms cubic-bezier(0.16, 0.82, 0.28, 1.18) both; }
  .animate.build { transform-origin: 50% 100%; animation: build-in 720ms steps(4, end) both; }
  .animate.condense { animation: condense-in 780ms cubic-bezier(0.2, 0.8, 0.25, 1) both; }
  .animate.draw .line { stroke-dasharray: 1; animation: draw-in 820ms ease-out both; }
  .animate.draw path:not(.line) { transform-origin: center; animation: draw-anchor-in 520ms steps(3, end) both; }

  @keyframes kindle-in { from { transform: scale(0.18) translateY(24%); } 70% { transform: scale(1.08) translateY(-2%); } to { transform: scale(1); } }
  @keyframes build-in { from { transform: scaleY(0.08); } to { transform: scaleY(1); } }
  @keyframes condense-in { from { transform: scale(1.75); filter: blur(5px); } to { transform: scale(1); filter: blur(0); } }
  @keyframes draw-in { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes draw-anchor-in { from { transform: scale(0); } to { transform: scale(1); } }

  :global(html[data-motion='reduced']) .set-piece-art,
  :global(html[data-motion='reduced']) .set-piece-art path { animation: none !important; filter: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .set-piece-art,
    .set-piece-art path { animation: none !important; filter: none !important; }
  }
</style>
