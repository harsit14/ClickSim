<script lang="ts">
  import type { EconomyAmount, WorldObjectManifest } from '../content/universes/types'
  import {
    planKailashAshBands,
    planKailashDescent,
    planKailashFormations,
    planKailashFrontWeather,
    planKailashValley,
  } from '../render/canticle/world-layer'

  let {
    objects,
    owned,
    reducedMotion = false,
    quality = 'high',
    numericLawState,
    traces = 0,
    releaseCount = 0,
  }: {
    objects: readonly WorldObjectManifest[]
    owned: Readonly<Record<string, number>>
    reducedMotion?: boolean
    quality?: 'low' | 'balanced' | 'high'
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    traces?: number
    releaseCount?: number
  } = $props()

  const formations = $derived(planKailashFormations(objects, owned, quality))
  const descent = $derived(planKailashDescent(traces))
  const valley = $derived(planKailashValley(owned))
  const ashBands = $derived(planKailashAshBands(releaseCount))
  const weather = $derived(planKailashFrontWeather(numericLawState, owned))
</script>

<div
  class="kailash-world-layer"
  class:motion-paused={reducedMotion}
  class:low-quality={quality === 'low'}
  data-formation-count={formations.length}
  data-descent-stations={descent.stations.length}
  data-front={weather?.frontId ?? 'calm'}
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
  <div class="ash-core">
    {#each ashBands as band (band.index)}<i class={band.layer} title={band.silhouette}></i>{/each}
  </div>
  <svg class="descent-trail" viewBox="0 0 100 100" preserveAspectRatio="none">
    {#if descent.stations.length > 1}
      <path d={`M${descent.stations.map(({ xPercent, yPercent }) => `${xPercent} ${yPercent}`).join('L')}`}></path>
    {/if}
  </svg>
  {#each descent.stations as station, index (station.name)}
    <i
      class="descent-station {station.kind}"
      class:fresh={station.stage === 'fresh'}
      style={`--station-x:${station.xPercent}%;--station-y:${station.yPercent}%`}
      title={`${station.name}: ${station.silhouette}`}
    ><b>{station.kind === 'lamp' ? '✧' : station.kind === 'way-shelter' ? '⌂' : station.kind === 'spring' ? '≈' : station.kind === 'grove' ? '⌃' : station.kind === 'rope-line' ? '—' : '△'}</b><small>{index + 1}</small></i>
  {/each}
  {#each valley as feature (feature.id)}
    <i class="valley-feature" data-source={feature.sourceId} data-threshold={feature.threshold} style={`--valley-x:${feature.xPercent}%;--valley-y:${feature.yPercent}%`} title={`${feature.name}: ${feature.silhouette}`}></i>
  {/each}
  {#if weather}
    <div class="weather-front {weather.frontId} {weather.phase}" class:still={reducedMotion} title={reducedMotion ? weather.reducedMotionState : weather.silhouette}><i></i><span>{weather.frontId.replace('-', ' ')}</span></div>
  {/if}
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
  .descent-trail { position:absolute;inset:0;width:100%;height:100%;overflow:visible; }
  .descent-trail path { fill:none;stroke:color-mix(in srgb,var(--kailash-snow) 38%,transparent);stroke-width:.22;stroke-dasharray:1.4 1.1;vector-effect:non-scaling-stroke; }
  .descent-station { position:absolute;left:var(--station-x);top:var(--station-y);width:1.2rem;height:1.2rem;display:grid;place-items:center;transform:translate(-50%,-50%);color:#b8c9cf;border:1px solid color-mix(in srgb,#cbdde3 46%,transparent);border-radius:50%;background:#13202a;box-shadow:0 .2rem .45rem #03070b; }
  .descent-station b { font:.65rem/1 system-ui,sans-serif; }
  .descent-station small { position:absolute;left:100%;top:50%;transform:translate(.12rem,-50%);font:.4rem/1 system-ui,sans-serif;color:#9caeb5; }
  .descent-station.lamp { color:#f1d08a;box-shadow:0 0 .55rem color-mix(in srgb,#e0a858 50%,transparent); }
  .descent-station.fresh { border-width:2px;filter:drop-shadow(0 0 .3rem #b8dce7); }
  .ash-core { position:absolute;left:47%;top:44%;width:7rem;display:grid;gap:2px;transform:rotate(-8deg);opacity:.62; }
  .ash-core i { height:2px;background:#b9cbd2; }
  .ash-core .ash { background:#615c5a; }.ash-core .soil { background:#79634d; }.ash-core .shoot { background:#77927a; }
  .valley-feature { position:absolute;left:var(--valley-x);top:var(--valley-y);width:2.4rem;height:1rem;transform:translate(-50%,-50%);border-bottom:2px solid #7e9a93;border-radius:50%;opacity:.78; }
  .valley-feature::before,.valley-feature::after { content:'';position:absolute;bottom:0;width:.45rem;height:.65rem;border:1px solid #9ab7b2;border-bottom:0;border-radius:50% 50% 0 0; }
  .valley-feature::before { left:.35rem; }.valley-feature::after { right:.35rem; }
  .weather-front { position:absolute;z-index:3;left:6%;right:6%;top:28%;height:3.4rem;border-top:1px solid color-mix(in srgb,#d7e8ee 55%,transparent);opacity:.74;animation:front-drift 8s ease-in-out infinite alternate; }
  .weather-front i { position:absolute;inset:.25rem 0 auto;height:1.6rem;background:repeating-linear-gradient(165deg,transparent 0 1.2rem,color-mix(in srgb,#dcecf2 20%,transparent) 1.25rem 1.32rem); }
  .weather-front span { position:absolute;right:2%;top:.25rem;padding:.15rem .3rem;color:#dce9ed;background:#101923;border:1px solid #8298a1;font:700 .45rem/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase; }
  .weather-front.fire-season { border-color:#c57f50; }.weather-front.fire-season i { background:linear-gradient(180deg,color-mix(in srgb,#c57f50 24%,transparent),transparent); }
  .weather-front.still { animation:none; }
  .low-quality .formation-companion,.low-quality .formation-crown { display:none; }
  :global(html[data-contrast='high']) .formation-mass { stroke:white;stroke-width:1.05; }
  :global(html[data-contrast='high']) .formation-detail,:global(html[data-contrast='high']) .formation-shelter { stroke:#dcebf1; }
  :global(html[data-contrast='high']) .formation-route { stroke:#9de5f2; }
  @keyframes formation-breathe { to { translate:0 -.22rem;opacity:.88; } }
  @keyframes front-drift { to { transform:translateX(1.5%);opacity:.9; } }
</style>
