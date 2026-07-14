<script lang="ts">
  import { onMount } from 'svelte'
  import { game } from '../engine/game.svelte'
  import { MEMENTOS, type MementoRealm } from '../content/mementos'
  import { visitedUniverseIds } from '../content/vessel'
  import { UNIVERSES, type UniverseId } from '../content/universes'
  import { containModalKeydown } from '../accessibility/modal-focus'
  import MementoArtifact from './MementoArtifact.svelte'

  let { onclose }: { onclose: () => void } = $props()
  let filter = $state<'all' | MementoRealm>('all')
  let selectedId = $state(game.mementos.at(-1) ?? MEMENTOS[0].id)
  let dialog: HTMLElement

  onMount(() => queueMicrotask(() => dialog?.focus()))

  const held = $derived(new Set(game.mementos))
  const knownUniverseIds = $derived(new Set(visitedUniverseIds(game)))
  const knownMementos = $derived(MEMENTOS.filter((memento) => (
    memento.realm === 'legacy' ? held.has(memento.id) : knownUniverseIds.has(memento.realm)
  )))
  const visibleMementos = $derived(filter === 'all' ? knownMementos : knownMementos.filter((memento) => memento.realm === filter))
  const availableRealms = $derived([
    ...UNIVERSES.filter(({ id }) => knownUniverseIds.has(id)).map(({ id }) => id as UniverseId),
    ...(knownMementos.some(({ realm }) => realm === 'legacy') ? ['legacy' as const] : []),
  ])
  const selected = $derived(visibleMementos.find(({ id }) => id === selectedId) ?? visibleMementos[0] ?? knownMementos[0] ?? MEMENTOS[0])
  const selectedHeld = $derived(held.has(selected.id))
  const knownHeldCount = $derived(knownMementos.filter(({ id }) => held.has(id)).length)
  const completion = $derived(Math.round(knownHeldCount / Math.max(1, knownMementos.length) * 100))

  $effect(() => {
    if (!visibleMementos.some((memento) => memento.id === selectedId)) {
      selectedId = visibleMementos[0]?.id ?? knownMementos[0]?.id ?? MEMENTOS[0].id
    }
  })

  function realmName(realm: MementoRealm): string {
    if (realm === 'legacy') return 'Between Worlds'
    return UNIVERSES.find((universe) => universe.id === realm)?.shortName ?? realm
  }

  function realmGlyph(realm: MementoRealm): string {
    if (realm === 'legacy') return '◇'
    return UNIVERSES.find((universe) => universe.id === realm)?.currencyGlyph ?? '·'
  }

  function setCount(realm: MementoRealm): { found: number; total: number } {
    const set = knownMementos.filter((memento) => memento.realm === realm)
    return { found: set.filter((memento) => held.has(memento.id)).length, total: set.length }
  }
</script>

<div
  bind:this={dialog}
  class="gallery instrument-panel"
  role="dialog"
  aria-modal="true"
  aria-labelledby="memento-title"
  tabindex="-1"
  onkeydown={(event) => containModalKeydown(event, dialog, onclose)}
