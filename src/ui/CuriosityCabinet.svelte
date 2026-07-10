<script lang="ts">
  import { onMount } from 'svelte'
  import {
    completedCuriosityShelves,
    curiosityShelfComplete,
    curiosityShelfProgress,
    protostarFuelCost,
    type CuriosityDef,
    type CuriosityShelfDef,
  } from '../content/curiosities'
  import {
    game,
    buyCuriosity,
    collectCometReturn,
    fuelProtostar,
    protostarFueled,
    passiveRatePerSec,
    cometProgress,
  } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playBuy, playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'
  import { universeById } from '../content/universes'
  import {
    amountFromNumber,
    gteAmount,
    isZeroAmount,
  } from '../core/numeric/amount'
  import ArchiveRecordArt from './ArchiveRecordArt.svelte'

  let { onclose }: { onclose: () => void } = $props()
  let now = $state(Date.now())
  let letterOpen = $state(false)
  let closeButton: HTMLButtonElement
  const pack = $derived(universeById(game.activeUniverse))
  const cabinet = $derived(pack.cabinet)

  onMount(() => {
    closeButton.focus()
    const timer = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(timer)
  })

  const held = (id: string) => game.curiosities.includes(id)
  const revealed = (c: CuriosityDef) => held(c.id) || gteAmount(game.totalEarned, amountFromNumber(c.cost * 0.25))
  const shelfOpen = (shelf: CuriosityShelfDef) =>
    shelf.index === 'I' || shelf.ids.some((id) => revealed(cabinet.itemById.get(id)!))
  const shelfDone = (shelf: CuriosityShelfDef) => curiosityShelfComplete(game.curiosities, shelf.id, cabinet)
  const shelfCount = (shelf: CuriosityShelfDef) => curiosityShelfProgress(game.curiosities, shelf, cabinet)

  const ownedCount = $derived(cabinet.items.filter((c) => held(c.id)).length)
  const completedShelves = $derived(completedCuriosityShelves(game.curiosities, cabinet))
  const resonancePercent = $derived(
    Math.round(ownedCount * cabinet.resonancePerItem * 100),
  )
  const cabinetLine = $derived.by(() => {
    if (ownedCount === cabinet.items.length) return cabinet.lines.complete
    if (completedShelves >= 2) return cabinet.lines.cosmology
    if (completedShelves >= 1) return cabinet.lines.chapter
    if (ownedCount > 0) return cabinet.lines.first
    return cabinet.lines.empty
  })

  const fueled = $derived(protostarFueled(now))
  const fuelLeft = $derived(Math.max(0, game.keeperFedUntil - now))
  const fuelCost = $derived(protostarFuelCost(passiveRatePerSec()))
  const cometReady = $derived(cometProgress(now) >= 1)

  function fmtDuration(ms: number): string {
    const total = Math.ceil(ms / 1000)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  function tryBuy(id: string) {
    const curiosity = cabinet.itemById.get(id)
    const shelf = cabinet.shelves.find((entry) => entry.ids.includes(id))
    if (!curiosity || !buyCuriosity(id)) return
    playBuy()
    save()
    if (shelf && shelfDone(shelf)) {
      pushToast(`${shelf.rewardName} awakened`, shelf.reward, 'cabinet complete')
    } else {
      pushToast(`${curiosity.name} catalogued`, curiosity.flavor, 'celestial archive')
    }
  }

  function tryFuel() {
    if (!fuelProtostar()) return
    playBuy()
    save()
    pushToast(`${cabinet.items.find(({ kind }) => kind === 'hearthkeeper')?.name ?? 'Nursery'} sustained`, `Core stable for ${cabinet.fuelHours} hours.`, cabinet.title)
  }

  function tryCollectComet() {
    const amount = collectCometReturn()
    if (isZeroAmount(amount)) return
    playCollect()
    save()
    const title = cabinet.id === 'tidefall' ? 'The leviathan returns' : 'The comet returns'
    const carrier = cabinet.id === 'tidefall' ? 'wake' : 'tail'
    pushToast(title, `${pack.currencyGlyph} ${format(amount)} carried home in its ${carrier}.`, cabinet.title)
  }
</script>

<section class="cabinet" class:tidefall={cabinet.id === 'tidefall'} aria-labelledby="cabinet-title">
  <header class="cabinet-header">
    <div>
      <span class="kicker">{cabinet.surveyLabel}</span>
      <h2 id="cabinet-title">{cabinet.title}</h2>
    </div>
    <button bind:this={closeButton} class="close" aria-label={`close ${cabinet.title}`} onclick={onclose}>×</button>
  </header>

  <div class="ledger">
    <div class="count">
      <strong>{ownedCount}<span>/{cabinet.items.length}</span></strong>
      <small>catalogued</small>
    </div>
    <div class="progress-copy">
      <div
        class="progress-track"
        role="progressbar"
        aria-label="Cabinet collection progress"
        aria-valuemin="0"
        aria-valuemax={cabinet.items.length}
        aria-valuenow={ownedCount}
      >
        <span style:width={`${(ownedCount / cabinet.items.length) * 100}%`}></span>
      </div>
      <p>{cabinetLine}</p>
    </div>
    <dl>
      <div><dt>resonance</dt><dd>+{resonancePercent}% all production</dd></div>
      <div><dt>shelves awake</dt><dd>{completedShelves}/{cabinet.shelves.length}</dd></div>
    </dl>
  </div>

  <div class="shelves">
    {#each cabinet.shelves as shelf (shelf.id)}
      {@const open = shelfOpen(shelf)}
      {@const complete = shelfDone(shelf)}
      <section class="shelf" class:complete class:sealed={!open} aria-labelledby={`shelf-${shelf.id}`}>
        <header class="shelf-header">
          <span class="chapter">shelf {shelf.index}</span>
          <div class="shelf-title">
            <h3 id={`shelf-${shelf.id}`}>{open ? shelf.name : 'An Uncharted Sky'}</h3>
            <span class="shelf-count">{shelfCount(shelf)}/{shelf.ids.length}</span>
          </div>
          <p>{open ? shelf.lore : 'The survey plate is dark. No signal has resolved at this distance.'}</p>
          <div class="reward" class:awake={complete}>
            <span class="reward-mark">{complete ? '✦' : '◇'}</span>
            <span><strong>{open ? shelf.rewardName : 'unknown resonance'}</strong>{open ? shelf.reward : 'complete the shelf to awaken it'}</span>
          </div>
        </header>

        {#if open}
          <div class="objects">
            {#each shelf.ids as id (id)}
              {@const c = cabinet.itemById.get(id)!}
              {@const owned = held(id)}
              {@const near = revealed(c)}
              <article
                class="object"
                class:owned
                class:near
                class:veiled={!near}
                class:has-special={owned && !!c.kind}
                style:--hue={c.hue}
              >
                <span class="object-art" class:veiled-art={!near}>
                  <ArchiveRecordArt id={c.id} hue={c.hue} universeId={pack.id} unresolved={!owned} />
                </span>
                <div class="object-copy">
                  <small>{owned ? c.classification : near ? 'unresolved astronomical signal' : 'no signal acquired'}</small>
                  <strong>{owned ? c.name : near ? 'Unresolved phenomenon' : 'Uncharted coordinate'}</strong>
                  <em>{owned ? c.flavor : near ? 'The signal is strong enough to catalogue.' : 'Not every quiet coordinate is empty.'}</em>
                  {#if owned}<p class="record">{c.record}</p>{/if}
                  <span class="effect">{owned ? c.desc : near ? `resolve for ${pack.currencyGlyph} ${format(c.cost)}` : `signal appears near ${pack.currencyGlyph} ${format(c.cost * 0.25)} lifetime`}</span>
                </div>

                {#if owned}
                  <span class="held">catalogued</span>
                {:else if near}
                  <button class="buy" disabled={game.challenge !== null || !gteAmount(game.light, amountFromNumber(c.cost))} onclick={() => tryBuy(c.id)}>
                    catalogue <span>{pack.currencyGlyph} {format(c.cost)}</span>
                  </button>
                {:else}
                  <span class="sleeping">unresolved</span>
                {/if}

                {#if owned && c.kind === 'hearthkeeper'}
                  <div class="special">
                    <span>{fueled ? `core stable for ${fmtDuration(fuelLeft)}` : cabinet.id === 'tidefall' ? 'nursery awaiting current' : 'core awaiting fuel'}</span>
                    <button class="small" disabled={game.challenge !== null || !gteAmount(game.light, fuelCost)} onclick={tryFuel}>
                      {cabinet.id === 'tidefall' ? 'feed nursery' : 'fuel core'} <span>{pack.currencyGlyph} {format(fuelCost)}</span>
                    </button>
                  </div>
                {:else if owned && c.kind === 'snail'}
                  <div class="special">
                    <span>{cometReady ? (cabinet.id === 'tidefall' ? 'the leviathan has returned' : 'the comet has returned') : `${Math.floor(cometProgress(now) * 100)}% through its ${cabinet.id === 'tidefall' ? 'migration' : 'orbit'}`}</span>
                    <button class="small" disabled={game.challenge !== null || !cometReady} onclick={tryCollectComet}>
                      {cabinet.id === 'tidefall' ? 'gather wake' : 'gather tail'}
                    </button>
                  </div>
                {:else if owned && c.kind === 'letter'}
                  <div class="special letter">
                    <button class="small" aria-expanded={letterOpen} onclick={() => (letterOpen = !letterOpen)}>
                      {letterOpen ? 'close archive record' : cabinet.id === 'tidefall' ? 'decode tide record' : 'decode spectral record'}
                    </button>
                    {#if letterOpen}
                      <p>{cabinet.archiveRecord}</p>
                    {/if}
                  </div>
                {:else if owned && c.kind === 'door'}
                  <div class="special">
                    <span>{gteAmount(game.allTimeEarned, amountFromNumber(1e30)) ? (cabinet.id === 'tidefall' ? 'the black mouth is readable' : 'the event horizon is readable') : 'the horizon returns no signal'}</span>
                  </div>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/each}
  </div>
</section>

<style>
  .cabinet {
    position: fixed;
    left: 1.1rem;
    top: 5.2rem;
    bottom: 4.2rem;
    width: min(36rem, calc(100vw - 2.2rem));
    overflow-y: auto;
    padding: 1.15rem;
    color: var(--text);
    background:
      linear-gradient(145deg, rgba(32, 27, 48, 0.96), rgba(11, 10, 20, 0.94)),
      var(--panel);
    border: 1px solid rgba(255, 217, 138, 0.18);
    border-radius: 18px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42), inset 0 1px rgba(255, 255, 255, 0.035);
    backdrop-filter: blur(16px);
    z-index: 6;
    scrollbar-width: thin;
    animation: cabinet-in 0.5s cubic-bezier(0.2, 0.8, 0.25, 1) both;
  }
  @keyframes cabinet-in {
    from { opacity: 0; transform: translateX(-18px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .cabinet-header {
    position: sticky;
    top: -1.15rem;
    z-index: 4;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin: -1.15rem -1.15rem 0;
    padding: 1.15rem;
    background: linear-gradient(180deg, rgba(27, 23, 42, 0.99), rgba(20, 17, 32, 0.95));
    border-bottom: 1px solid rgba(255, 255, 255, 0.055);
    backdrop-filter: blur(14px);
  }
  .kicker,
  .chapter {
    display: block;
    margin-bottom: 0.22rem;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 217, 138, 0.62);
  }
  h2,
  h3,
  p { margin: 0; }
  h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.45rem;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  .close {
    width: 2.2rem;
    height: 2.2rem;
    padding: 0;
    font: inherit;
    font-size: 1.2rem;
    color: var(--dim);
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    cursor: pointer;
  }
  .close:hover,
  .close:focus-visible { color: #fff; border-color: rgba(255, 217, 138, 0.34); outline: none; }

  .ledger {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.7rem 1rem;
    margin-top: 1rem;
    padding: 0.9rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 13px;
  }
  .count { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 4rem; }
  .count strong { font-size: 1.55rem; color: var(--gold); font-variant-numeric: tabular-nums; }
  .count strong span { font-size: 0.78rem; color: var(--dim); }
  .count small { font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dim); }
  .progress-copy { min-width: 0; }
  .progress-track {
    height: 3px;
    margin: 0.25rem 0 0.55rem;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 999px;
  }
  .progress-track span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--amber), #e7d6ff);
    box-shadow: 0 0 12px rgba(255, 179, 92, 0.6);
    transition: width 0.5s ease;
  }
  .progress-copy p {
    font-family: Georgia, serif;
    font-size: 0.78rem;
    font-style: italic;
    line-height: 1.45;
    color: rgba(205, 199, 222, 0.78);
  }
  dl {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 0;
  }
  dl div { display: flex; justify-content: space-between; gap: 0.5rem; padding-top: 0.6rem; border-top: 1px solid rgba(255, 255, 255, 0.055); }
  dt { font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dim); }
  dd { margin: 0; font-size: 0.68rem; font-weight: 700; color: rgba(255, 217, 138, 0.9); }

  .shelves { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.85rem; }
  .shelf {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.018);
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 14px;
  }
  .shelf.complete { border-color: rgba(255, 217, 138, 0.23); box-shadow: inset 0 0 30px rgba(255, 179, 92, 0.035); }
  .shelf.sealed { opacity: 0.55; }
  .shelf-header { padding: 0.78rem 0.82rem 0.7rem; }
  .shelf-title { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  h3 { font-family: Georgia, serif; font-size: 0.95rem; font-weight: 500; }
  .shelf-count { font-size: 0.7rem; font-variant-numeric: tabular-nums; color: var(--dim); }
  .shelf-header > p { margin-top: 0.22rem; font-family: Georgia, serif; font-size: 0.72rem; line-height: 1.38; color: var(--dim); }
  .reward {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-top: 0.58rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
    color: rgba(150, 145, 169, 0.7);
  }
  .reward.awake { color: var(--gold); }
  .reward-mark { font-size: 0.82rem; }
  .reward > span:last-child { display: flex; flex-wrap: wrap; gap: 0.18rem 0.45rem; font-size: 0.66rem; }
  .reward strong { color: inherit; }

  .objects {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    background: rgba(255, 255, 255, 0.055);
    border-top: 1px solid rgba(255, 255, 255, 0.055);
  }
  .object {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: start;
    padding: 0.72rem;
    background: rgba(13, 12, 23, 0.96);
  }
  .object.owned { background: linear-gradient(135deg, hsla(var(--hue), 70%, 45%, 0.095), rgba(13, 12, 23, 0.96) 62%); }
  .object.has-special { grid-column: 1 / -1; }
  .object.veiled { min-height: 5.5rem; opacity: 0.58; }
  .object-art {
    display: block;
    width: 2.55rem;
    height: 2.55rem;
  }
  .object-art.veiled-art { opacity: 0.22; }

  .cabinet.tidefall {
    background:
      radial-gradient(circle at 18% 0%, rgba(61, 206, 214, 0.1), transparent 34%),
      linear-gradient(150deg, rgba(5, 31, 43, 0.97), rgba(3, 12, 24, 0.96));
    border-color: rgba(88, 222, 216, 0.22);
  }
  .tidefall .cabinet-header { background: linear-gradient(180deg, rgba(5, 31, 43, 0.99), rgba(4, 21, 32, 0.96)); }
  .tidefall .kicker,
  .tidefall .chapter { color: rgba(109, 237, 225, 0.68); }
  .tidefall .object { background: rgba(3, 17, 27, 0.97); }
  .tidefall .object.owned { background: linear-gradient(135deg, hsla(var(--hue), 78%, 48%, 0.13), rgba(3, 17, 27, 0.97) 65%); }
  .object-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.14rem; }
  .object-copy small { font-size: 0.49rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: hsla(var(--hue), 72%, 76%, 0.64); }
  .object-copy strong { font-family: Georgia, serif; font-size: 0.79rem; color: var(--text); }
  .object-copy em { font-family: Georgia, serif; font-size: 0.68rem; line-height: 1.28; color: var(--dim); }
  .object-copy .record { margin: 0.18rem 0; padding-left: 0.48rem; font-family: Georgia, serif; font-size: 0.64rem; line-height: 1.38; color: rgba(211, 207, 226, 0.78); border-left: 1px solid hsla(var(--hue), 70%, 68%, 0.22); }
  .object-copy .effect { font-size: 0.61rem; line-height: 1.3; color: hsl(var(--hue), 70%, 72%); }
  .held,
  .sleeping { font-size: 0.56rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dim); }
  .buy,
  .small {
    padding: 0.34rem 0.58rem;
    font: inherit;
    font-size: 0.62rem;
    font-weight: 750;
    color: #211609;
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
  }
  .buy { display: flex; flex-direction: column; align-items: center; gap: 0.05rem; }
  .buy span,
  .small span { font-size: 0.55rem; }
  .buy:disabled,
  .small:disabled { opacity: 0.38; cursor: default; filter: saturate(0.4); }
  .special {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: 0.35rem;
    padding-top: 0.48rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .special > span { font-family: Georgia, serif; font-size: 0.67rem; font-style: italic; color: hsl(var(--hue), 65%, 74%); }
  .special.letter { display: block; }
  .special.letter p { margin: 0.65rem 0 0; white-space: pre-line; font-family: Georgia, serif; font-size: 0.72rem; line-height: 1.52; color: rgba(232, 227, 244, 0.9); }

  @media (max-width: 720px) {
    .cabinet {
      left: 0.55rem;
      right: 0.55rem;
      top: 8.2rem;
      bottom: 0.55rem;
      width: auto;
      padding: 0.9rem;
      border-radius: 15px;
      z-index: 10;
    }
    .cabinet-header {
      top: -0.9rem;
      margin: -0.9rem -0.9rem 0;
      padding: 0.9rem;
    }
    .objects { grid-template-columns: 1fr; }
    .object.has-special { grid-column: auto; }
    dl { grid-template-columns: 1fr; gap: 0.28rem; }
    dl div { padding-top: 0.42rem; }
    .ledger { grid-template-columns: 3.5rem minmax(0, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    .cabinet { animation: none; }
    .progress-track span { transition: none; }
  }
</style>
