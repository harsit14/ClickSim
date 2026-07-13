<script lang="ts">
  import { onMount } from 'svelte'
  import { DEEP_UPGRADES, SINGULARITY_COST } from '../content/deep'
  import { CHALLENGES, challengeUnlocked } from '../content/challenges'
  import ResonanceAtlas from './ResonanceAtlas.svelte'
  import LumenDistillery from './LumenDistillery.svelte'
  import {
    game,
    deepCollapseGain,
    buyDeepUpgrade,
    buyDeepWork,
    deepMarketComplete,
    startChallenge,
  } from '../engine/game.svelte'
  import { save } from '../core/save'
  import { stopMusic } from '../audio/music'
  import { playBuy, setDepthLowPass } from '../audio/sfx'
  import { universeById } from '../content/universes'
  import { format } from '../core/format'
  import {
    DEEP_WORKS,
    deepProductionMult,
    singularityYieldMult,
    workCost,
    workRank,
    type DeepWorkId,
  } from '../content/repeatables'
  import {
    challengeCopy,
    deepUpgradeCopy,
    deepWorkCopy,
    progressionIdentity,
  } from '../content/universe-progression'
  import { localizeChallengeText } from '../content/challenge-language'
  import {
    ONE_AMOUNT,
    amountFromNumber,
    eqAmount,
    gteAmount,
    isZeroAmount,
    parseAmount,
    serializeAmount,
  } from '../core/numeric/amount'
  import {
    AUTO_KINDLER_FAMILIES,
    autoKindlerFamilyForTier,
    type AutoKindlerFamily,
  } from '../core/automation-preferences'

  let { onclose, onrequestcollapse }: { onclose: () => void; onrequestcollapse: () => void } = $props()
  let closeButton: HTMLButtonElement

  onMount(() => {
    closeButton.focus()
    setDepthLowPass(true)
    return () => setDepthLowPass(false)
  })

  const gain = $derived(deepCollapseGain())
  const pack = $derived(universeById(game.activeUniverse))
  const identity = $derived(progressionIdentity(pack.id).deep)
  const tidefall = $derived(pack.id === 'tidefall')
  const marketComplete = $derived(deepMarketComplete())
  const depthProgress = $derived(Math.min(100, Math.round((game.singUpgrades.length / DEEP_UPGRADES.length) * 55 + (game.challengesDone.length / CHALLENGES.length) * 45)))
  const trialCircles = $derived([
    { name: identity.circleNames[0], note: identity.circleNotes[0], trials: CHALLENGES.slice(0, 6) },
    { name: identity.circleNames[1], note: identity.circleNotes[1], trials: CHALLENGES.slice(6) },
  ])
  const localize = (text: string) => localizeChallengeText(text, pack)
  const warningText = () => localize(identity.warningText).replace('stardust', `✧${format(game.stardustTotal)} stardust`)

  function setAutoNovaThreshold(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    try {
      const value = input.value.includes('e')
        ? parseAmount(input.value)
        : amountFromNumber(Number(input.value))
      game.autoNovaThreshold = gteAmount(value, ONE_AMOUNT) ? value : ONE_AMOUNT
    } catch {
      input.value = serializeAmount(game.autoNovaThreshold)
    }
  }

  function tryBuy(id: string) {
    if (buyDeepUpgrade(id)) playBuy()
  }

  function autoKindlerFamilyLabel(family: AutoKindlerFamily): string {
    const members = pack.generators.filter(({ tier }) => autoKindlerFamilyForTier(tier) === family)
    return `${members[0]?.tier ?? family * 3 + 1}–${members.at(-1)?.tier ?? family * 3 + 3} · ${members[0]?.name ?? 'Kindlings'}—${members.at(-1)?.name ?? ''}`
  }

  function toggleAutoKindlerFamily(family: AutoKindlerFamily) {
    const selected = game.autoKindlerFamilies.includes(family)
    if (selected && game.autoKindlerFamilies.length === 1) return
    game.autoKindlerFamilies = selected
      ? game.autoKindlerFamilies.filter((entry) => entry !== family)
      : [...game.autoKindlerFamilies, family].sort((left, right) => left - right)
    save()
  }

  function tryBuyWork(id: DeepWorkId) {
    if (!buyDeepWork(id)) return
    playBuy()
    save()
  }

  function workStatus(id: DeepWorkId): string {
    const ranks = game.deepWorks
    if (id === 'worldseed-compression') return `current ×${deepProductionMult(ranks).toFixed(0)} · next ×${(deepProductionMult(ranks) * 2).toFixed(0)}`
    return `current +${Math.round((singularityYieldMult(ranks) - 1) * 100)}% · next +${Math.round((singularityYieldMult(ranks) - 0.75) * 100)}%`
  }

  function beginTrial(id: string) {
    if (!startChallenge(id)) return
    clearBuffs()
    combo.streak = 0
    combo.lastRewardAt = 0
    stopMusic()
    save()
    onclose()
  }
