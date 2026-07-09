<script lang="ts">
  import { onMount } from 'svelte'
  import {
    CURIOSITIES,
    KEEPER_FED_HOURS,
    LETTER_TEXT,
    SNAIL_CROSSING_SEC,
    keeperMealCost,
  } from '../content/curiosities'
  import {
    game,
    buyCuriosity,
    collectSnailGift,
    feedHearthkeeper,
    hearthkeeperFed,
    passiveRatePerSec,
    snailProgress,
  } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playBuy, playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'

  let { onclose }: { onclose: () => void } = $props()
  let now = $state(Date.now())
  let letterOpen = $state(false)

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(timer)
  })

  const held = (id: string) => game.curiosities.includes(id)
  const visible = $derived(
    CURIOSITIES.filter((c) => held(c.id) || game.totalEarned >= c.cost * 0.25),
  )
  const nextHidden = $derived(
    CURIOSITIES.find((c) => !held(c.id) && game.totalEarned < c.cost * 0.25),
  )
  const fed = $derived(hearthkeeperFed(now))
  const fedLeft = $derived(Math.max(0, game.keeperFedUntil - now))
  const mealCost = $derived(keeperMealCost(passiveRatePerSec()))
  const snailReady = $derived(snailProgress(now) >= 1)

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
    if (!buyCuriosity(id)) return
    playBuy()
    save()
    pushToast('A curiosity joins you', CURIOSITIES.find((c) => c.id === id)?.flavor ?? '', 'cabinet')
  }

  function tryFeed() {
    if (!feedHearthkeeper()) return
    playBuy()
    save()
    pushToast('The Hearthkeeper approves', `Fed for ${KEEPER_FED_HOURS} hours.`, 'curiosity')
  }

  function tryCollectSnail() {
    const amount = collectSnailGift()
    if (amount <= 0) return
    playCollect()
    save()
    pushToast('The snail arrives', `✦ ${format(amount)} carried home slowly.`, 'curiosity')
  }
</script>

<section class="cabinet">
  <header>
    <h2>Curiosities</h2>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <div class="rows">
    {#each visible as c (c.id)}
      {@const owned = held(c.id)}
      <article class="row" class:owned style:--hue={c.hue}>
        <span class="dot"></span>
        <span class="copy">
          <strong>{owned ? c.name : '???'}</strong>
          <em>{owned ? c.flavor : 'Something waits in the dark.'}</em>
          <span>{owned ? c.desc : `✦ ${format(c.cost)}`}</span>
        </span>
        {#if owned}
          <span class="held">held</span>
        {:else}
          <button class="buy" disabled={game.challenge !== null || game.light < c.cost} onclick={() => tryBuy(c.id)}>
            ✦ {format(c.cost)}
          </button>
        {/if}

        {#if owned && c.kind === 'hearthkeeper'}
          <div class="special">
            <span>{fed ? `fed ${fmtDuration(fedLeft)}` : 'sulking softly'}</span>
            <button class="small" disabled={game.challenge !== null || game.light < mealCost} onclick={tryFeed}>
              feed ✦ {format(mealCost)}
            </button>
          </div>
        {:else if owned && c.kind === 'snail'}
          <div class="special">
            <span>{snailReady ? 'arrived' : `${Math.floor(snailProgress(now) * 100)}% across`}</span>
            <button class="small" disabled={game.challenge !== null || !snailReady} onclick={tryCollectSnail}>
              gather
            </button>
          </div>
        {:else if owned && c.kind === 'letter'}
          <div class="special letter">
            <button class="small" onclick={() => (letterOpen = !letterOpen)}>
              {letterOpen ? 'fold' : 'read'}
            </button>
            {#if letterOpen}
              <p>{LETTER_TEXT}</p>
            {/if}
          </div>
        {:else if owned && c.kind === 'door'}
          <div class="special">
            <span>{game.allTimeEarned >= 1e30 ? 'ajar' : 'locked without a wall'}</span>
          </div>
        {/if}
      </article>
    {/each}

    {#if nextHidden}
      <article class="row teased">
        <span class="dot mystery"></span>
        <span class="copy">
          <strong>???</strong>
          <em>The cabinet has room for stranger things.</em>
        </span>
      </article>
    {/if}
  </div>
</section>

<style>
  .cabinet {
    position: fixed;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    width: min(23rem, calc(100vw - 2.5rem));
    max-height: 80vh;
    overflow-y: auto;
    padding: 1rem 1.1rem;
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.14);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    z-index: 6;
    animation: cabinet-in 0.5s ease both;
    scrollbar-width: thin;
  }
  @keyframes cabinet-in {
    from { opacity: 0; transform: translateY(-50%) translateX(-14px); }
    to { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }
  h2 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.9rem;
    cursor: pointer;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.65rem;
    align-items: center;
    padding: 0.65rem 0.7rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
  }
  .row.owned {
    border-color: hsla(var(--hue), 80%, 65%, 0.24);
    background: hsla(var(--hue), 80%, 50%, 0.06);
  }
  .row.teased {
    opacity: 0.45;
  }
  .dot {
    width: 0.72rem;
    height: 0.72rem;
    border-radius: 50%;
    background: hsl(var(--hue), 90%, 65%);
    box-shadow: 0 0 10px hsla(var(--hue), 90%, 65%, 0.65);
  }
  .dot.mystery {
    background: #4a435e;
    box-shadow: none;
  }
  .copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
  }
  strong {
    font-size: 0.88rem;
    color: var(--text);
  }
  em {
    font-family: Georgia, serif;
    font-size: 0.76rem;
    line-height: 1.3;
    color: var(--dim);
  }
  .copy span,
  .special span {
    font-size: 0.74rem;
    color: hsl(var(--hue), 80%, 72%);
  }
  .held {
    font-size: 0.7rem;
    color: var(--dim);
  }
  .buy,
  .small {
    padding: 0.32rem 0.65rem;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;
    color: #1a1206;
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: none;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
  }
  .buy:disabled,
  .small:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .special {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding-top: 0.45rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .special.letter {
    display: block;
  }
  .special.letter p {
    margin: 0.55rem 0 0;
    white-space: pre-line;
    font-family: Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.45;
    color: rgba(230, 226, 245, 0.9);
  }
  @media (max-width: 720px) {
    .cabinet {
      left: 0.6rem;
      right: 0.6rem;
      top: 3.6rem;
      transform: none;
      max-height: 55vh;
      width: auto;
    }
    @keyframes cabinet-in {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
</style>
