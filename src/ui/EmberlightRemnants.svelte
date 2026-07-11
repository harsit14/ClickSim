<script lang="ts">
  import { planEmberlightRemnants } from '../render/emberlight/remnants'

  let { owned }: { owned: Readonly<Record<string, number>> } = $props()
  const remnants = $derived(planEmberlightRemnants(owned))
</script>

<div class="remnant-channel" data-remnant-count={remnants.length} aria-hidden="true">
  {#each remnants as remnant (remnant.id)}
    <figure
      class="remnant"
      class:complete={remnant.complete}
      data-remnant-id={remnant.id}
      data-ownership-threshold={remnant.threshold}
      style={`--x:${remnant.x}%;--y:${remnant.y}%;--reveal:${remnant.reveal}`}
    >
      <svg viewBox="0 0 100 100">
        <path d={remnant.path} pathLength="1"></path>
      </svg>
      <i></i>
    </figure>
  {/each}
</div>

<style>
  .remnant-channel { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
  .remnant { position: absolute; left: var(--x); top: var(--y); width: 4.2rem; height: 3.8rem; margin: 0; transform: translate(-50%, -50%); overflow: hidden; }
  .remnant svg { width: 100%; height: 100%; clip-path: inset(calc((1 - var(--reveal)) * 100%) 0 0); transition: clip-path 700ms steps(4, end); }
  .remnant path { fill: none; stroke: rgba(132, 105, 108, 0.62); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 1px rgba(0, 0, 0, 0.8)); }
  .remnant.complete path { stroke: rgba(193, 137, 100, 0.78); }
  .remnant > i { position: absolute; left: -10%; right: -10%; bottom: -2%; height: calc((1 - var(--reveal)) * 82%); background: #221a24; border-radius: 50% 50% 0 0; transition: height 700ms steps(4, end); }
  .remnant.complete { filter: drop-shadow(0 0 0.35rem rgba(255, 180, 84, 0.12)); }
  @media (max-width: 760px) { .remnant { width: 3rem; height: 2.7rem; } }
  @media (prefers-reduced-motion: reduce) { .remnant svg, .remnant > i { transition: none; } }
</style>