</script>

<section class="deep instrument-panel" class:tidefall>
  <header>
    <div class="title-block">
      <span>{identity.overline}</span>
      <h2>{identity.title}</h2>
    </div>
    <span class="balance">◉ {format(game.singularities)} <em>singularit{eqAmount(game.singularities, ONE_AMOUNT) ? 'y' : 'ies'}</em></span>
    <button bind:this={closeButton} class="close" aria-label={`close ${identity.title}`} onclick={onclose}>✕</button>
  </header>

  {#if tidefall}
    <div class="depth-profile" aria-label={`${depthProgress}% of the Hadal Archive mapped`}>
      <span>surface memory</span>
      <span class="depth-line"><i style:left={`${depthProgress}%`}></i></span>
      <span>hadal memory</span>
      <strong>{depthProgress}% sounded</strong>
    </div>
  {/if}

  <div class="fold" class:ready={!isZeroAmount(gain)}>
    {#if game.challenge}
      <p class="fold-text">{identity.trialWait}</p>
    {:else if isZeroAmount(gain)}
      <p class="fold-text">
        {identity.gatherText}
        <em>◉1 per ✧{SINGULARITY_COST} gathered this era — ✧{format(game.stardustTotal)} so far</em>
      </p>
    {:else}
      <p class="fold-text">{identity.readyText}</p>
      <button class="fold-btn" aria-describedby="deep-collapse-warning" onclick={onrequestcollapse}>Review {identity.collapseName} &nbsp;·&nbsp; gain ◉{format(gain)}</button>
      <p id="deep-collapse-warning" class="fold-text warn">{warningText()}</p>
    {/if}
  </div>

  <h3>{identity.worksTitle}</h3>
  <div class="shop">
    {#each DEEP_UPGRADES as u (u.id)}
      {@const copy = deepUpgradeCopy(u, pack.id)}
      {@const owned = game.singUpgrades.includes(u.id)}
      {@const affordable = !owned && gteAmount(game.singularities, amountFromNumber(u.cost))}
      <div class="item" class:owned class:affordable class:unaffordable={!owned && !affordable}>
        <div class="item-head">
          <strong>{copy.name}</strong>
          {#if owned}
            {#if u.id === 'auto-kindler'}
              <label class="toggle"><input type="checkbox" bind:checked={game.autoKindler} /> on</label>
            {:else if u.id === 'auto-stoker'}
              <label class="toggle"><input type="checkbox" bind:checked={game.autoStoker} /> on</label>
            {:else if u.id === 'nova-engine'}
              <label class="toggle">
                <input type="checkbox" bind:checked={game.autoNova} /> at ✧
                <input class="threshold" type="text" inputmode="decimal" value={serializeAmount(game.autoNovaThreshold)} onchange={setAutoNovaThreshold} aria-label="automatic supernova threshold" />
              </label>
            {:else}
              <span class="held">held</span>
            {/if}
          {:else}
            <button class="buy" class:unaffordable={!affordable} disabled={!affordable} onclick={() => tryBuy(u.id)}>
              ◉ {u.cost}
            </button>
          {/if}
        </div>
        <em>{copy.flavor}</em>
        <span class="desc">{localize(copy.effect ?? u.desc)}</span>
        {#if owned && u.id === 'auto-kindler'}
          <div class="automation-routing">
            <label>
              <span>purchase priority</span>
              <select bind:value={game.autoKindlerPriority} onchange={() => save()}>
                <option value="efficiency">best payback</option>
                <option value="cheapest">lowest cost</option>
                <option value="least-owned">least owned</option>
                <option value="highest-tier">highest tier</option>
              </select>
            </label>
            <fieldset>
              <legend>eligible Kindling families</legend>
              {#each AUTO_KINDLER_FAMILIES as family}
                <label title={autoKindlerFamilyLabel(family)}>
                  <input
                    type="checkbox"
                    checked={game.autoKindlerFamilies.includes(family)}
                    disabled={game.autoKindlerFamilies.length === 1 && game.autoKindlerFamilies.includes(family)}
                    onchange={() => toggleAutoKindlerFamily(family)}
                  />
                  <span>{autoKindlerFamilyLabel(family)}</span>
                </label>
              {/each}
            </fieldset>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <section class="recursive" class:locked={!marketComplete} aria-label="Repeatable Singularity works">
    <div class="recursive-head">
      <div>
        <span>{identity.recursiveEyebrow}</span>
        <h3>{identity.recursiveTitle}</h3>
      </div>
      {#if marketComplete}<strong>◉ survives collapse</strong>{/if}
    </div>
    {#if marketComplete}
      <p>{identity.recursiveIntro}</p>
      <div class="recursive-grid">
        {#each DEEP_WORKS as work (work.id)}
          {@const copy = deepWorkCopy(work, pack.id)}
          {@const rank = workRank(game.deepWorks, work.id)}
          {@const cost = workCost(work, rank)}
          {@const affordable = cost !== null && gteAmount(game.singularities, cost)}
          <article class="recursive-work" class:affordable class:unaffordable={cost !== null && !affordable}>
            <span class="work-glyph">{work.glyph}</span>
            <div class="work-copy">
              <small>rank {rank}</small>
              <strong>{copy.name}</strong>
              <em>{copy.flavor}</em>
              <span>{copy.effect ?? work.effect}</span>
              <b>{workStatus(work.id)}</b>
            </div>
            <button class:unaffordable={cost !== null && !affordable} disabled={cost === null || !affordable} onclick={() => tryBuyWork(work.id)}>
              {cost === null ? 'mastered' : `${identity.workVerb} · ◉ ${format(cost)}`}
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p>{identity.recursiveEmpty}</p>
    {/if}
  </section>

  <LumenDistillery />

  <ResonanceAtlas />

  <div class="trial-title">
    <div>
      <h3>{identity.trialsTitle}</h3>
      <span>{identity.trialsNote}</span>
    </div>
    <strong>{game.challengesDone.length} / {CHALLENGES.length}</strong>
  </div>
  <div class="trial-progress" aria-label={`${game.challengesDone.length} of ${CHALLENGES.length} trials complete`}>
    {#each CHALLENGES as challenge (challenge.id)}
      <i class:done={game.challengesDone.includes(challenge.id)}></i>
    {/each}
  </div>
  {#each trialCircles as circle (circle.name)}
    <div class="circle-head">
      <h4>{circle.name}</h4>
      <span>{circle.note}</span>
    </div>
    <div class="trials">
      {#each circle.trials as c (c.id)}
        {@const copy = challengeCopy(c, pack)}
        {@const done = game.challengesDone.includes(c.id)}
        {@const active = game.challenge === c.id}
        {@const unlocked = challengeUnlocked(game.challengesDone, c)}
        <div class="trial" class:done class:active class:locked={!unlocked}>
          <div class="trial-head">
            <strong>{copy.name}</strong>
            {#if done}
              <span class="held">endured</span>
            {:else if active}
              <span class="held">underway</span>
            {:else if unlocked}
              <button class="buy" disabled={!!game.challenge} aria-label={`Begin ${copy.name}. Rule: ${copy.rules}. Goal: ${copy.goalText}.`} onclick={() => beginTrial(c.id)}>begin</button>
            {:else}
              <span class="sealed">after {c.unlockAfter} trials</span>
            {/if}
          </div>
          <em>{copy.flavor}</em>
          <span class="desc">{copy.rules} · goal: {copy.goalText}</span>
          <span class="reward">reward: {copy.rewardDesc}</span>
        </div>
      {/each}
    </div>
  {/each}
</section>

<style>
  .deep {
    position: fixed;
    inset: 3.2rem 0 0 0;
    margin: 0 auto;
    width: min(44rem, 96vw);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    padding: 1.1rem 1.4rem 1.4rem;
    background: rgba(6, 5, 12, 0.96);
    border: 1px solid rgba(140, 220, 255, 0.14);
    border-radius: 16px;
    backdrop-filter: blur(14px);
    z-index: 9;
    animation: deep-in 0.24s ease both;
    scrollbar-width: thin;
  }
  @keyframes deep-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.8rem;
  }
  .title-block { flex: 1; min-width: 0; }
  .title-block > span {
    display: block;
    margin-bottom: 0.16rem;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #657f8c;
  }
  h2 {
    margin: 0;
    flex: 1;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #9fd8ef;
  }
  h3 {
    margin: 1.1rem 0 0.5rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .balance {
    font-size: 1.05rem;
    font-weight: 650;
    color: #bfeaff;
    text-shadow: 0 0 16px rgba(120, 210, 255, 0.5);
    font-variant-numeric: tabular-nums;
  }
  .balance em {
    font-style: normal;
    font-size: 0.7rem;
    color: var(--dim);
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.95rem;
    cursor: pointer;
  }

  .depth-profile {
    display: grid;
    grid-template-columns: auto minmax(8rem, 1fr) auto;
    align-items: center;
    gap: 0.65rem;
    margin: -0.15rem 0 0.75rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid rgba(88, 222, 216, 0.14);
    border-radius: 10px;
    background: linear-gradient(180deg, rgba(74, 202, 205, 0.055), rgba(51, 65, 143, 0.055));
  }
  .depth-profile > span { font-size: 0.54rem; letter-spacing: 0.09em; text-transform: uppercase; color: rgba(142, 211, 216, 0.62); }
  .depth-profile > strong { grid-column: 1 / -1; justify-self: center; margin-top: -0.18rem; font-size: 0.58rem; font-weight: 650; color: #a8e9e3; }
  .depth-line { position: relative; height: 2px; background: linear-gradient(90deg, #61d9d2, #356a93 48%, #392d68); border-radius: 999px; }
  .depth-line i { position: absolute; top: 50%; width: 0.48rem; height: 0.48rem; transform: translate(-50%, -50%); border: 1px solid #c9fff7; border-radius: 50%; background: #31557d; box-shadow: 0 0 10px rgba(88, 222, 216, 0.58); }

  .fold {
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(140, 220, 255, 0.14);
    border-radius: 12px;
    background: rgba(140, 220, 255, 0.04);
    text-align: center;
  }
  .fold.ready {
    border-color: rgba(140, 220, 255, 0.4);
    box-shadow: 0 0 28px rgba(120, 210, 255, 0.1) inset;
  }
  .fold-text {
    margin: 0 0 0.4rem;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.9rem;
    color: rgba(214, 236, 248, 0.85);
  }
  .fold-text em {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.74rem;
    color: var(--dim);
  }
  .fold-text.warn { color: #ffd7a8; }
  .fold-btn {
    padding: 0.45rem 1.3rem;
    font: inherit;
    font-weight: 700;
    color: #06131c;
    background: linear-gradient(180deg, #cfeeff, #7fc8ec);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(120, 210, 255, 0.3);
    transition: transform 0.08s;
  }
  .fold-btn:hover { transform: scale(1.04); }

  .shop, .trials {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .item, .trial {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
  }
  .item.owned { border-color: rgba(140, 220, 255, 0.3); }
  .item.affordable { border-color: color-mix(in srgb, var(--amber) 28%, transparent); box-shadow: inset 0 0 1.05rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .item.unaffordable { color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: linear-gradient(132deg, transparent 0 48%, color-mix(in srgb, var(--dim) 8%, transparent) 49% 50%, transparent 51%) 0 0 / 2.6rem 2.6rem, color-mix(in srgb, var(--bg) 88%, var(--panel)); border-color: color-mix(in srgb, var(--dim) 9%, transparent); }
  .trial.done { border-color: rgba(255, 217, 138, 0.35); }
  .trial.active {
    border-color: rgba(255, 140, 90, 0.5);
    box-shadow: 0 0 18px rgba(255, 120, 70, 0.12);
  }
  .trial.locked {
    opacity: 0.52;
    border-style: dashed;
  }
  .item-head, .trial-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .item strong, .trial strong { font-size: 0.9rem; color: var(--text); }
  .item em, .trial em {
    font-family: Georgia, serif;
    font-size: 0.75rem;
    color: var(--dim);
  }
  .automation-routing { display: grid; gap: 0.45rem; margin-top: 0.35rem; padding-top: 0.45rem; border-top: 1px solid rgba(140, 220, 255, 0.14); }
  .automation-routing > label { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.64rem; color: var(--dim); }
  .automation-routing select { min-width: 8rem; padding: 0.25rem 0.35rem; color: var(--text); background: #10131d; border: 1px solid rgba(140, 220, 255, 0.24); border-radius: 5px; font: inherit; font-size: 0.64rem; }
  .automation-routing fieldset { display: grid; grid-template-columns: 1fr 1fr; gap: 0.24rem 0.45rem; min-width: 0; margin: 0; padding: 0.38rem 0.45rem 0.45rem; border: 1px solid rgba(140, 220, 255, 0.14); border-radius: 7px; }
  .automation-routing legend { padding: 0 0.25rem; color: var(--dim); font-size: 0.58rem; }
  .automation-routing fieldset label { display: flex; min-width: 0; align-items: center; gap: 0.25rem; color: #a9c9d8; font-size: 0.57rem; }
  .automation-routing fieldset span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .desc { font-size: 0.74rem; color: #a9c9d8; }
  .reward { font-size: 0.74rem; color: var(--gold); }
  .buy {
    padding: 0.2rem 0.7rem;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    color: #06131c;
    background: linear-gradient(180deg, #cfeeff, #7fc8ec);
    border: none;
    border-radius: 999px;
    cursor: pointer;
  }
  .buy:disabled,
  .buy.unaffordable { opacity: 1; color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: color-mix(in srgb, var(--bg) 86%, var(--panel)); box-shadow: inset 0 0 0.8rem rgba(0,0,0,0.32); cursor: default; }
  .held {
    font-size: 0.72rem;
    font-style: italic;
    color: rgba(140, 220, 255, 0.75);
  }
  .sealed {
    font-size: 0.63rem;
    color: #6e8490;
    white-space: nowrap;
  }
  .trial-title {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.15rem;
  }
  .trial-title h3 { margin: 0; }
  .trial-title span,
  .circle-head span {
    font-family: Georgia, serif;
    font-size: 0.66rem;
    color: #708b98;
  }
  .trial-title strong {
    font-size: 0.76rem;
    color: #ffd98a;
    font-variant-numeric: tabular-nums;
  }
  .trial-progress {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 0.24rem;
    margin: 0.5rem 0 0.75rem;
  }
  .trial-progress i {
    height: 0.22rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.07);
  }
  .trial-progress i.done {
    background: linear-gradient(90deg, #80cfee, #ffd98a);
    box-shadow: 0 0 7px rgba(128, 207, 238, 0.4);
  }
  .circle-head {
    display: flex;
    align-items: baseline;
    gap: 0.55rem;
    margin: 0.75rem 0 0.38rem;
  }
  .circle-head h4 {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 650;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9fc9dc;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.74rem;
    color: #a9c9d8;
  }
  .toggle input[type='checkbox'] { accent-color: #7fc8ec; }
  .threshold {
    width: 3.2rem;
    padding: 0.1rem 0.3rem;
    font: inherit;
    font-size: 0.74rem;
    color: var(--text);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
  }
  .recursive {
    margin-top: 0.75rem;
    padding: 0.85rem;
    border: 1px solid rgba(140, 220, 255, 0.2);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(75, 177, 218, 0.075), rgba(68, 55, 125, 0.07));
  }
  .recursive.locked { opacity: 0.58; }
  .recursive-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
  .recursive-head span { display: block; margin-bottom: 0.16rem; font-size: 0.54rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #80c9eb; }
  .recursive h3 { margin: 0; font-family: Georgia, serif; font-size: 1rem; font-weight: 500; letter-spacing: 0; text-transform: none; color: #d9f2ff; }
  .recursive-head > strong { font-size: 0.62rem; color: #9fdcf4; }
  .recursive > p { margin: 0.45rem 0 0; font-family: Georgia, serif; font-size: 0.74rem; font-style: italic; color: var(--dim); }
  .recursive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.7rem; }
  .recursive-work { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.55rem; padding: 0.7rem; border: 1px solid rgba(140, 220, 255, 0.14); border-radius: 10px; background: rgba(2, 8, 13, 0.34); }
  .recursive-work.affordable { border-color: color-mix(in srgb, var(--amber) 28%, transparent); box-shadow: inset 0 0 1.05rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .recursive-work.unaffordable { color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: linear-gradient(132deg, transparent 0 48%, color-mix(in srgb, var(--dim) 8%, transparent) 49% 50%, transparent 51%) 0 0 / 2.6rem 2.6rem, color-mix(in srgb, var(--bg) 88%, var(--panel)); border-color: color-mix(in srgb, var(--dim) 9%, transparent); }
  .work-glyph { width: 1.9rem; height: 1.9rem; display: grid; place-items: center; color: #c5efff; border: 1px solid rgba(140, 220, 255, 0.2); border-radius: 50%; box-shadow: 0 0 14px rgba(105, 210, 255, 0.08); }
  .work-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
  .work-copy small { font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #80c9eb; }
  .work-copy strong { font-size: 0.78rem; color: #e5f6ff; }
  .work-copy em { font-family: Georgia, serif; font-size: 0.66rem; line-height: 1.3; color: var(--dim); }
  .work-copy span { font-size: 0.62rem; color: #a9d2e4; }
  .work-copy b { margin-top: 0.1rem; font-size: 0.58rem; font-weight: 650; color: #9fe3ff; }
  .recursive-work button { grid-column: 1 / -1; justify-self: start; padding: 0.3rem 0.72rem; font: inherit; font-size: 0.64rem; font-weight: 750; color: #06131c; background: linear-gradient(180deg, #d6f3ff, #80c9eb); border: 0; border-radius: 999px; cursor: pointer; }
  .recursive-work button:disabled,
  .recursive-work button.unaffordable { opacity: 1; color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: color-mix(in srgb, var(--bg) 86%, var(--panel)); box-shadow: inset 0 0 0.8rem rgba(0,0,0,0.32); cursor: default; }
  .deep.tidefall {
    background:
      radial-gradient(ellipse at 50% -10%, rgba(71, 206, 205, 0.13), transparent 30%),
      radial-gradient(ellipse at 50% 64%, rgba(51, 48, 117, 0.14), transparent 47%),
      linear-gradient(180deg, rgba(3, 23, 33, 0.98), rgba(2, 8, 20, 0.985) 54%, rgba(5, 4, 16, 0.99));
    border-color: rgba(88, 222, 216, 0.2);
    box-shadow: 0 25px 90px rgba(0, 5, 15, 0.68), inset 0 1px rgba(185, 255, 242, 0.035);
  }
  .tidefall .title-block > span { color: rgba(88, 222, 216, 0.6); }
  .tidefall h2 { color: #c9fff7; }
  .tidefall h3 { color: rgba(157, 220, 221, 0.72); }
  .tidefall .balance { color: #b9fff2; text-shadow: 0 0 16px rgba(88, 222, 216, 0.45); }
  .tidefall .fold { border-color: rgba(88, 222, 216, 0.18); background: linear-gradient(180deg, rgba(52, 169, 172, 0.065), rgba(46, 46, 108, 0.055)); }
  .tidefall .fold.ready { border-color: rgba(119, 239, 225, 0.42); box-shadow: inset 0 0 34px rgba(58, 183, 178, 0.1); }
  .tidefall .fold-btn,
  .tidefall .buy,
  .tidefall .recursive-work button { color: #03161b; background: linear-gradient(180deg, #d1fff7, #58ded8); box-shadow: 0 0 22px rgba(88, 222, 216, 0.17); }
  .tidefall .item,
  .tidefall .trial { position: relative; overflow: hidden; background: linear-gradient(120deg, rgba(40, 126, 139, 0.045), rgba(25, 20, 59, 0.05)); border-color: rgba(113, 191, 200, 0.11); }
  .tidefall .item::before,
  .tidefall .trial::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 2px; background: linear-gradient(180deg, rgba(88, 222, 216, 0.08), rgba(81, 80, 174, 0.25), rgba(88, 222, 216, 0.08)); }
  .tidefall .item.owned { border-color: rgba(88, 222, 216, 0.3); }
  .tidefall .trial.done { border-color: rgba(121, 231, 214, 0.34); }
  .tidefall .trial.active { border-color: rgba(129, 143, 255, 0.48); box-shadow: 0 0 18px rgba(77, 78, 177, 0.14); }
  .tidefall .desc { color: #a6d6d7; }
  .tidefall .held { color: rgba(185, 255, 242, 0.78); }
  .tidefall .trial-progress i.done { background: linear-gradient(90deg, #58ded8, #777fe8); box-shadow: 0 0 7px rgba(88, 222, 216, 0.4); }
  .tidefall .circle-head h4 { color: #a8e9e3; }
  .tidefall .recursive { border-color: rgba(88, 222, 216, 0.2); background: linear-gradient(145deg, rgba(36, 139, 150, 0.075), rgba(48, 37, 105, 0.09)); }
  .tidefall .recursive-head span,
  .tidefall .work-copy small { color: #58ded8; }
  .tidefall .recursive h3,
  .tidefall .work-copy strong { color: #d8fffb; }
  .tidefall .recursive-work { border-color: rgba(88, 222, 216, 0.14); background: linear-gradient(150deg, rgba(1, 20, 28, 0.5), rgba(10, 7, 28, 0.45)); }
  .tidefall .work-glyph { color: #b9fff2; border-color: rgba(88, 222, 216, 0.22); }
  .tidefall .work-copy span { color: #a9d9d5; }
  .tidefall .work-copy b,
  .tidefall .recursive-head > strong { color: #b9fff2; }
  @media (max-width: 720px) {
    .shop, .trials, .recursive-grid { grid-template-columns: 1fr; }
  }
</style>
