<script lang="ts">
  import { onMount } from 'svelte'
  import { planKindledSky } from '../render/emberlight/kindled-sky'

  let {
    achievementIds,
    reducedMotion = false,
  }: {
    achievementIds: readonly string[]
    reducedMotion?: boolean
  } = $props()

  let initialized = false
  let previousIds = new Set<string>()
  let newestId = $state<string | null>(null)
  const plan = $derived(planKindledSky(achievementIds))
  const newest = $derived(plan.stars.find(({ id }) => id === newestId) ?? null)

  onMount(() => {
    previousIds = new Set(achievementIds)
    initialized = true
  })

  $effect(() => {
    const ids = achievementIds
    if (!initialized) return
    const added = ids.find((id) => !previousIds.has(id)) ?? null
    previousIds = new Set(ids)
    if (!added) return
    newestId = added
    const timer = setTimeout(() => (newestId = null), 2_200)
    return () => clearTimeout(timer)
  })
</script>

{#if plan.stars.length > 0}
  <section
    class="kindled-sky"
    class:motion-paused={reducedMotion}
    aria-label={`Kindled Sky, ${plan.stars.length} named achievement stars`}
  >
    <svg class="category-routes" viewBox="0 0 100 100" aria-hidden="true">
      {#each plan.routes as route, index (`${route.category}-${index}`)}
        <line x1={route.from[0]} y1={route.from[1]} x2={route.to[0]} y2={route.to[1]}></line>
      {/each}
      {#if newest}
        <line class="ignition-route" x1="96" y1="96" x2={newest.x} y2={newest.y} pathLength="1"></line>
      {/if}
    </svg>
    {#each plan.stars as star (star.id)}
      <button
        type="button"
        class="achievement-star"
        class:new={star.id === newestId}
        style={`--x:${star.x}%;--y:${star.y}%`}
        data-achievement-id={star.id}
        data-category={star.category}
        aria-label={`${star.name}, Kindled Sky achievement star`}
      >
        <i aria-hidden="true"></i>
        <span role="tooltip">{star.name}</span>
      </button>
    {/each}
    <p><strong>Kindled Sky</strong><span>{plan.stars.length}% Radiance</span></p>
  </section>
{/if}

<style>
  .kindled-sky {
    position: absolute; left: 2.2%; top: 9%; width: min(24vw, 21rem); height: min(27vh, 13rem);
    z-index: 5; pointer-events: none;
    background: radial-gradient(ellipse at 42% 48%, color-mix(in srgb, #ffcf7a 4%, transparent), transparent 70%);
  }
  .category-routes { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .category-routes line { stroke: rgba(255, 218, 150, 0.095); stroke-width: 0.34; }
  .category-routes .ignition-route { stroke: rgba(255, 226, 170, 0.72); stroke-width: 0.8; stroke-dasharray: 1; animation: travel-line 720ms ease-out both; }
  .achievement-star {
    position: absolute; left: var(--x); top: var(--y); width: 0.78rem; height: 0.78rem;
    padding: 0; transform: translate(-50%, -50%); pointer-events: auto;
    background: transparent; border: 0; cursor: pointer;
  }
  .achievement-star i { position: absolute; inset: 0.2rem; background: #ffe3a6; clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%); box-shadow: 0 0 0.4rem rgba(255, 181, 84, 0.86); }
  .achievement-star.new i { animation: achievement-kindle 680ms steps(4, end) both; }
  .achievement-star span {
    position: absolute; left: 50%; bottom: calc(100% + 0.3rem); width: max-content; max-width: 11rem;
    padding: 0.24rem 0.4rem; transform: translateX(-50%); opacity: 0;
    color: #efe6d8; background: rgba(10, 8, 18, 0.9); border: 1px solid rgba(255, 218, 150, 0.18);
    border-radius: 0.35rem; font-size: 0.6rem; pointer-events: none; transition: opacity 120ms ease;
  }
  .achievement-star:hover span,
  .achievement-star:focus-visible span { opacity: 1; }
  .kindled-sky > p { position: absolute; left: 0; top: 100%; display: flex; gap: 0.55rem; margin: 0; color: rgba(239, 230, 216, 0.42); font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase; }
  .kindled-sky > p strong { color: rgba(255, 218, 150, 0.62); }
  @keyframes achievement-kindle { 0% { transform: scale(0); } 55% { transform: scale(3); background: white; } 100% { transform: scale(1); } }
  @keyframes travel-line { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  .motion-paused,
  .motion-paused * { animation-play-state: paused !important; }
  @media (prefers-reduced-motion: reduce) { .kindled-sky * { animation: none !important; transition: none !important; } }
</style>
