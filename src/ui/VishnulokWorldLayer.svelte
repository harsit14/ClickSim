<script lang="ts">
  import type { EconomyAmount, WorldObjectManifest } from '../content/universes/types'
  import {
    planVishnulokLivingChart,
    planVishnulokReturn,
    planVishnulokShelters,
    planVishnulokStrainMarker,
  } from '../render/tempest/world-layer'

  let {
    objects,
    owned,
    numericLawState,
    wovenRoutes = 0,
    completedReturns = 0,
    reducedMotion = false,
    quality = 'high',
  }: {
    objects: readonly WorldObjectManifest[]
    owned: Readonly<Record<string, number>>
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    wovenRoutes?: number
    completedReturns?: number
    reducedMotion?: boolean
    quality?: 'low' | 'balanced' | 'high'
  } = $props()

  const shelters = $derived(planVishnulokShelters(objects, owned, quality))
  const chart = $derived(planVishnulokLivingChart(wovenRoutes, completedReturns))
  const returning = $derived(planVishnulokReturn(numericLawState, reducedMotion))
  const strain = $derived(planVishnulokStrainMarker(numericLawState))
  const seats = [[18,57],[28,75],[45,82],[62,80],[78,68],[82,48]] as const

  function routePath(from: number, to: number): string {
    const a = seats[from] ?? seats[0]
    const b = seats[to] ?? seats[3]
    return `M${a[0]} ${a[1]}Q50 ${40 + ((from + to) % 3) * 5} ${b[0]} ${b[1]}Q50 88 ${a[0]} ${a[1]}`
  }
</script>

<div class="living-chart" class:motion-paused={reducedMotion} data-route-count={chart.routes.length} data-shelter-count={shelters.length} data-strain={strain?.id ?? 'none'}>
  <svg class="woven-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    {#each chart.routes as route (route.id)}
      <path class:old={route.age === 'old'} class:fresh={route.age === 'fresh'} d={routePath(route.from, route.to)}></path>
    {/each}
    {#if returning.active}
      <path class="active-return" class:confluence={returning.confluence} d={routePath(0, Math.max(1, Math.min(5, returning.routeLength - 1)))}></path>
    {/if}
  </svg>
  {#each shelters as shelter, index (shelter.id)}
    <i class="ocean-shelter {shelter.kind}" data-threshold={shelter.threshold} style={`--shelter-x:${shelter.xPercent}%;--shelter-y:${shelter.yPercent}%`} title={shelter.silhouette}>
      <b>{shelter.kind === 'lamp' ? '✧' : shelter.kind === 'reef' || shelter.kind === 'shoal' ? '⌃' : '⌂'}</b><small>{index + 1}</small>
    </i>
  {/each}
  {#if returning.active}
    <i class="return-pulse" class:static={reducedMotion} class:confluence={returning.confluence} aria-hidden="true"></i>
  {/if}
  {#if strain}
    <div class="strain-marker" style={`--strain-x:${strain.xPercent}%;--strain-y:${strain.yPercent}%`} aria-label={`${strain.name}. ${strain.label}`} role="status" aria-live="polite">
      <span>{strain.glyph}</span><b>{strain.name}</b><small>{strain.pattern}</small>
    </div>
  {/if}
  <p class="sr-only">Living chart: {chart.totalRoutes} routes kept{chart.unrenderedRoutes > 0 ? `; and ${chart.unrenderedRoutes} more continue beyond the visible chart` : ''}. {returning.progressLabel}. The refuge center remains open.</p>
</div>

<style>
  .living-chart { position:absolute;inset:0;z-index:2;pointer-events:none;--ocean-gold:#d9bd77;--ocean-ink:#0c182b; }
  .woven-routes { position:absolute;inset:0;width:100%;height:100%;overflow:visible; }
  .woven-routes path { fill:none;stroke:color-mix(in srgb,var(--ocean-gold) 31%,transparent);stroke-width:.18;vector-effect:non-scaling-stroke; }
  .woven-routes path.old { opacity:.35;stroke-width:.1; }.woven-routes path.fresh { opacity:.9;stroke-width:.35; }
  .woven-routes .active-return { stroke:#f1d895;stroke-width:.55;stroke-dasharray:3 2;animation:return-dash 2.6s linear infinite;filter:drop-shadow(0 0 .2rem #cba85c); }
  .woven-routes .active-return.confluence { stroke-width:.8;stroke-dasharray:4 1 1 1; }
  .ocean-shelter { position:absolute;left:var(--shelter-x);top:var(--shelter-y);width:2rem;height:1.35rem;display:grid;place-items:center;transform:translate(-50%,-50%);color:#cbbd94;border:1px solid color-mix(in srgb,#b8cbe2 36%,transparent);border-bottom:2px solid #c8ad6e;border-radius:55% 55% 12% 12%;background:color-mix(in srgb,var(--ocean-ink) 88%,transparent);box-shadow:0 .35rem .65rem #030710; }
  .ocean-shelter b { font:.75rem/1 system-ui,sans-serif; }.ocean-shelter small { position:absolute;right:-.55rem;top:-.25rem;color:#d7c98e;font:.42rem/1 system-ui,sans-serif; }
  .ocean-shelter[data-threshold='1'] { scale:.72;opacity:.62; }.ocean-shelter[data-threshold='10'] { scale:.82; }.ocean-shelter[data-threshold='25'] { scale:.9; }.ocean-shelter[data-threshold='50'] { scale:1;box-shadow:0 .35rem .65rem #030710,0 0 .6rem color-mix(in srgb,#d8b76a 22%,transparent); }.ocean-shelter[data-threshold='100'] { scale:1.08;border-width:2px; }
  .return-pulse { position:absolute;left:18%;top:57%;width:.65rem;height:.65rem;border:2px solid #f5d98f;border-radius:50%;box-shadow:0 0 .8rem #d0a84d;offset-path:path('M0 0 C260px -120px 520px -80px 720px 0 C450px 240px 180px 220px 0 0');animation:return-travel 7s linear infinite; }
  .return-pulse.confluence { box-shadow:0 0 0 .25rem color-mix(in srgb,#a7d9cf 35%,transparent),0 0 .9rem #e3bd61; }
  .return-pulse.static { left:50%;top:69%;offset-path:none;animation:none; }
  .strain-marker { position:absolute;left:var(--strain-x);top:var(--strain-y);display:grid;grid-template-columns:auto auto;gap:.08rem .32rem;align-items:center;max-width:10rem;padding:.32rem .42rem;color:#e5d5a4;background:#111d2e;border:1px dashed #dfcc8d;box-shadow:0 .4rem 1rem #030712; }
  .strain-marker span { grid-row:1 / 3;width:1.45rem;height:1.45rem;display:grid;place-items:center;border:1px solid currentColor;border-radius:50%; }.strain-marker b { font:.55rem/1.1 Georgia,serif; }.strain-marker small { color:#aeb9c8;font:.38rem/1.1 system-ui,sans-serif; }
  .motion-paused .active-return { animation:none;stroke-dasharray:2 1; }
  @keyframes return-dash { to { stroke-dashoffset:-10; } }
  @keyframes return-travel { to { offset-distance:100%; } }
  :global(html[data-contrast='high']) .ocean-shelter,:global(html[data-contrast='high']) .strain-marker { border-color:white;color:white; }
</style>
