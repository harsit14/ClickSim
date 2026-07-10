<script lang="ts">
  import { onMount } from 'svelte'
  import { GUIDE_CHAPTERS, type GuideChapter } from '../content/guide'
  import { UI_UNLOCKS } from '../content/ui-unlocks'
  import { UNIVERSES, universeById } from '../content/universes'
  import { CONSTELLATION } from '../content/constellation'
  import { DEEP_UPGRADES } from '../content/deep'
  import { STARDUST_WORKS, DEEP_WORKS } from '../content/repeatables'
  import { CHALLENGES } from '../content/challenges'
  import { VESSEL_PARTS } from '../content/vessel'
  import { WAYFINDER_NODES } from '../content/wayfinder'
  import { THEMES, themeVarsForUniverse } from '../content/themes'
  import { ACHIEVEMENTS } from '../content/achievements'
  import { ENDING_BONUS, ENDING_CHOICES } from '../content/endings'
  import { describeEffect } from '../content/upgrades'
  import { game } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { acquireGamePause } from '../core/pause.svelte'

  let { onclose }: { onclose: () => void } = $props()

  let query = $state('')
  let activeId = $state('awakening')
  let scrollHost: HTMLElement
  let searchInput: HTMLInputElement

  const pack = $derived(universeById(game.activeUniverse))
  const normalizedQuery = $derived(query.trim().toLowerCase())
  const chapters = $derived.by(() => {
    if (!normalizedQuery) return GUIDE_CHAPTERS
    return GUIDE_CHAPTERS.filter((chapter) => chapterCorpus(chapter).includes(normalizedQuery))
  })

  const progress = $derived.by(() => {
    if (game.ending) return { label: 'Answer recorded', detail: `${ENDING_CHOICES.find((choice) => choice.id === game.ending)?.label ?? 'An ending'} shapes this remembrance.`, chapter: 'story' }
    if (game.beacons.length > 0) return { label: 'Between universes', detail: `${game.beacons.length} Beacon${game.beacons.length === 1 ? '' : 's'} lit; Wayfinder laws now join every world.`, chapter: 'multiverse' }
    if (game.vesselParts.length > 0) return { label: 'The Vessel', detail: `${game.vesselParts.length}/5 parts assembled.`, chapter: 'multiverse' }
    if (game.collapses > 0) return { label: 'The Deep', detail: `${game.collapses} Deep Collapse${game.collapses === 1 ? '' : 's'} and ${game.challengesDone.length}/12 trials endured.`, chapter: 'deep' }
    if (game.supernovae > 0) return { label: 'Stardust era', detail: `${game.supernovae} Supernova${game.supernovae === 1 ? '' : 'e'} recorded; ${game.constellation.length}/13 constellation nodes drawn.`, chapter: 'supernova' }
    if (game.totalEarned >= 250_000) return { label: 'Growing universe', detail: 'Cabinet signals and deeper generator relationships are beginning to resolve.', chapter: 'cabinet' }
    return { label: 'First light', detail: 'Build the interface, buy early kindling, and let the first upgrades teach the loop.', chapter: 'awakening' }
  })

  function chapterCorpus(chapter: GuideChapter): string {
    const prose = [
      chapter.nav,
      chapter.eyebrow,
      chapter.title,
      chapter.summary,
      ...chapter.keywords,
      ...chapter.blocks.flatMap((block) => [block.heading, ...block.paragraphs, ...(block.bullets ?? []), block.note ?? '']),
    ]
    const dynamic: Record<string, string[]> = {
      awakening: UI_UNLOCKS.flatMap((unlock) => [unlock.label, unlock.id]),
      economy: UNIVERSES.flatMap((universe) => universe.generators.flatMap((generator) => [generator.name, generator.flavor])),
      'active-play': UNIVERSES.flatMap((universe) => universe.events.powerUps.flatMap((power) => [power.label, power.toast])),
      universes: UNIVERSES.flatMap((universe) => [universe.name, universe.description, universe.twist.name, universe.twist.description]),
      cabinet: UNIVERSES.flatMap((universe) => universe.cabinet.items.flatMap((item) => [item.name, item.classification, item.flavor, item.record])),
      supernova: CONSTELLATION.flatMap((node) => [node.name, node.flavor, ...node.perks.map((perk) => perk.desc)]),
      deep: [...DEEP_UPGRADES, ...STARDUST_WORKS, ...DEEP_WORKS].flatMap((item) => [item.name, item.flavor, 'desc' in item ? item.desc : item.effect]),
      trials: CHALLENGES.flatMap((trial) => [trial.name, trial.flavor, trial.rules, trial.rewardDesc]),
      multiverse: [...VESSEL_PARTS.flatMap((part) => [part.name, part.requirement, part.flavor]), ...WAYFINDER_NODES.flatMap((node) => [node.name, node.effect, node.flavor])],
      story: ENDING_CHOICES.flatMap((ending) => [ending.label, ending.doctrine, ending.line]),
      progress: THEMES.flatMap((theme) => [theme.name, theme.flavor, theme.unlockText]),
    }
    return [...prose, ...(dynamic[chapter.id] ?? [])].join(' ').toLowerCase()
  }

  function goTo(id: string) {
    activeId = id
    query = ''
    requestAnimationFrame(() => {
      scrollHost?.querySelector<HTMLElement>(`#guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function powerEffect(power: (typeof pack.events.powerUps)[number]): string {
    const parts: string[] = []
    if (power.rateSeconds) parts.push(`${Math.round(power.rateSeconds / 60)}m passive production instantly`)
    if (power.prodMult && power.prodMult !== 1) parts.push(`production ×${power.prodMult}`)
    if (power.clickMult && power.clickMult !== 1) parts.push(`clicks ×${power.clickMult}`)
    if (power.durationSec) parts.push(`${power.durationSec}s base duration`)
    return parts.join(' · ')
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onclose()
  }

  onMount(() => {
    const releasePause = acquireGamePause('field guide')
    queueMicrotask(() => searchInput?.focus())
    return releasePause
  })
</script>

<svelte:window onkeydown={onKeydown} />

<div class="guide-backdrop">
  <dialog class="guide" open aria-modal="true" aria-labelledby="guide-title">
    <header class="guide-header">
      <div class="guide-title">
        <span>complete in-game reference</span>
        <h2 id="guide-title">The Field Guide</h2>
      </div>
      <div class="world-chip" style:--world-hue={pack.palette.accentHue}>
        <i></i>
        <span>reading from</span>
        <strong>{pack.shortName}</strong>
      </div>
      <button class="close" aria-label="close the Field Guide" onclick={onclose}>×</button>
    </header>

    <div class="guide-tools">
      <label class="search">
        <span aria-hidden="true">⌕</span>
        <input bind:this={searchInput} bind:value={query} type="search" placeholder="Search mechanics, currencies, objects, trials…" aria-label="Search the Field Guide" />
        {#if query}<button aria-label="clear guide search" onclick={() => (query = '')}>×</button>{/if}
      </label>
      <p>The universe waits while you read. <kbd>Esc</kbd> closes the guide.</p>
    </div>

    <div class="guide-body">
      <aside>
        <section class="where" aria-label="Current progression">
          <span>you are here</span>
          <strong>{progress.label}</strong>
          <p>{progress.detail}</p>
          <button onclick={() => goTo(progress.chapter)}>read this stage <b>→</b></button>
        </section>
        <nav aria-label="Guide chapters">
          {#each GUIDE_CHAPTERS as chapter, index (chapter.id)}
            <button class:active={activeId === chapter.id} onclick={() => goTo(chapter.id)}>
              <span>{String(index + 1).padStart(2, '0')}</span>{chapter.nav}
            </button>
          {/each}
        </nav>
      </aside>

      <main bind:this={scrollHost}>
        {#if chapters.length === 0}
          <section class="no-results">
            <span>◇</span>
            <h3>No entry found</h3>
            <p>Try a broader word such as “Stardust,” “trial,” “cabinet,” “save,” or a generator name.</p>
            <button onclick={() => (query = '')}>Clear search</button>
          </section>
        {/if}

        {#each chapters as chapter, chapterIndex (chapter.id)}
          <article id={`guide-${chapter.id}`} class="chapter">
            <header class="chapter-header">
              <span>{String(GUIDE_CHAPTERS.indexOf(chapter) + 1).padStart(2, '0')} · {chapter.eyebrow}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.summary}</p>
            </header>

            {#each chapter.blocks as block (block.heading)}
              <section class="prose-block">
                <h4>{block.heading}</h4>
                {#each block.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
                {#if block.bullets}
                  <ul>{#each block.bullets as bullet (bullet)}<li>{bullet}</li>{/each}</ul>
                {/if}
                {#if block.note}<aside class="note"><span>field note</span>{block.note}</aside>{/if}
              </section>
            {/each}

            {#if chapter.id === 'awakening'}
              <section class="reference">
                <div class="reference-title"><span>live reference</span><h4>Interface purchase order</h4></div>
                <div class="unlock-road">
                  {#each UI_UNLOCKS as unlock, index (unlock.id)}
                    <div class:owned={game.ui.includes(unlock.id)}>
                      <span>{index + 1}</span>
                      <strong>{unlock.label}</strong>
                      <small>appears at {format(unlock.appearAt)} · costs {format(unlock.cost)}</small>
                    </div>
                  {/each}
                </div>
              </section>
            {:else if chapter.id === 'economy'}
              <section class="reference">
                <div class="reference-title"><span>{pack.shortName} reference</span><h4>All eighteen kindling tiers</h4></div>
                <div class="generator-table" role="table" aria-label={`${pack.shortName} generators`}>
                  {#each pack.generators as generator (generator.id)}
                    <div role="row">
                      <span class="tier" role="cell">{generator.tier}</span>
                      <i style:--hue={generator.hue}></i>
                      <span class="generator-name" role="cell"><strong>{generator.name}</strong><small>{generator.flavor}</small></span>
                      <span class="numbers" role="cell">{pack.currencyGlyph}{format(generator.baseCost)}<small>{format(generator.baseRate)}/s each</small></span>
                    </div>
                  {/each}
                </div>
              </section>
            {:else if chapter.id === 'active-play'}
              <section class="reference">
                <div class="reference-title"><span>{pack.events.noun} table</span><h4>{pack.shortName} power-ups</h4></div>
                <div class="power-grid">
                  {#each pack.events.powerUps as power (power.id)}
                    <article style:--power-hue={power.hue}>
                      <span class="power-glyph">{power.glyph}</span>
                      <div><strong>{power.label}</strong><p>{power.toast.replaceAll('{currency}', pack.currency.toLowerCase())}</p><small>{powerEffect(power)}</small></div>
                    </article>
                  {/each}
                </div>
              </section>
            {:else if chapter.id === 'universes'}
              <section class="reference">
                <div class="reference-title"><span>known routes</span><h4>Universe identity ledger</h4></div>
                <div class="universe-grid">
                  {#each UNIVERSES as universe (universe.id)}
                    <article class:current={universe.id === game.activeUniverse} style:--world-hue={universe.palette.accentHue}>
                      <div class="universe-head"><span>{universe.route.glyph}</span><div><small>{universe.id === game.activeUniverse ? 'current universe' : universe.route.epithet}</small><strong>{universe.name}</strong></div></div>
                      <p>{universe.description}</p>
                      <dl>
                        <div><dt>physics</dt><dd>{universe.twist.name}</dd></div>
                        <div><dt>music</dt><dd>{universe.audio.music === 'tidefall' ? '60 BPM submerged' : '72 BPM warm'}</dd></div>
                        <div><dt>active omen</dt><dd>{universe.events.noun}</dd></div>
                        <div><dt>archive</dt><dd>{universe.cabinet.title}</dd></div>
                        <div><dt>currency</dt><dd>{universe.currencyGlyph} {universe.currency}</dd></div>
                      </dl>
                      <em>{universe.twist.description}</em>
                    </article>
                  {/each}
                </div>
              </section>
            {:else if chapter.id === 'cabinet'}
              <section class="reference">
                <div class="reference-title"><span>field catalogues</span><h4>Every known cabinet object</h4></div>
                {#each UNIVERSES as universe (universe.id)}
                  <details class="catalogue" open={universe.id === game.activeUniverse}>
                    <summary><span>{universe.cabinet.dockGlyph}</span><strong>{universe.cabinet.title}</strong><small>{universe.cabinet.items.length} objects · resonance +{universe.cabinet.resonancePerItem * 100}% each</small></summary>
                    {#each universe.cabinet.shelves as shelf (shelf.id)}
                      <section class="catalogue-shelf">
                        <header><div><small>shelf {shelf.index}</small><strong>{shelf.name}</strong></div><span>{shelf.rewardName} · {shelf.reward}</span></header>
                        <div class="object-list">
                          {#each shelf.ids as id (id)}
                            {@const object = universe.cabinet.itemById.get(id)!}
                            <article style:--object-hue={object.hue}><span>{object.glyph}</span><div><strong>{object.name}</strong><small>{object.classification}</small><p>{object.desc}</p></div></article>
                          {/each}
                        </div>
                      </section>
                    {/each}
                  </details>
                {/each}
              </section>
            {:else if chapter.id === 'supernova'}
              <section class="reference">
                <div class="reference-title"><span>Observatory reference</span><h4>Constellation nodes</h4></div>
                <div class="node-list">
                  {#each CONSTELLATION as node (node.id)}
                    <article class:owned={game.constellation.includes(node.id)}><span>{node.cost}✧</span><div><small>{node.branch}</small><strong>{node.name}</strong><p>{[...node.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())), ...node.perks.map((perk) => perk.desc)].join(' · ')}</p></div></article>
                  {/each}
                </div>
                <div class="works-row">
                  {#each STARDUST_WORKS as work (work.id)}<article><span>{work.glyph}</span><div><strong>{work.name}</strong><p>{work.effect}</p><small>starts at ✧{work.baseCost} · cost growth ×{work.costGrowth}</small></div></article>{/each}
                </div>
              </section>
            {:else if chapter.id === 'deep'}
              <section class="reference">
                <div class="reference-title"><span>Singularity market</span><h4>Fixed and recursive works</h4></div>
                <div class="deep-list">
                  {#each DEEP_UPGRADES as upgrade (upgrade.id)}<article class:owned={game.singUpgrades.includes(upgrade.id)}><span>◉{upgrade.cost}</span><div><strong>{upgrade.name}</strong><em>{upgrade.flavor}</em><p>{upgrade.desc}</p></div></article>{/each}
                </div>
                <div class="works-row">
                  {#each DEEP_WORKS as work (work.id)}<article><span>{work.glyph}</span><div><strong>{work.name}</strong><p>{work.effect}</p><small>starts at ◉{work.baseCost} · cost growth ×{work.costGrowth}</small></div></article>{/each}
                </div>
              </section>
            {:else if chapter.id === 'trials'}
              <section class="reference">
                <div class="reference-title"><span>{game.challengesDone.length}/12 endured</span><h4>Complete trial ledger</h4></div>
                <div class="trial-guide">
                  {#each CHALLENGES as trial, index (trial.id)}
                    <article class:done={game.challengesDone.includes(trial.id)} class:locked={game.challengesDone.length < (trial.unlockAfter ?? 0)}>
                      <span>{String(index + 1).padStart(2, '0')}</span><div><small>{index < 6 ? 'first circle' : 'inner horizon'}</small><strong>{trial.name}</strong><em>{trial.flavor}</em><p>{trial.rules} <b>Goal:</b> {trial.goalText.replaceAll('✦', pack.currencyGlyph).replaceAll('{sun}', pack.generatorById.get('sun')!.name).replaceAll('{ember2}', pack.generatorById.get('ember2')!.name)}</p><mark>{trial.rewardDesc.replaceAll('light', pack.currency.toLowerCase())}</mark></div>
                    </article>
                  {/each}
                </div>
              </section>
            {:else if chapter.id === 'multiverse'}
              <section class="reference">
                <div class="reference-title"><span>departure checklist</span><h4>Vessel parts</h4></div>
                <div class="vessel-list">
                  {#each VESSEL_PARTS as part, index (part.id)}<article class:owned={game.vesselParts.includes(part.id)}><span>{index + 1}</span><div><strong>{part.name}</strong><em>{part.flavor}</em><p>{part.requirement}</p></div></article>{/each}
                </div>
                <div class="reference-title sub"><span>Dark Between market</span><h4>Wayfinder laws</h4></div>
                <div class="wayfinder-list">
                  {#each WAYFINDER_NODES as node (node.id)}<article class:owned={game.wayfinder.includes(node.id)}><span>{node.glyph}</span><div><strong>{node.name}</strong><p>{node.effect}</p><small>◆{node.cost}{node.requires ? ` · requires ${WAYFINDER_NODES.find((entry) => entry.id === node.requires)?.name}` : ''}</small></div></article>{/each}
                </div>
              </section>
            {:else if chapter.id === 'story'}
              <section class="reference spoiler-reference">
                <div class="reference-title"><span>optional spoilers</span><h4>Exact ending laws</h4></div>
                <details>
                  <summary>Reveal mechanical ending details</summary>
                  <div class="ending-list">
                    {#each ENDING_CHOICES as ending (ending.id)}<article><span>{ending.glyph}</span><div><small>{ending.secret ? 'archive answer' : 'visible answer'}</small><strong>{ending.label}</strong><p>{ending.doctrine}</p><mark>{ENDING_BONUS[ending.id]}</mark></div></article>{/each}
                  </div>
                </details>
              </section>
            {:else if chapter.id === 'progress'}
              <section class="reference">
                <div class="reference-title"><span>{game.achievements.length}/{ACHIEVEMENTS.length} achievements</span><h4>Vestment catalogue</h4></div>
                <div class="theme-list">
                  {#each THEMES as theme (theme.id)}<article class:owned={theme.unlocked(game)} style:--theme-color={themeVarsForUniverse(theme, pack.id)['--amber']}><i></i><div><strong>{theme.name}</strong><p>{theme.flavor}</p><small>{theme.unlockText}</small></div></article>{/each}
                </div>
              </section>
            {/if}

            {#if chapterIndex < chapters.length - 1}<div class="chapter-rule"><span>✦</span></div>{/if}
          </article>
        {/each}
      </main>
    </div>
  </dialog>
</div>

<style>
  .guide-backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 1rem; color: var(--text); background: rgba(2, 3, 8, 0.82); backdrop-filter: blur(10px); animation: guide-fade 0.28s ease both; }
  .guide { width: min(76rem, calc(100vw - 2rem)); height: min(56rem, calc(100vh - 2rem)); display: grid; grid-template-rows: auto auto minmax(0, 1fr); overflow: hidden; color: var(--text); background: linear-gradient(145deg, rgba(16, 15, 28, 0.985), rgba(5, 7, 14, 0.985)); border: 1px solid rgba(255, 217, 138, 0.18); border-radius: 20px; box-shadow: 0 34px 100px rgba(0,0,0,0.64), inset 0 1px rgba(255,255,255,0.035); }
  @keyframes guide-fade { from { opacity: 0; } to { opacity: 1; } }
  .guide-header { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(18,17,31,0.94); }
  .guide-title { flex: 1; }
  .guide-title > span, .reference-title > span, .where > span, .chapter-header > span { display: block; font-size: 0.56rem; font-weight: 750; letter-spacing: 0.18em; text-transform: uppercase; color: color-mix(in srgb, var(--gold) 72%, var(--dim)); }
  h2, h3, h4, p { margin: 0; }
  .guide-title h2 { margin-top: 0.12rem; font-family: Georgia, serif; font-size: 1.55rem; font-weight: 500; }
  .world-chip { display: grid; grid-template-columns: auto auto; gap: 0 0.45rem; align-items: center; padding: 0.48rem 0.68rem; border: 1px solid hsla(var(--world-hue),70%,65%,0.24); border-radius: 11px; background: hsla(var(--world-hue),60%,42%,0.06); }
  .world-chip i { grid-row: 1 / 3; width: 0.55rem; height: 0.55rem; border-radius: 50%; background: hsl(var(--world-hue),80%,70%); box-shadow: 0 0 10px hsla(var(--world-hue),90%,65%,0.7); }
  .world-chip span { font-size: 0.52rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); }
  .world-chip strong { font-size: 0.75rem; }
  .close { width: 2.3rem; height: 2.3rem; padding: 0; font: inherit; font-size: 1.25rem; color: var(--dim); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; cursor: pointer; }
  .close:hover, .close:focus-visible { color: #fff; border-color: rgba(255,217,138,0.4); outline: none; }
  .guide-tools { display: flex; align-items: center; gap: 1rem; padding: 0.65rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.055); background: rgba(7,8,16,0.92); }
  .search { flex: 1; display: flex; align-items: center; gap: 0.55rem; max-width: 42rem; padding: 0.5rem 0.7rem; color: var(--dim); background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; }
  .search:focus-within { border-color: rgba(255,217,138,0.32); box-shadow: 0 0 18px rgba(255,179,92,0.06); }
  .search input { min-width: 0; flex: 1; padding: 0; font: inherit; font-size: 0.78rem; color: var(--text); background: none; border: 0; outline: 0; }
  .search input::placeholder { color: #69657a; }
  .search button { padding: 0; color: var(--dim); background: none; border: 0; cursor: pointer; }
  .guide-tools > p { margin-left: auto; font-size: 0.65rem; color: var(--dim); }
  kbd { padding: 0.12rem 0.3rem; font: inherit; font-size: 0.58rem; color: var(--text); background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); border-radius: 4px; }
  .guide-body { min-height: 0; display: grid; grid-template-columns: 15rem minmax(0, 1fr); }
  .guide-body > aside { min-height: 0; overflow-y: auto; padding: 0.9rem; background: rgba(7,7,15,0.74); border-right: 1px solid rgba(255,255,255,0.055); scrollbar-width: thin; }
  .where { margin-bottom: 0.85rem; padding: 0.8rem; border: 1px solid rgba(255,217,138,0.12); border-radius: 12px; background: radial-gradient(circle at 0 0, rgba(255,179,92,0.075), transparent 55%); }
  .where strong { display: block; margin-top: 0.2rem; font-family: Georgia,serif; font-size: 1rem; font-weight: 500; color: var(--gold); }
  .where p { margin-top: 0.28rem; font-family: Georgia,serif; font-size: 0.67rem; line-height: 1.4; color: var(--dim); }
  .where button { margin-top: 0.55rem; padding: 0; font: inherit; font-size: 0.62rem; font-weight: 700; color: var(--amber); background: none; border: 0; cursor: pointer; }
  nav { display: flex; flex-direction: column; gap: 0.2rem; }
  nav button { display: flex; align-items: center; gap: 0.65rem; width: 100%; padding: 0.5rem 0.58rem; font: inherit; font-size: 0.72rem; color: #8f8aa0; background: transparent; border: 1px solid transparent; border-radius: 8px; cursor: pointer; text-align: left; }
  nav button span { font-size: 0.54rem; font-variant-numeric: tabular-nums; color: #5f5b70; }
  nav button:hover { color: var(--text); background: rgba(255,255,255,0.025); }
  nav button.active { color: var(--gold); background: rgba(255,179,92,0.055); border-color: rgba(255,217,138,0.12); }
  main { min-width: 0; overflow-y: auto; padding: 0 2rem 4rem; scroll-behavior: smooth; scrollbar-width: thin; outline: none; }
  .chapter { max-width: 57rem; margin: 0 auto; padding-top: 2.2rem; scroll-margin-top: 1rem; }
  .chapter-header { padding-bottom: 1.15rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .chapter-header h3 { margin-top: 0.34rem; font-family: Georgia,serif; font-size: clamp(1.65rem, 3vw, 2.35rem); font-weight: 500; letter-spacing: -0.025em; }
  .chapter-header p { max-width: 47rem; margin-top: 0.45rem; font-family: Georgia,serif; font-size: 0.88rem; line-height: 1.55; color: #aaa5b8; }
  .prose-block { max-width: 50rem; margin-top: 1.25rem; }
  .prose-block h4, .reference-title h4 { font-family: Georgia,serif; font-size: 1.06rem; font-weight: 500; color: #ded9e7; }
  .prose-block > p { margin-top: 0.55rem; font-family: Georgia,serif; font-size: 0.8rem; line-height: 1.62; color: #aaa5b6; }
  ul { margin: 0.65rem 0 0; padding: 0; list-style: none; }
  li { position: relative; margin: 0.35rem 0; padding-left: 1.05rem; font-size: 0.75rem; line-height: 1.5; color: #a9a5b5; }
  li::before { content: '✦'; position: absolute; left: 0; top: 0.04rem; font-size: 0.52rem; color: var(--amber); }
  .note { margin-top: 0.8rem; padding: 0.65rem 0.75rem; font-family: Georgia,serif; font-size: 0.72rem; line-height: 1.48; color: #bcb4a4; background: rgba(255,179,92,0.045); border-left: 2px solid rgba(255,179,92,0.44); border-radius: 0 8px 8px 0; }
  .note span { display: block; margin-bottom: 0.15rem; font-family: ui-sans-serif,system-ui; font-size: 0.49rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--amber); }
  .reference { margin-top: 1.4rem; padding: 0.9rem; border: 1px solid rgba(140,220,255,0.11); border-radius: 14px; background: linear-gradient(145deg, rgba(82,144,175,0.045), rgba(255,255,255,0.015)); }
  .reference-title { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 0.7rem; }
  .reference-title.sub { margin-top: 1rem; }
  .unlock-road { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 0.4rem; }
  .unlock-road > div { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 0.1rem 0.45rem; padding: 0.55rem; border: 1px solid rgba(255,255,255,0.055); border-radius: 9px; background: rgba(0,0,0,0.18); opacity: 0.62; }
  .unlock-road > div.owned { opacity: 1; border-color: rgba(255,217,138,0.18); }
  .unlock-road span { grid-row: 1 / 3; color: var(--amber); font-size: 0.65rem; }
  .unlock-road strong { font-size: 0.7rem; }
  .unlock-road small { font-size: 0.56rem; color: var(--dim); }
  .generator-table { display: grid; gap: 1px; overflow: hidden; border: 1px solid rgba(255,255,255,0.055); border-radius: 10px; background: rgba(255,255,255,0.05); }
  .generator-table > div { display: grid; grid-template-columns: 1.6rem auto minmax(0,1fr) auto; align-items: center; gap: 0.55rem; padding: 0.5rem 0.6rem; background: rgba(6,8,15,0.94); }
  .generator-table .tier { font-size: 0.58rem; color: var(--dim); }
  .generator-table i { width: 0.48rem; height: 0.48rem; border-radius: 50%; background: hsl(var(--hue),82%,68%); box-shadow: 0 0 7px hsla(var(--hue),90%,65%,0.62); }
  .generator-name { min-width: 0; display: flex; flex-direction: column; }
  .generator-name strong { font-size: 0.71rem; }
  .generator-name small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: Georgia,serif; font-size: 0.58rem; font-style: italic; color: var(--dim); }
  .numbers { display: flex; flex-direction: column; align-items: end; font-size: 0.65rem; color: var(--gold); font-variant-numeric: tabular-nums; }
  .numbers small { font-size: 0.54rem; color: var(--dim); }
  .power-grid, .universe-grid, .works-row, .theme-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0.45rem; }
  .power-grid article, .works-row article { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 0.65rem; padding: 0.7rem; border: 1px solid hsla(var(--power-hue,200),70%,65%,0.16); border-radius: 10px; background: hsla(var(--power-hue,200),60%,42%,0.045); }
  .power-glyph { width: 2.25rem; height: 2.25rem; display: grid; place-items: center; font-weight: 800; font-size: 0.7rem; color: hsl(var(--power-hue),88%,78%); border: 1px solid hsla(var(--power-hue),80%,70%,0.3); border-radius: 50%; box-shadow: 0 0 16px hsla(var(--power-hue),80%,60%,0.12); }
  .power-grid strong, .works-row strong { font-size: 0.75rem; }
  .power-grid p, .works-row p { margin-top: 0.15rem; font-family: Georgia,serif; font-size: 0.63rem; color: var(--dim); }
  .power-grid small, .works-row small { display: block; margin-top: 0.25rem; font-size: 0.57rem; color: var(--gold); }
  .universe-grid article { padding: 0.8rem; border: 1px solid hsla(var(--world-hue),70%,65%,0.16); border-radius: 12px; background: hsla(var(--world-hue),55%,40%,0.035); }
  .universe-grid article.current { border-color: hsla(var(--world-hue),80%,70%,0.4); box-shadow: inset 0 0 22px hsla(var(--world-hue),70%,50%,0.06); }
  .universe-head { display: flex; align-items: center; gap: 0.6rem; }
  .universe-head > span { width: 2rem; height: 2rem; display: grid; place-items: center; color: hsl(var(--world-hue),85%,75%); border: 1px solid hsla(var(--world-hue),78%,70%,0.24); border-radius: 50%; }
  .universe-head div { display: flex; flex-direction: column; }
  .universe-head small { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); }
  .universe-head strong { font-family: Georgia,serif; font-size: 0.9rem; }
  .universe-grid article > p, .universe-grid article > em { display: block; margin-top: 0.5rem; font-family: Georgia,serif; font-size: 0.65rem; line-height: 1.42; color: var(--dim); }
  dl { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem; margin: 0.6rem 0 0; }
  dl div { display: flex; justify-content: space-between; gap: 0.35rem; padding-top: 0.3rem; border-top: 1px solid rgba(255,255,255,0.05); }
  dt { font-size: 0.52rem; text-transform: uppercase; color: var(--dim); }
  dd { margin: 0; font-size: 0.56rem; font-weight: 700; text-align: right; }
  .catalogue { margin-top: 0.45rem; border: 1px solid rgba(255,255,255,0.065); border-radius: 11px; background: rgba(0,0,0,0.15); }
  .catalogue summary { display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem; cursor: pointer; list-style: none; }
  .catalogue summary > span { color: var(--gold); }
  .catalogue summary strong { font-family: Georgia,serif; font-size: 0.82rem; }
  .catalogue summary small { margin-left: auto; font-size: 0.56rem; color: var(--dim); }
  .catalogue-shelf { padding: 0 0.65rem 0.65rem; }
  .catalogue-shelf > header { display: flex; align-items: end; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0; border-top: 1px solid rgba(255,255,255,0.055); }
  .catalogue-shelf header div { display: flex; flex-direction: column; }
  .catalogue-shelf header small { font-size: 0.48rem; text-transform: uppercase; color: var(--dim); }
  .catalogue-shelf header strong { font-family: Georgia,serif; font-size: 0.72rem; }
  .catalogue-shelf header > span { font-size: 0.55rem; color: var(--gold); }
  .object-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0.35rem; }
  .object-list article { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 0.5rem; padding: 0.5rem; border: 1px solid hsla(var(--object-hue),70%,65%,0.1); border-radius: 8px; background: hsla(var(--object-hue),55%,42%,0.025); }
  .object-list article > span { color: hsl(var(--object-hue),85%,75%); }
  .object-list strong { display: block; font-size: 0.66rem; }
  .object-list small { display: block; font-size: 0.46rem; text-transform: uppercase; color: var(--dim); }
  .object-list p { margin-top: 0.15rem; font-size: 0.55rem; color: hsl(var(--object-hue),60%,72%); }
  .node-list, .deep-list, .vessel-list, .wayfinder-list, .ending-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0.35rem; }
  .node-list article, .deep-list article, .vessel-list article, .wayfinder-list article, .ending-list article { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 0.55rem; padding: 0.55rem; border: 1px solid rgba(255,255,255,0.055); border-radius: 8px; background: rgba(0,0,0,0.16); opacity: 0.74; }
  .node-list article.owned, .deep-list article.owned, .vessel-list article.owned, .wayfinder-list article.owned { opacity: 1; border-color: rgba(255,217,138,0.22); }
  .node-list article > span, .deep-list article > span, .vessel-list article > span, .wayfinder-list article > span, .ending-list article > span { color: var(--gold); font-size: 0.62rem; }
  .node-list small, .ending-list small { display: block; font-size: 0.46rem; text-transform: uppercase; color: var(--dim); }
  .node-list strong, .deep-list strong, .vessel-list strong, .wayfinder-list strong, .ending-list strong { display: block; font-size: 0.67rem; }
  .node-list p, .deep-list p, .vessel-list p, .wayfinder-list p, .ending-list p { margin-top: 0.13rem; font-size: 0.55rem; line-height: 1.35; color: var(--dim); }
  .deep-list em, .vessel-list em { font-family: Georgia,serif; font-size: 0.54rem; color: var(--dim); }
  .works-row { margin-top: 0.55rem; }
  .works-row article { --power-hue: 205; }
  .trial-guide { display: grid; gap: 0.35rem; }
  .trial-guide article { display: grid; grid-template-columns: 1.5rem minmax(0,1fr); gap: 0.55rem; padding: 0.6rem; border: 1px solid rgba(255,255,255,0.055); border-radius: 9px; background: rgba(0,0,0,0.16); }
  .trial-guide article.done { border-color: rgba(255,217,138,0.24); }
  .trial-guide article.locked { opacity: 0.52; border-style: dashed; }
  .trial-guide article > span { font-size: 0.56rem; color: var(--amber); }
  .trial-guide small { display: block; font-size: 0.47rem; text-transform: uppercase; color: var(--dim); }
  .trial-guide strong { display: block; font-size: 0.72rem; }
  .trial-guide em { display: block; margin-top: 0.1rem; font-family: Georgia,serif; font-size: 0.57rem; color: var(--dim); }
  .trial-guide p { margin-top: 0.25rem; font-size: 0.58rem; line-height: 1.4; color: #aaa5b5; }
  mark { display: inline-block; margin-top: 0.25rem; padding: 0; font-size: 0.56rem; color: var(--gold); background: none; }
  .spoiler-reference details { padding: 0.65rem; border: 1px dashed rgba(255,217,138,0.16); border-radius: 9px; }
  .spoiler-reference summary { font-size: 0.68rem; color: var(--gold); cursor: pointer; }
  .ending-list { margin-top: 0.6rem; }
  .theme-list article { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 0.55rem; padding: 0.6rem; border: 1px solid rgba(255,255,255,0.055); border-radius: 9px; opacity: 0.48; }
  .theme-list article.owned { opacity: 1; border-color: color-mix(in srgb, var(--theme-color) 45%, transparent); }
  .theme-list i { width: 0.8rem; height: 0.8rem; margin-top: 0.1rem; border-radius: 50%; background: var(--theme-color); box-shadow: 0 0 9px var(--theme-color); }
  .theme-list strong { font-size: 0.68rem; }
  .theme-list p { margin-top: 0.1rem; font-family: Georgia,serif; font-size: 0.57rem; color: var(--dim); }
  .theme-list small { font-size: 0.52rem; color: var(--gold); }
  .chapter-rule { height: 3rem; display: grid; place-items: center; color: rgba(255,217,138,0.32); }
  .chapter-rule::before, .chapter-rule::after { content: ''; grid-area: 1/1; width: 42%; border-top: 1px solid rgba(255,255,255,0.055); }
  .chapter-rule::before { justify-self: start; } .chapter-rule::after { justify-self: end; }
  .chapter-rule span { grid-area: 1/1; font-size: 0.55rem; }
  .no-results { min-height: 70%; display: grid; place-content: center; justify-items: center; text-align: center; }
  .no-results > span { font-size: 2rem; color: var(--dim); }
  .no-results h3 { margin-top: 0.5rem; font-family: Georgia,serif; font-weight: 500; }
  .no-results p { max-width: 28rem; margin-top: 0.35rem; font-size: 0.72rem; color: var(--dim); }
  .no-results button { margin-top: 0.8rem; padding: 0.42rem 0.85rem; font: inherit; font-size: 0.7rem; font-weight: 700; color: #201509; background: var(--gold); border: 0; border-radius: 999px; cursor: pointer; }

  @media (max-width: 760px) {
    .guide-backdrop { padding: 0; }
    .guide { width: 100vw; height: 100vh; border: 0; border-radius: 0; }
    .guide-header { padding: 0.72rem 0.8rem; }
    .guide-title > span, .world-chip span { display: none; }
    .guide-title h2 { font-size: 1.2rem; }
    .world-chip { padding: 0.38rem 0.5rem; }
    .world-chip i { grid-row: auto; }
    .world-chip strong { font-size: 0.65rem; }
    .guide-tools { flex-direction: column; align-items: stretch; gap: 0.3rem; padding: 0.55rem 0.7rem; }
    .guide-tools > p { margin: 0; font-size: 0.56rem; text-align: center; }
    .guide-body { grid-template-columns: 1fr; grid-template-rows: auto minmax(0,1fr); }
    .guide-body > aside { display: block; overflow-x: auto; overflow-y: hidden; padding: 0.45rem 0.55rem; border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.055); white-space: nowrap; }
    .where { display: none; }
    nav { flex-direction: row; gap: 0.25rem; }
    nav button { flex: none; width: auto; padding: 0.42rem 0.55rem; }
    nav button span { display: none; }
    main { padding: 0 0.8rem 3rem; }
    .chapter { padding-top: 1.4rem; }
    .chapter-header h3 { font-size: 1.55rem; }
    .chapter-header p { font-size: 0.78rem; }
    .unlock-road { grid-template-columns: 1fr 1fr; }
    .power-grid, .universe-grid, .works-row, .theme-list, .node-list, .deep-list, .vessel-list, .wayfinder-list, .ending-list, .object-list { grid-template-columns: 1fr; }
    .generator-table > div { grid-template-columns: 1.25rem auto minmax(0,1fr); }
    .generator-table .numbers { grid-column: 3; align-items: start; flex-direction: row; gap: 0.35rem; }
    .catalogue summary { flex-wrap: wrap; }
    .catalogue summary small { width: 100%; margin-left: 1.65rem; }
    .catalogue-shelf > header { align-items: start; flex-direction: column; }
    .reference { padding: 0.7rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .guide-backdrop { animation: none; }
    main { scroll-behavior: auto; }
  }
</style>
