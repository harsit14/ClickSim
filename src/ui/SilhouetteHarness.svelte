<script lang="ts">
  import { EMBERLIGHT_SET_PIECES } from '../render/emberlight/set-piece-registry'
  import SetPieceArt from './SetPieceArt.svelte'
  import ChamberLandmarkSilhouette from './ChamberLandmarkSilhouette.svelte'
  import { CHAMBER_ARCHIVE_MARKS } from '../render/chamber-archive-marks'

  const stages = EMBERLIGHT_SET_PIECES.flatMap((setPiece) => setPiece.stages.map((stage) => ({
    setPieceId: setPiece.id,
    setPieceName: setPiece.name,
    stage,
  })))
  const requested = new URLSearchParams(window.location.search).get('silhouettes')
  const chamberArchiveMode = requested === 'chamber-archives'
  let selectedId = $state(stages.some(({ stage }) => stage.objectId === requested) ? requested! : stages[0].stage.objectId)
  const selected = $derived(stages.find(({ stage }) => stage.objectId === selectedId) ?? stages[0])
  const sizes = [32, 64, 128] as const
</script>

{#if chamberArchiveMode}
<main class="silhouette-harness">
  <header><div><span>PHASE 3 · BUILD GATE</span><h1>Chamber landmark silhouettes</h1></div></header>
  <section class="contact-sheet chamber-sheet" aria-label="All chamber Archive silhouettes at 32 pixels">
    {#each CHAMBER_ARCHIVE_MARKS as mark (mark.id)}
      <article>
        <div><ChamberLandmarkSilhouette id={mark.id} universeId={mark.universeId} silhouette /></div>
        <strong>{mark.label}</strong>
        <small>{mark.universeId}</small>
      </article>
    {/each}
  </section>
</main>
{:else}
<main class="silhouette-harness">
  <header>
    <div><span>PHASE 1 · BUILD GATE</span><h1>Emberlight silhouette harness</h1></div>
    <label>Object
      <select bind:value={selectedId}>
        {#each stages as entry (entry.stage.objectId)}
          <option value={entry.stage.objectId}>{entry.stage.name} · {entry.setPieceName}</option>
        {/each}
      </select>
    </label>
  </header>

  <section class="inspection" aria-labelledby="selected-silhouette">
    <div>
      <span>{selected.setPieceName}</span>
      <h2 id="selected-silhouette">{selected.stage.name}</h2>
      <code>{selected.stage.objectId}</code>
      <p>Entrance: {selected.stage.entrance}. Every preview is the same authored path asset rendered flat black on white.</p>
    </div>
    <div class="sizes">
      {#each sizes as size}
        <figure>
          <div style={`width:${size}px;height:${size}px`}>
            <SetPieceArt stage={selected.stage} silhouette />
          </div>
          <figcaption>{size}px</figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section class="contact-sheet" aria-label="All Emberlight Kindling silhouettes at 32 pixels">
    {#each stages as entry (entry.stage.objectId)}
      <article class:selected={entry.stage.objectId === selectedId}>
        <div><SetPieceArt stage={entry.stage} silhouette /></div>
        <strong>{entry.stage.name}</strong>
        <small>{entry.setPieceName}</small>
      </article>
    {/each}
  </section>
</main>
{/if}

<style>
  :global(html), :global(body) { overflow: auto; background: #ecebe7; color: #151515; user-select: text; }
  .silhouette-harness { min-height: 100vh; padding: 1.25rem; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; max-width: 70rem; margin: 0 auto 1rem; }
  header span { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.16em; }
  h1, h2, p { margin: 0; } h1 { margin-top: 0.18rem; font-size: 1.45rem; }
  label { display: grid; gap: 0.25rem; min-width: min(25rem, 46vw); font-size: 0.72rem; font-weight: 750; }
  select { padding: 0.55rem; color: #151515; background: white; border: 1px solid #777; border-radius: 0.35rem; }
  .inspection { max-width: 70rem; margin: 0 auto 1rem; display: grid; grid-template-columns: minmax(15rem, 1fr) 2fr; gap: 1rem; padding: 1rem; background: white; border: 1px solid #aaa; }
  .inspection span { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .inspection h2 { margin: 0.18rem 0; font-size: 1.2rem; }
  .inspection code { font-size: 0.72rem; }
  .inspection p { max-width: 36rem; margin-top: 0.5rem; color: #555; font-size: 0.76rem; line-height: 1.45; }
  .sizes { display: flex; align-items: end; justify-content: center; gap: clamp(1rem, 4vw, 3rem); }
  figure { margin: 0; display: grid; justify-items: center; gap: 0.45rem; }
  figure > div { display: grid; place-items: center; }
  figcaption { font: 700 0.65rem/1 ui-monospace, monospace; }
  .contact-sheet { max-width: 70rem; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: 0.45rem; }
  .chamber-sheet { max-width:86rem;grid-template-columns:repeat(8,minmax(7.5rem,1fr)); }
  article { display: grid; grid-template-columns: 2.5rem 1fr; grid-template-rows: auto auto; gap: 0.12rem 0.55rem; align-items: center; min-height: 4rem; padding: 0.55rem; background: white; border: 1px solid #bbb; }
  article.selected { outline: 3px solid #151515; outline-offset: -3px; }
  article > div { grid-row: 1 / 3; width: 32px; height: 32px; }
  article strong { align-self: end; font-size: 0.72rem; }
  article small { align-self: start; color: #666; font-size: 0.58rem; }
  @media (max-width: 700px) { header, .inspection { grid-template-columns: 1fr; display: grid; } label { min-width: 0; width: 100%; } .sizes { justify-content: start; } }
</style>
