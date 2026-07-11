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
  import LumenVaultShelf from './LumenVaultShelf.svelte'

  let { onclose }: { onclose: () => void } = $props()
  let now = $state(Date.now())
  let letterOpen = $state(false)
  let closeButton: HTMLButtonElement
  const pack = $derived(universeById(game.activeUniverse))
  const cabinet = $derived(pack.cabinet)

  interface CabinetLanguage {
    seal: string
    fieldLabel: string
    fieldTitle: string
    fieldDescription: string
    countLabel: string
    collectionLabel: string
    resonanceLabel: string
    completedLabel: string
    hiddenShelfTitle: string
    hiddenShelfCopy: string
    unknownReward: string
    nearClassification: string
    emptyClassification: string
    nearName: string
    emptyName: string
    nearFlavor: string
    emptyFlavor: string
    action: string
    past: string
    heldLabel: string
    sleepingLabel: string
    revealVerb: string
    thresholdNoun: string
  }

  const CABINET_LANGUAGE: Readonly<Record<string, CabinetLanguage>> = {
    emberlight: {
      seal: '✦', fieldLabel: 'relation field', fieldTitle: 'A sky made legible', fieldDescription: 'Three constellated shelves turn isolated phenomena into one remembered cosmology.',
      countLabel: 'catalogued', collectionLabel: 'shelf', resonanceLabel: 'radiance field', completedLabel: 'shelves awake', hiddenShelfTitle: 'An Uncharted Sky', hiddenShelfCopy: 'The survey plate is dark. No signal has resolved at this distance.', unknownReward: 'unknown resonance',
      nearClassification: 'unresolved astronomical signal', emptyClassification: 'no signal acquired', nearName: 'Unresolved phenomenon', emptyName: 'Uncharted coordinate', nearFlavor: 'The signal is strong enough to catalogue.', emptyFlavor: 'Not every quiet coordinate is empty.',
      action: 'catalogue', past: 'catalogued', heldLabel: 'catalogued', sleepingLabel: 'unresolved', revealVerb: 'resolve', thresholdNoun: 'lifetime',
    },
    tidefall: {
      seal: '≈', fieldLabel: 'pressure transect', fieldTitle: 'The water keeps evidence', fieldDescription: 'Every shelf is a depth band; every sounding records what survived the moonless pressure.',
      countLabel: 'sounded', collectionLabel: 'depth', resonanceLabel: 'current resonance', completedLabel: 'depths awake', hiddenShelfTitle: 'An Unsounded Depth', hiddenShelfCopy: 'The sounding line returns slack. This water has not given up its shape yet.', unknownReward: 'unknown current',
      nearClassification: 'unresolved pelagic sounding', emptyClassification: 'no pressure return', nearName: 'Unresolved presence', emptyName: 'Unsounded depth', nearFlavor: 'The wake is distinct enough to chart.', emptyFlavor: 'Quiet water may still be carrying a civilization.',
      action: 'sound', past: 'sounded', heldLabel: 'charted', sleepingLabel: 'unsounded', revealVerb: 'sound', thresholdNoun: 'total Glow',
    },
    verdance: {
      seal: '❧', fieldLabel: 'living specimen press', fieldTitle: 'Growth remembers relation', fieldDescription: 'Specimens are grouped by survival, communication, and inheritance rather than pinned as trophies.',
      countLabel: 'pressed', collectionLabel: 'folio', resonanceLabel: 'root memory', completedLabel: 'folios alive', hiddenShelfTitle: 'A Dormant Folio', hiddenShelfCopy: 'The page holds only soil and the outline of a future root.', unknownReward: 'unknown inheritance',
      nearClassification: 'viable specimen trace', emptyClassification: 'no germination trace', nearName: 'Unpressed specimen', emptyName: 'Dormant cutting', nearFlavor: 'The specimen can survive the press without losing its story.', emptyFlavor: 'A blank page can still be fertile ground.',
      action: 'press', past: 'pressed', heldLabel: 'preserved', sleepingLabel: 'dormant', revealVerb: 'press', thresholdNoun: 'lifetime Sap',
    },
    clockwork: {
      seal: '⌑', fieldLabel: 'public patent register', fieldTitle: 'Every claim shows its work', fieldDescription: 'Transmission, prediction, and exception occupy separate drawers with their mechanisms exposed.',
      countLabel: 'filed', collectionLabel: 'drawer', resonanceLabel: 'filed leverage', completedLabel: 'drawers ratified', hiddenShelfTitle: 'A Sealed Drawer', hiddenShelfCopy: 'No claim number has been assigned. The blueprint field remains intentionally blank.', unknownReward: 'unfiled remedy',
      nearClassification: 'unexamined patent claim', emptyClassification: 'no claim filed', nearName: 'Pending mechanism', emptyName: 'Blank docket', nearFlavor: 'The diagram contains enough evidence to examine.', emptyFlavor: 'An empty patent frame promises nothing it cannot prove.',
      action: 'file', past: 'filed', heldLabel: 'ratified', sleepingLabel: 'unfiled', revealVerb: 'file', thresholdNoun: 'lifetime Ticks',
    },
    prismata: {
      seal: '◈', fieldLabel: 'labeled spectrum bench', fieldTitle: 'Difference stays visible', fieldDescription: 'Separation, transmission, and reunion remain distinct even when the bench resolves white.',
      countLabel: 'resolved', collectionLabel: 'band', resonanceLabel: 'spectral coherence', completedLabel: 'bands coherent', hiddenShelfTitle: 'An Unlit Band', hiddenShelfCopy: 'The detector holds a labeled place for a wavelength it cannot yet resolve.', unknownReward: 'unknown relationship',
      nearClassification: 'unresolved spectral trace', emptyClassification: 'no exposure recorded', nearName: 'Unfocused instrument', emptyName: 'Dark wavelength', nearFlavor: 'The trace is coherent enough to resolve.', emptyFlavor: 'Invisible does not mean absent; the label remains.',
      action: 'resolve', past: 'resolved', heldLabel: 'resolved', sleepingLabel: 'unlit', revealVerb: 'resolve', thresholdNoun: 'lifetime Chroma',
    },
    tempest: {
      seal: 'ϟ', fieldLabel: 'forecast wall', fieldTitle: 'Every path leaves evidence', fieldDescription: 'Formation, discharge, and aftermath are logged as one weather system with no hidden strike.',
      countLabel: 'logged', collectionLabel: 'front', resonanceLabel: 'stored potential', completedLabel: 'fronts grounded', hiddenShelfTitle: 'An Unformed Front', hiddenShelfCopy: 'The pressure map is quiet here, but the ground mark remains ready.', unknownReward: 'unknown forecast',
      nearClassification: 'resolvable weather trace', emptyClassification: 'no pressure trace', nearName: 'Unlogged formation', emptyName: 'Clear forecast cell', nearFlavor: 'The path is stable enough to enter in the almanac.', emptyFlavor: 'Calm is still a weather state worth preserving.',
      action: 'log', past: 'logged', heldLabel: 'grounded', sleepingLabel: 'unformed', revealVerb: 'log', thresholdNoun: 'lifetime Charge',
    },
    canticle: {
      seal: '◌', fieldLabel: 'memory score', fieldTitle: 'Every voice leaves a rest', fieldDescription: 'Voice, memory, and relationship share one score without forcing the records into unison.',
      countLabel: 'remembered', collectionLabel: 'movement', resonanceLabel: 'standing resonance', completedLabel: 'movements sounding', hiddenShelfTitle: 'An Open Rest', hiddenShelfCopy: 'The measure keeps a place for a voice that has not entered yet.', unknownReward: 'unknown harmony',
      nearClassification: 'recoverable resonant memory', emptyClassification: 'no voice recorded', nearName: 'Unscored voice', emptyName: 'Open measure', nearFlavor: 'The waveform is stable enough to remember.', emptyFlavor: 'A rest is not missing content. It is room to answer.',
      action: 'remember', past: 'remembered', heldLabel: 'remembered', sleepingLabel: 'resting', revealVerb: 'remember', thresholdNoun: 'lifetime Resonance',
    },
  }
  const language = $derived(CABINET_LANGUAGE[pack.id] ?? CABINET_LANGUAGE.emberlight)

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
      pushToast(`${curiosity.name} ${language.past}`, curiosity.flavor, cabinet.title)
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

