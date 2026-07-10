<script lang="ts">
  import type { Effect, UpgradeDef } from '../content/upgrades'
  import { upgradeUnlocked, synergyBonusMult } from '../engine/compute'
  import { game } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { format } from '../core/format'

  type SynergyEffect = Extract<Effect, { kind: 'synergy' }>
  interface Resonance {
    upgrade: UpgradeDef
    effect: SynergyEffect
  }

  const pack = $derived(universeById(game.activeUniverse))
  const tidefall = $derived(pack.id === 'tidefall')
  const resonances = $derived(
    pack.upgrades.flatMap((upgrade): Resonance[] =>
      upgrade.effects
        .filter((effect): effect is SynergyEffect => effect.kind === 'synergy')
        .map((effect) => ({ upgrade, effect })),
    ),
  )
  const ownedCount = $derived(resonances.filter(({ upgrade }) => game.upgrades.includes(upgrade.id)).length)
  const resonanceScale = $derived(synergyBonusMult(game))

  function position(id: string): { x: number; y: number } {
    const tier = pack.generatorById.get(id)?.tier ?? 1
    return {
      x: 46 + ((tier - 1) % 6) * 110,
      y: 42 + Math.floor((tier - 1) / 6) * 88,
    }
  }

  function state(resonance: Resonance): 'owned' | 'available' | 'locked' {
    if (game.upgrades.includes(resonance.upgrade.id)) return 'owned'
    return upgradeUnlocked(game, resonance.upgrade) ? 'available' : 'locked'
  }

  function liveMultiplier(resonance: Resonance): number {
    if (!game.upgrades.includes(resonance.upgrade.id)) return 1
    return 1 + resonance.effect.value * (game.owned[resonance.effect.per] ?? 0) * resonanceScale
  }
</script>