>
  <header class="gallery-head">
    <div>
      <span>objects carried by memory · no power · no expiry</span>
      <h2 id="memento-title">The Cabinet Between Worlds</h2>
      <p>Small things that survived large changes. Every object is found through play and kept through Remembrance.</p>
    </div>
    <div class="completion" aria-label={`${knownHeldCount} of ${knownMementos.length} known Mementos found`}>
      <strong>{completion}%</strong>
      <span>{knownHeldCount} / {knownMementos.length} known</span>
      <progress value={knownHeldCount} max={knownMementos.length}></progress>
    </div>
    <button class="close" aria-label="Close the Memento gallery" onclick={onclose}>✕</button>
  </header>

  <section class="set-dashboard" aria-label="Memento sets">
    {#each availableRealms as realm (realm)}
      {@const count = setCount(realm)}
      <button class:active={filter === realm} onclick={() => (filter = realm)} aria-pressed={filter === realm}>
        <i aria-hidden="true">{realmGlyph(realm)}</i>
        <span>{realmName(realm)}<small>{count.found}/{count.total}</small></span>
        <b style={`--set-progress:${count.found / count.total}`}></b>
      </button>
    {/each}
  </section>

  <nav class="filters" aria-label="Filter Mementos">
    <button class:active={filter === 'all'} aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>All objects</button>
    <span>{filter === 'all' ? 'Objects from realms already carried in memory' : `${realmName(filter)} set`}</span>
  </nav>

  <div class="gallery-body">
    <section class="object-grid" aria-label={`${filter === 'all' ? 'All' : realmName(filter)} Mementos`}>
      {#each visibleMementos as memento (memento.id)}
        {@const unlocked = held.has(memento.id)}
        <button
          class="object-card"
          class:unlocked
          class:selected={selected.id === memento.id}
          aria-pressed={selected.id === memento.id}
          aria-label={unlocked ? `${memento.name}, found` : `${memento.name}, not yet found`}
          onclick={() => (selectedId = memento.id)}
        >
          <MementoArtifact {memento} locked={!unlocked} reducedMotion={game.motionPreference === 'reduced'} />
          <span>{realmGlyph(memento.realm)} {realmName(memento.realm)}</span>
          <strong>{memento.name}</strong>
          <small>{unlocked ? memento.provenance : memento.hint}</small>
        </button>
      {/each}
    </section>

    <aside class="object-detail" class:unlocked={selectedHeld} aria-live="polite">
      <span>{realmGlyph(selected.realm)} {realmName(selected.realm)} · {selected.milestone}</span>
      <MementoArtifact memento={selected} locked={!selectedHeld} large reducedMotion={game.motionPreference === 'reduced'} />
      <div>
        <h3>{selected.name}</h3>
        {#if selectedHeld}
          <em>{selected.provenance}</em>
          <p>{selected.story}</p>
          <strong>Held in memory</strong>
        {:else}
          <em>Its outline is present; its history has not arrived.</em>
          <p>{selected.hint}</p>
          <strong>Not yet found</strong>
        {/if}
      </div>
      <footer>Collection only · grants no production · gates no story</footer>
    </aside>
  </div>
</div>

<style>
  .gallery { position: fixed; z-index: 18; inset: 2.2rem 3vw 2.5rem; display: grid; grid-template-rows: auto auto auto 1fr; overflow: hidden; color: var(--gold); background: radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--amber) 8%, transparent), transparent 32%), color-mix(in srgb, var(--panel) 96%, #03050a); border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: 1.2rem; box-shadow: 0 2rem 8rem rgba(0,0,0,.78), inset 0 1px rgba(255,255,255,.04); }
  button { color: inherit; font: inherit; }
  .gallery-head { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1.2rem; padding: 1rem 1.2rem .9rem; border-bottom: 1px solid rgba(255,255,255,.065); }
  .gallery-head > div:first-child > span { display: block; color: var(--dim); font-size: .58rem; letter-spacing: .16em; text-transform: uppercase; }
  h2, h3, p { margin: 0; }
  h2 { margin-top: .12rem; font: italic clamp(1.35rem, 2.2vw, 2rem) Fraunces, Georgia, serif; }
  .gallery-head p { max-width: 46rem; margin-top: .2rem; color: var(--dim); font: italic .72rem/1.4 Fraunces, Georgia, serif; }
  .completion { display: grid; min-width: 10rem; text-align: right; }
  .completion strong { font: 600 1.25rem Fraunces, Georgia, serif; }
  .completion span { color: var(--dim); font-size: .58rem; letter-spacing: .08em; text-transform: uppercase; }
  progress { width: 100%; height: .2rem; margin-top: .4rem; accent-color: var(--amber); }
  .close { width: 2.25rem; height: 2.25rem; padding: 0; color: var(--gold); background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.1); border-radius: 50%; cursor: pointer; }
  button:hover, button:focus-visible { border-color: color-mix(in srgb, var(--amber) 66%, transparent); outline: none; }
  button:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--amber) 55%, transparent); }

  .set-dashboard { display: grid; grid-template-columns: repeat(8, 1fr); gap: .35rem; padding: .55rem 1rem; background: rgba(0,0,0,.2); border-bottom: 1px solid rgba(255,255,255,.05); }
  .set-dashboard button { position: relative; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .4rem; min-width: 0; overflow: hidden; padding: .42rem .5rem .5rem; text-align: left; background: rgba(255,255,255,.018); border: 1px solid transparent; border-radius: .55rem; cursor: pointer; }
  .set-dashboard button.active { background: color-mix(in srgb, var(--amber) 8%, transparent); border-color: color-mix(in srgb, var(--amber) 30%, transparent); }
  .set-dashboard i { width: 1.45rem; color: var(--amber); font-size: 1rem; font-style: normal; text-align: center; }
  .set-dashboard span { min-width: 0; overflow: hidden; font-size: .59rem; text-overflow: ellipsis; white-space: nowrap; }
  .set-dashboard small { display: block; color: var(--dim); font-size: .5rem; }
  .set-dashboard b { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; transform: scaleX(var(--set-progress)); transform-origin: left; background: var(--amber); }
  .filters { display: flex; align-items: center; gap: .7rem; padding: .45rem 1rem; border-bottom: 1px solid rgba(255,255,255,.05); }
  .filters button { padding: .35rem .65rem; background: transparent; border: 1px solid rgba(255,255,255,.08); border-radius: 999px; cursor: pointer; }
  .filters button.active { border-color: var(--amber); }
  .filters span { color: var(--dim); font-size: .62rem; }

  .gallery-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 25vw); min-height: 0; }
  .object-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: .6rem; align-content: start; overflow-y: auto; padding: 1rem; scrollbar-width: thin; }
  .object-card { display: grid; grid-template-rows: auto auto auto 1fr; min-width: 0; min-height: 14.5rem; padding: .5rem .6rem .7rem; text-align: left; background: linear-gradient(145deg, rgba(255,255,255,.028), rgba(0,0,0,.12)); border: 1px solid rgba(255,255,255,.06); border-radius: .85rem; cursor: pointer; transition: translate .16s ease, border-color .16s ease, background .16s ease; }
  .object-card:hover { translate: 0 -.15rem; }
  .object-card.unlocked { border-color: color-mix(in srgb, var(--amber) 19%, rgba(255,255,255,.07)); background: radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--amber) 6%, transparent), transparent 43%), rgba(255,255,255,.022); }
  .object-card.selected { border-color: color-mix(in srgb, var(--amber) 62%, transparent); box-shadow: inset 0 0 1.4rem color-mix(in srgb, var(--amber) 5%, transparent); }
  .object-card :global(.artifact) { width: 7.5rem; margin: 0 auto -.2rem; }
  .object-card > span { color: var(--dim); font-size: .5rem; letter-spacing: .1em; text-transform: uppercase; }
  .object-card > strong { margin-top: .16rem; font: 600 .72rem/1.25 Fraunces, Georgia, serif; }
  .object-card > small { margin-top: .28rem; color: var(--dim); font: italic .58rem/1.35 Fraunces, Georgia, serif; }

  .object-detail { position: relative; display: grid; grid-template-rows: auto auto 1fr auto; justify-items: center; min-height: 0; padding: 1.1rem; overflow-y: auto; text-align: center; background: radial-gradient(circle at 50% 31%, color-mix(in srgb, var(--amber) 7%, transparent), transparent 40%), rgba(0,0,0,.21); border-left: 1px solid rgba(255,255,255,.06); }
  .object-detail > span { color: var(--dim); font-size: .56rem; letter-spacing: .13em; text-transform: uppercase; }
  .object-detail > div { align-self: start; }
  .object-detail h3 { font: italic 1.35rem/1.15 Fraunces, Georgia, serif; }
  .object-detail em { display: block; margin-top: .4rem; color: color-mix(in srgb, var(--amber) 66%, var(--dim)); font: italic .72rem/1.4 Fraunces, Georgia, serif; }
  .object-detail p { margin-top: .65rem; color: var(--dim); font: .72rem/1.55 Inter, sans-serif; }
  .object-detail div > strong { display: inline-block; margin-top: .8rem; padding: .3rem .55rem; color: var(--amber); border: 1px solid color-mix(in srgb, var(--amber) 25%, transparent); border-radius: 999px; font-size: .55rem; letter-spacing: .1em; text-transform: uppercase; }
  .object-detail footer { align-self: end; margin-top: 1rem; color: color-mix(in srgb, var(--dim) 72%, transparent); font-size: .5rem; letter-spacing: .08em; text-transform: uppercase; }

  @media (max-width: 950px) {
    .gallery { inset: .5rem; }
    .set-dashboard { grid-template-columns: repeat(4, 1fr); }
    .gallery-body { grid-template-columns: 1fr minmax(16rem, 34vw); }
  }
  @media (max-width: 700px) {
    .gallery { grid-template-rows: auto auto auto 1fr; }
    .gallery-head { grid-template-columns: 1fr auto; }
    .gallery-head .completion { grid-column: 1 / -1; grid-row: 2; text-align: left; }
    .gallery-head .close { grid-column: 2; grid-row: 1; }
    .set-dashboard { display: flex; overflow-x: auto; }
    .set-dashboard button { flex: 0 0 7.5rem; }
    .gallery-body { display: block; overflow-y: auto; }
    .object-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: visible; }
    .object-card { min-height: 13.5rem; }
    .object-detail { border-top: 1px solid rgba(255,255,255,.07); border-left: 0; }
    .filters span { display: none; }
  }
  @media (max-width: 390px) {
    .object-grid { grid-template-columns: 1fr; }
  }
  :global([data-motion='reduced']) .object-card { transition: none; }
</style>