<div class="inspection-backdrop" aria-hidden="true"></div>

<div
  class="cabinet instrument-panel"
  class:emberlight={pack.id === 'emberlight'}
  class:tidefall={pack.id === 'tidefall'}
  class:verdance={pack.id === 'verdance'}
  class:clockwork={pack.id === 'clockwork'}
  class:prismata={pack.id === 'prismata'}
  class:tempest={pack.id === 'tempest'}
  class:canticle={pack.id === 'canticle'}
  data-universe={pack.id}
  role="dialog"
  aria-modal="true"
  aria-labelledby="cabinet-title"
>
  <header class="cabinet-header">
    <div class="cabinet-heading">
      <span class="cabinet-seal" aria-hidden="true">{language.seal}</span>
      <div>
        <span class="kicker">{cabinet.surveyLabel}</span>
        <h2 id="cabinet-title">{cabinet.title}</h2>
      </div>
    </div>
    <button bind:this={closeButton} class="close" aria-label={`close ${cabinet.title}`} onclick={onclose}>×</button>
  </header>

  <div class="archive-field">
    <aside class="field-identity">
      <span>{language.fieldLabel}</span>
      <strong>{language.fieldTitle}</strong>
      <p>{language.fieldDescription}</p>
      <div class="archive-index" aria-label={`${ownedCount} of ${cabinet.items.length} ${language.countLabel}`}>
        {#each cabinet.items as item, index (item.id)}
          <i class:owned={held(item.id)} class:near={revealed(item)} title={held(item.id) ? item.name : `${language.sleepingLabel} record`}>{String(index + 1).padStart(2, '0')}</i>
        {/each}
      </div>
    </aside>
    <div class="ledger">
      <div class="count">
        <strong>{ownedCount}<span>/{cabinet.items.length}</span></strong>
        <small>{language.countLabel}</small>
      </div>
      <div class="progress-copy">
        <div
          class="progress-track"
          role="progressbar"
          aria-label={`${cabinet.title} collection progress`}
          aria-valuemin="0"
          aria-valuemax={cabinet.items.length}
          aria-valuenow={ownedCount}
        >
          <span style:width={`${(ownedCount / cabinet.items.length) * 100}%`}></span>
        </div>
        <p>{cabinetLine}</p>
      </div>
      <dl>
        <div><dt>{language.resonanceLabel}</dt><dd>+{resonancePercent}% all production</dd></div>
        <div><dt>{language.completedLabel}</dt><dd>{completedShelves}/{cabinet.shelves.length}</dd></div>
      </dl>
    </div>
  </div>

  <div class="shelves">
    {#each cabinet.shelves as shelf (shelf.id)}
      {@const open = shelfOpen(shelf)}
      {@const complete = shelfDone(shelf)}
      <section class="shelf" class:complete class:sealed={!open} aria-labelledby={`shelf-${shelf.id}`}>
        <header class="shelf-header">
          <span class="chapter">{language.collectionLabel} {shelf.index}</span>
          <div class="shelf-title">
            <h3 id={`shelf-${shelf.id}`}>{open ? shelf.name : language.hiddenShelfTitle}</h3>
            <span class="shelf-count">{shelfCount(shelf)}/{shelf.ids.length}</span>
          </div>
          <p>{open ? shelf.lore : language.hiddenShelfCopy}</p>
          <div class="reward" class:awake={complete}>
            <span class="reward-mark">{complete ? '✦' : '◇'}</span>
            <span><strong>{open ? shelf.rewardName : language.unknownReward}</strong>{open ? shelf.reward : `complete the ${language.collectionLabel} to awaken it`}</span>
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
                  <small>{owned ? c.classification : near ? language.nearClassification : language.emptyClassification}</small>
                  <strong>{owned ? c.name : near ? language.nearName : language.emptyName}</strong>
                  <em>{owned ? c.flavor : near ? language.nearFlavor : language.emptyFlavor}</em>
                  {#if owned}<p class="record">{c.record}</p>{/if}
                  <span class="effect">{owned ? c.desc : near ? `${language.revealVerb} for ${pack.currencyGlyph} ${format(c.cost)}` : `${language.thresholdNoun} trace appears near ${pack.currencyGlyph} ${format(c.cost * 0.25)}`}</span>
                </div>

                {#if owned}
                  <span class="held">{language.heldLabel}</span>
                {:else if near}
                  <button class="buy" disabled={game.challenge !== null || !gteAmount(game.light, amountFromNumber(c.cost))} onclick={() => tryBuy(c.id)}>
                    {language.action} <span>{pack.currencyGlyph} {format(c.cost)}</span>
                  </button>
                {:else}
                  <span class="sleeping">{language.sleepingLabel}</span>
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

  <LumenVaultShelf home="archive" />
</div>

<style>
  .inspection-backdrop {
    position: fixed;
    inset: 0;
    z-index: 11;
    padding: 0;
    border: 0;
    background:
      radial-gradient(ellipse at 33% 48%, transparent 0 26%, rgba(2, 5, 11, 0.18) 58%, rgba(2, 5, 11, 0.42) 100%),
      rgba(2, 5, 11, 0.2);
    backdrop-filter: blur(2px) saturate(0.72);
    animation: inspection-in 0.28s ease both;
  }
  .cabinet {
    --archive-accent: #ffbd70;
    --archive-surface: #17131f;
    --archive-bg:
      radial-gradient(circle at 18% 4%, rgba(255, 154, 71, 0.13), transparent 31%),
      linear-gradient(145deg, rgba(32, 27, 48, 0.98), rgba(8, 8, 15, 0.97));
    --archive-header: linear-gradient(180deg, rgba(27, 23, 42, 0.995), rgba(20, 17, 32, 0.97));
    position: fixed;
    left: 1.1rem;
    top: 5.2rem;
    bottom: 4.2rem;
    width: min(56rem, calc(100vw - 20rem));
    overflow-y: auto;
    padding: 1.15rem;
    color: var(--text);
    background: var(--archive-bg);
    border: 1px solid color-mix(in srgb, var(--archive-accent) 24%, transparent);
    border-radius: 18px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42), inset 0 1px rgba(255, 255, 255, 0.035);
    backdrop-filter: blur(16px);
    z-index: 12;
    scrollbar-width: thin;
    animation: cabinet-in 0.5s cubic-bezier(0.2, 0.8, 0.25, 1) both;
  }
  @keyframes cabinet-in {
    from { opacity: 0; transform: translateX(-18px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes inspection-in { from { opacity: 0; } to { opacity: 1; } }
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
    background: var(--archive-header);
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
    color: color-mix(in srgb, var(--archive-accent) 68%, transparent);
  }
  .cabinet-heading { display: flex; align-items: center; gap: 0.8rem; }
  .cabinet-seal {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.65rem;
    height: 2.65rem;
    color: var(--archive-accent);
    font-size: 1.2rem;
    border: 1px solid color-mix(in srgb, var(--archive-accent) 34%, transparent);
    clip-path: polygon(50% 0, 94% 24%, 94% 76%, 50% 100%, 6% 76%, 6% 24%);
    background: color-mix(in srgb, var(--archive-accent) 7%, transparent);
    box-shadow: inset 0 0 18px color-mix(in srgb, var(--archive-accent) 8%, transparent);
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

  .archive-field {
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .field-identity {
    min-width: 0;
    padding: 0.85rem;
    border: 1px solid color-mix(in srgb, var(--archive-accent) 16%, transparent);
    border-radius: 13px;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--archive-accent) 8%, transparent), transparent 58%),
      rgba(0, 0, 0, 0.2);
  }
  .field-identity > span { display: block; font-size: 0.55rem; font-weight: 750; letter-spacing: 0.16em; text-transform: uppercase; color: color-mix(in srgb, var(--archive-accent) 72%, var(--dim)); }
  .field-identity > strong { display: block; margin-top: 0.3rem; font-family: Georgia, serif; font-size: 0.98rem; font-weight: 500; color: var(--text); }
  .field-identity > p { margin-top: 0.34rem; font-family: Georgia, serif; font-size: 0.67rem; line-height: 1.42; color: var(--dim); }
  .archive-index { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.25rem; margin-top: 0.75rem; }
  .archive-index i {
    display: grid;
    place-items: center;
    height: 1.35rem;
    color: color-mix(in srgb, var(--dim) 58%, transparent);
    font: 650 0.46rem/1 Inter, sans-serif;
    font-style: normal;
    font-variant-numeric: tabular-nums;
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 0.28rem;
    background: rgba(0, 0, 0, 0.2);
  }
  .archive-index i.near { color: color-mix(in srgb, var(--archive-accent) 52%, var(--dim)); border-color: color-mix(in srgb, var(--archive-accent) 18%, transparent); }
  .archive-index i.owned { color: #fff; border-color: color-mix(in srgb, var(--archive-accent) 48%, transparent); background: color-mix(in srgb, var(--archive-accent) 17%, transparent); box-shadow: 0 0 10px color-mix(in srgb, var(--archive-accent) 14%, transparent); }

  .ledger {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.7rem 1rem;
    margin-top: 0;
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
    background: linear-gradient(90deg, var(--archive-accent), color-mix(in srgb, var(--archive-accent) 45%, white));
    box-shadow: 0 0 12px color-mix(in srgb, var(--archive-accent) 52%, transparent);
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
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.018);
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 14px;
  }
  .shelf.complete { border-color: color-mix(in srgb, var(--archive-accent) 26%, transparent); box-shadow: inset 0 0 30px color-mix(in srgb, var(--archive-accent) 4%, transparent); }
  .shelf.sealed { opacity: 0.55; }
  .shelf-header { padding: 0.82rem; border-right: 1px solid rgba(255, 255, 255, 0.055); background: linear-gradient(145deg, color-mix(in srgb, var(--archive-accent) 5%, transparent), transparent 70%); }
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
    border-top: 0;
  }
  .object {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: start;
    padding: 0.72rem;
    min-height: 6.3rem;
    background: color-mix(in srgb, var(--archive-surface) 96%, black);
  }
  .object.owned { background: linear-gradient(135deg, hsla(var(--hue), 70%, 45%, 0.1), color-mix(in srgb, var(--archive-surface) 96%, black) 64%); }
  .object.has-special { grid-column: 1 / -1; }
  .object.veiled { min-height: 5.5rem; opacity: 0.58; }
  .object-art {
    display: block;
    width: 3rem;
    height: 3rem;
  }
  .object-art.veiled-art { opacity: 0.22; }

  .cabinet.tidefall {
    --archive-accent: #78eee4;
    --archive-surface: #061923;
    --archive-bg: repeating-linear-gradient(178deg, transparent 0 3.1rem, rgba(88, 222, 216, 0.025) 3.1rem 3.16rem), radial-gradient(ellipse at 18% 0%, rgba(61, 206, 214, 0.14), transparent 38%), linear-gradient(150deg, rgba(5, 31, 43, 0.985), rgba(2, 10, 21, 0.98));
    --archive-header: linear-gradient(180deg, rgba(5, 31, 43, 0.995), rgba(4, 21, 32, 0.98));
  }
  .cabinet.verdance {
    --archive-accent: #c8eb91;
    --archive-surface: #0b1b10;
    --archive-bg: linear-gradient(28deg, transparent 0 49%, rgba(144, 214, 126, 0.035) 49.2% 50%, transparent 50.2%), radial-gradient(circle at 20% 4%, rgba(112, 181, 103, 0.16), transparent 36%), linear-gradient(150deg, rgba(12, 31, 18, 0.985), rgba(4, 13, 8, 0.98));
    --archive-header: linear-gradient(180deg, rgba(14, 35, 20, 0.995), rgba(7, 22, 12, 0.98));
  }
  .cabinet.clockwork {
    --archive-accent: #e1b35e;
    --archive-surface: #17150f;
    --archive-bg: linear-gradient(rgba(225, 179, 94, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(225, 179, 94, 0.035) 1px, transparent 1px), linear-gradient(150deg, rgba(28, 25, 17, 0.99), rgba(8, 11, 12, 0.985));
    --archive-header: linear-gradient(180deg, rgba(32, 28, 18, 0.995), rgba(16, 17, 14, 0.98));
    background-size: 1.1rem 1.1rem, 1.1rem 1.1rem, auto;
  }
  .cabinet.prismata {
    --archive-accent: #c6b4ff;
    --archive-surface: #111027;
    --archive-bg: linear-gradient(122deg, transparent 0 42%, rgba(255,255,255,0.035) 42.2% 42.5%, transparent 42.8%), linear-gradient(58deg, transparent 0 59%, rgba(167,139,255,0.04) 59.2% 59.6%, transparent 59.8%), linear-gradient(145deg, rgba(22, 19, 49, 0.99), rgba(6, 6, 18, 0.985));
    --archive-header: linear-gradient(180deg, rgba(27, 23, 56, 0.995), rgba(13, 11, 34, 0.98));
  }
  .cabinet.tempest {
    --archive-accent: #9bdfff;
    --archive-surface: #0a1722;
    --archive-bg: repeating-linear-gradient(168deg, transparent 0 2.9rem, rgba(134, 214, 255, 0.03) 2.92rem 3rem), radial-gradient(ellipse at 65% 0%, rgba(102, 186, 231, 0.15), transparent 38%), linear-gradient(155deg, rgba(10, 29, 43, 0.99), rgba(3, 9, 16, 0.985));
    --archive-header: linear-gradient(180deg, rgba(13, 35, 50, 0.995), rgba(6, 20, 31, 0.98));
  }
  .cabinet.canticle {
    --archive-accent: #f0b9df;
    --archive-surface: #1a0e1a;
    --archive-bg: repeating-radial-gradient(circle at 20% 12%, transparent 0 3.3rem, rgba(240,185,223,0.028) 3.35rem 3.42rem), linear-gradient(150deg, rgba(34, 18, 35, 0.99), rgba(10, 6, 14, 0.985));
    --archive-header: linear-gradient(180deg, rgba(39, 21, 40, 0.995), rgba(20, 11, 24, 0.98));
  }
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

  @media (max-width: 1100px) {
    .cabinet {
      right: 1.1rem;
      width: auto;
      z-index: 12;
    }
  }

  @media (max-width: 900px) {
    .archive-field { grid-template-columns: 11rem minmax(0, 1fr); }
    .shelf { grid-template-columns: 1fr; }
    .shelf-header { border-right: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.055); }
  }

  @media (max-width: 720px) {
    .cabinet {
      left: 0.55rem;
      right: 0.55rem;
      top: 8.2rem;
      bottom: 0.55rem;
      width: auto;
      padding: 0.9rem;
      border-radius: 15px;
      z-index: 12;
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
    .archive-field { grid-template-columns: 1fr; }
    .archive-index { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .archive-index i { height: 1.1rem; font-size: 0.4rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .inspection-backdrop,
    .cabinet { animation: none; }
    .progress-track span { transition: none; }
  }
</style>