<section class="atlas" class:tidefall aria-labelledby="resonance-title">
  <header>
    <div>
      <span>{tidefall ? 'the current beneath every current' : 'the economy beneath the economy'}</span>
      <h3 id="resonance-title">{tidefall ? 'Current Atlas' : 'Resonance Atlas'}</h3>
    </div>
    <strong>{ownedCount}/{resonances.length} links awake</strong>
  </header>
  <p>
    {tidefall ? 'No current travels alone. Each sounding makes one source stronger for every glow feeding it upstream.' : 'Kindlings do not work alone. Each line makes one source stronger for every unit owned at its other end.'}
    {#if resonanceScale > 1}<b> Small Vessels doubles every live resonance.</b>{/if}
  </p>

  <div class="chart" aria-label="Generator resonance map">
    <svg viewBox="0 0 642 260" role="img" aria-labelledby="atlas-map-title">
      <title id="atlas-map-title">A map of generator tiers and their active resonance links</title>
      {#each pack.generators.slice(0, -1) as generator, index (generator.id)}
        {@const a = position(generator.id)}
        {@const b = position(pack.generators[index + 1].id)}
        <line class="guide" x1={a.x} y1={a.y} x2={b.x} y2={b.y}></line>
      {/each}
      {#each resonances as resonance (resonance.upgrade.id)}
        {@const source = position(resonance.effect.per)}
        {@const target = position(resonance.effect.gen)}
        <line
          class="link {state(resonance)}"
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
        ></line>
      {/each}
      {#each pack.generators as generator (generator.id)}
        {@const point = position(generator.id)}
        {@const active = (game.owned[generator.id] ?? 0) > 0}
        <g class:active transform={`translate(${point.x} ${point.y})`}>
          <circle r="8" style:--node-hue={generator.hue}></circle>
          <text y="19" text-anchor="middle">{generator.tier}</text>
        </g>
      {/each}
    </svg>
    <div class="legend" aria-hidden="true">
      <span class="owned">awake</span><span class="available">discovered</span><span class="locked">unseen</span>
    </div>
  </div>

  <div class="links">
    {#each resonances as resonance (resonance.upgrade.id)}
      {@const status = state(resonance)}
      {@const source = pack.generatorById.get(resonance.effect.per)!}
      {@const target = pack.generatorById.get(resonance.effect.gen)!}
      <article class={status}>
        <span class="route"><i style:--node-hue={source.hue}></i>{source.name}<b>→</b><i style:--node-hue={target.hue}></i>{target.name}</span>
        <strong>{resonance.upgrade.name}</strong>
        <em>{resonance.upgrade.flavor}</em>
        <span class="formula">+{(resonance.effect.value * 100).toFixed(1)}% per {source.name}</span>
        {#if status === 'owned'}
          <span class="live">×{format(liveMultiplier(resonance))} now · {game.owned[source.id] ?? 0} feeding</span>
        {:else if status === 'available'}
          <span class="price">discovered · {pack.currencyGlyph} {format(resonance.upgrade.cost)}</span>
        {:else}
          <span class="price">reveals at {resonance.upgrade.unlock.count ?? 1} {target.name}</span>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .atlas {
    margin-top: 1.15rem;
    padding: 0.85rem;
    border: 1px solid rgba(122, 205, 238, 0.16);
    border-radius: 14px;
    background: radial-gradient(circle at 50% 0%, rgba(85, 180, 224, 0.08), transparent 42%), rgba(5, 11, 20, 0.46);
  }
  header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }
  header span {
    display: block;
    margin-bottom: 0.16rem;
    font-size: 0.58rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #7297aa;
  }
  h3 {
    margin: 0;
    color: #a8dff2;
  }
  header strong {
    font-size: 0.7rem;
    color: #bfeaff;
    font-variant-numeric: tabular-nums;
  }
  p {
    margin: 0.55rem 0 0.7rem;
    font-family: Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.45;
    color: #9ab7c5;
  }
  p b { color: #ffd98a; font-weight: 500; }
  .chart {
    padding: 0.35rem 0.45rem 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 12px;
    background: rgba(1, 4, 10, 0.56);
  }
  svg { display: block; width: 100%; height: auto; overflow: visible; }
  .guide { stroke: rgba(255, 255, 255, 0.035); stroke-width: 1; }
  .link { stroke-width: 1.7; stroke-linecap: round; }
  .link.locked { stroke: rgba(110, 130, 146, 0.13); stroke-dasharray: 3 5; }
  .link.available { stroke: rgba(117, 205, 236, 0.5); stroke-dasharray: 4 4; }
  .link.owned { stroke: #ffd98a; filter: drop-shadow(0 0 4px rgba(255, 205, 120, 0.65)); }
  circle {
    fill: hsl(var(--node-hue), 24%, 16%);
    stroke: hsla(var(--node-hue), 55%, 62%, 0.42);
    stroke-width: 1.2;
  }
  g.active circle {
    fill: hsl(var(--node-hue), 72%, 64%);
    stroke: #fff;
    filter: drop-shadow(0 0 5px hsla(var(--node-hue), 90%, 65%, 0.7));
  }
  text { fill: rgba(205, 222, 232, 0.55); font: 600 8px system-ui, sans-serif; }
  .legend { display: flex; justify-content: center; gap: 1rem; font-size: 0.61rem; color: #78909d; }
  .legend span::before { content: ''; display: inline-block; width: 1.3rem; margin-right: 0.3rem; vertical-align: middle; border-top: 2px solid; }
  .legend .owned::before { border-color: #ffd98a; }
  .legend .available::before { border-color: rgba(117, 205, 236, 0.7); border-style: dashed; }
  .legend .locked::before { border-color: rgba(110, 130, 146, 0.25); border-style: dashed; }
  .links { display: grid; grid-template-columns: 1fr 1fr; gap: 0.42rem; margin-top: 0.55rem; }
  article { display: flex; flex-direction: column; gap: 0.12rem; padding: 0.55rem 0.65rem; border: 1px solid rgba(255,255,255,0.055); border-radius: 9px; background: rgba(255,255,255,0.018); }
  article.owned { border-color: rgba(255, 217, 138, 0.28); background: rgba(255, 217, 138, 0.035); }
  article.available { border-color: rgba(117, 205, 236, 0.22); }
  article.locked { opacity: 0.5; }
  .route { display: flex; align-items: center; gap: 0.3rem; font-size: 0.58rem; color: #8199a6; }
  .route i { width: 0.42rem; height: 0.42rem; border-radius: 50%; background: hsl(var(--node-hue), 78%, 65%); box-shadow: 0 0 5px hsla(var(--node-hue), 80%, 65%, 0.55); }
  .route b { color: #607987; }
  article strong { font-size: 0.78rem; color: #dbeaf0; }
  article em { font-family: Georgia, serif; font-size: 0.65rem; color: #788f9b; }
  .formula, .live, .price { font-size: 0.65rem; }
  .formula { color: #8bcde6; }
  .live { color: #ffd98a; font-weight: 650; }
  .price { color: #7797a7; }
  .atlas.tidefall { border-color: rgba(88, 222, 216, 0.2); background: radial-gradient(ellipse at 50% 0%, rgba(51, 181, 184, 0.1), transparent 46%), rgba(2, 15, 24, 0.54); }
  .tidefall header span { color: rgba(88, 222, 216, 0.58); }
  .tidefall h3 { color: #c9fff7; }
  .tidefall header strong { color: #b9fff2; }
  .tidefall .chart { background: radial-gradient(ellipse at 50% 50%, rgba(54, 156, 166, 0.08), transparent 62%), rgba(0, 8, 16, 0.62); }
  .tidefall .guide { stroke: rgba(88, 222, 216, 0.05); }
  .tidefall .link.owned { stroke: #8dfff0; filter: drop-shadow(0 0 4px rgba(88, 222, 216, 0.7)); }
  .tidefall .legend .owned::before { border-color: #8dfff0; }
  .tidefall article.owned { border-color: rgba(88, 222, 216, 0.28); background: rgba(42, 160, 163, 0.045); }
  .tidefall .live { color: #b9fff2; }
  @media (max-width: 620px) {
    .links { grid-template-columns: 1fr; }
    header { align-items: start; }
    header strong { text-align: right; }
  }
</style>
