<script lang="ts">
  import { onMount } from 'svelte'
  import { isPlaying, startMusic, stopMusic } from '../audio/music'
  import {
    CLOCKWORK_REVELATION_BEATS,
    CLOCKWORK_REVELATION_DURATION_MS,
    CLOCKWORK_REVELATION_TRIGGER,
    clockworkRevelationBeatAt,
    planClockworkRevelation,
  } from '../content/universes/clockwork/revelation'
  import { game } from '../engine/game.svelte'

  let {
    replay = false,
    onfinished,
  }: {
    replay?: boolean
    onfinished: () => void
  } = $props()

  const timeScale = import.meta.env.DEV
    ? Math.max(0.02, Math.min(1, Number(new URLSearchParams(window.location.search).get('revelation-speed')) || 1))
    : 1
  const reducedMotion = game.motionPreference === 'reduced'
  const plan = planClockworkRevelation(0, {
    reducedMotion,
    muted: game.sfxVolume <= 0 && game.musicVolume <= 0,
  })
  const sealRealms = [
    { id: 'brahmalok', name: 'Brahmalok', verb: 'bringing forth', mark: 'lotus' },
    { id: 'vishnulok', name: 'Vishnulok', verb: 'sustaining', mark: 'circuit' },
    { id: 'kailash', name: 'Kailash', verb: 'releasing', mark: 'mountain' },
  ] as const

  let scene: HTMLDivElement
  let continueButton = $state<HTMLButtonElement>()
  let elapsedMs = $state(0)
  let ready = $state(false)
  let resumeMusic = false
  let timer: ReturnType<typeof setInterval> | undefined

  const beat = $derived(clockworkRevelationBeatAt(elapsedMs))
  const beatIndex = $derived(CLOCKWORK_REVELATION_BEATS.findIndex(({ id }) => id === beat.id))
  const progress = $derived(Math.min(1, elapsedMs / CLOCKWORK_REVELATION_DURATION_MS))
  const revealForecasts = $derived(beatIndex >= 4)
  const revealSeals = $derived(beatIndex >= 5)
  const cityResumed = $derived(beat.id === 'passage-remains')

  function finish() {
    if (resumeMusic && game.ui.includes('music')) startMusic()
    onfinished()
  }

  $effect(() => {
    if (!ready) return
    queueMicrotask(() => continueButton?.focus())
  })

  onMount(() => {
    queueMicrotask(() => scene?.focus())
    resumeMusic = isPlaying()
    stopMusic()
    const startedAt = performance.now()
    const tick = () => {
      elapsedMs = Math.min(
        CLOCKWORK_REVELATION_DURATION_MS,
        (performance.now() - startedAt) / timeScale,
      )
      if (elapsedMs < CLOCKWORK_REVELATION_DURATION_MS) return
      ready = true
      clearInterval(timer)
    }
    tick()
    timer = window.setInterval(tick, 50)
    return () => clearInterval(timer)
  })
</script>

<div
  bind:this={scene}
  class="revelation"
  class:reduced={reducedMotion}
  class:resumed={cityResumed}
  role="dialog"
  aria-modal="true"
  aria-labelledby="revelation-title"
  aria-describedby="revelation-description"
  tabindex="-1"
  data-scene={CLOCKWORK_REVELATION_TRIGGER.sceneId}
  data-beat={beat.id}
  data-presentation={plan.presentation}
  data-audio={plan.audio}
  data-replay={replay}
  style={`--revelation-progress:${progress};--beat-index:${beatIndex}`}
>
  <div class="blackout" aria-hidden="true"></div>
  <div class="clock-field" aria-hidden="true">
    <span class="meridian"></span>
    <span class="regulator-ring ring-one"></span>
    <span class="regulator-ring ring-two"></span>
    <span class="regulator-arm arm-one"></span>
    <span class="regulator-arm arm-two"></span>
    <span class="local-tick"></span>
  </div>

  <header class="docket">
    <div>
      <span>Clockwork civic schedule</span>
      <strong id="revelation-title">The Unscheduled Interval</strong>
    </div>
    <ol aria-label="Revelation progress">
      {#each CLOCKWORK_REVELATION_BEATS as item, index (item.id)}
        <li class:active={index === beatIndex} class:complete={index < beatIndex}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <i aria-hidden="true"></i>
        </li>
      {/each}
    </ol>
  </header>

  <main class="stage">
    <section class="schedule" aria-hidden="true">
      <span>POWER TRAIN</span><span>CAUSAL TRAIN</span><span>CADENCE TRAIN</span><span>EFFICIENCY TRAIN</span>
      <strong>UNSCHEDULED INTERVAL</strong>
    </section>

    <div class="blank-date" aria-hidden="true"><span></span><i></i></div>

    <div class="witness" aria-hidden="true">
      <span class="witness-head"></span>
      <span class="witness-body"></span>
      <small>WITNESS OUTSIDE THE CALENDAR</small>
    </div>

    <section class="forecast-plates" class:visible={revealForecasts} aria-label="Reclassified Clockwork forecasts">
      <article><span>PRISMATA</span><i class="prism-mark"></i><strong>INCOMPLETE MODEL</strong></article>
      <article><span>TEMPEST</span><i class="storm-mark"></i><strong>INCOMPLETE MODEL</strong></article>
      <article><span>CANTICLE</span><i class="wave-mark"></i><strong>INCOMPLETE MODEL</strong></article>
    </section>

    <section class="loka-seals" class:visible={revealSeals} aria-label="Three revealed lokas">
      {#each sealRealms as realm (realm.id)}
        <article data-realm={realm.id}>
          <div class={`seal ${realm.mark}`} aria-hidden="true">
            {#each Array.from({ length: realm.mark === 'lotus' ? 8 : 4 }) as _}<i></i>{/each}
            <b></b>
          </div>
          <span>{realm.verb}</span>
          <strong>{realm.name}</strong>
        </article>
      {/each}
    </section>
  </main>

  {#key beat.id}
    <section class="caption" role="status" aria-live="polite">
      <span>{String(beatIndex + 1).padStart(2, '0')} / {CLOCKWORK_REVELATION_BEATS.length}</span>
      <p>{beat.prose}</p>
      <small id="revelation-description">{beat.accessibleDescription}</small>
    </section>
  {/key}

  <div class="progress" aria-hidden="true"><i></i></div>

  {#if ready}
    <button bind:this={continueButton} class="continue" onclick={finish}>approach the three passages</button>
  {:else if replay}
    <button class="skip" onclick={finish}>Leave remembered interval</button>
  {/if}
</div>

<style>
  .revelation {
    --clock-gold: #e1b96c;
    --clock-blue: #8fd9f0;
    position: fixed;
    inset: 0;
    z-index: 40;
    overflow: hidden;
    color: #e7e2d7;
    background: #020307;
    isolation: isolate;
  }
  .blackout {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 46%, rgba(48, 61, 69, 0.18), transparent 27%),
      linear-gradient(180deg, rgba(9, 13, 19, 0.72), #010205 76%);
  }
  .clock-field { position: absolute; inset: 0; opacity: 0.52; }
  .meridian { position: absolute; left: 50%; top: 0; width: 1px; height: 100%; background: linear-gradient(transparent, rgba(225,185,108,.22), transparent); }
  .regulator-ring { position: absolute; left: 50%; top: 48%; border: 1px solid rgba(225,185,108,.13); border-radius: 50%; transform: translate(-50%, -50%); transition: opacity 1s ease; }
  .ring-one { width: min(62vw, 50rem); aspect-ratio: 1.55; }
  .ring-two { width: min(42vw, 34rem); aspect-ratio: 1; }
  .regulator-arm { position: absolute; left: 50%; top: 48%; width: min(32vw, 25rem); height: 1px; background: linear-gradient(90deg, transparent, rgba(225,185,108,.22)); transform-origin: left center; }
  .arm-one { transform: rotate(32deg); }
  .arm-two { transform: rotate(148deg); }
  .local-tick { position: absolute; left: calc(50% - .28rem); top: calc(48% - .28rem); width: .56rem; height: .56rem; border: 1px solid rgba(225,185,108,.55); border-radius: 50%; opacity: 0; }
  [data-beat='city-holds'] .clock-field,
  [data-beat='blank-date'] .clock-field,
  [data-beat='witness-arrives'] .clock-field,
  [data-beat='forecasts-reclassified'] .clock-field,
  [data-beat='three-loka-seals'] .clock-field { filter: saturate(.25); }
  .resumed .local-tick { opacity: 1; animation: local-tick 1.8s ease-out both; }

  .docket {
    position: absolute;
    left: clamp(1rem, 4vw, 4rem);
    right: clamp(1rem, 4vw, 4rem);
    top: clamp(1rem, 5vh, 3.2rem);
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 2rem;
    padding-bottom: .72rem;
    border-bottom: 1px solid rgba(225,185,108,.2);
  }
  .docket div > span { display: block; color: rgba(174,194,204,.55); font: 700 .54rem/1.2 system-ui, sans-serif; letter-spacing: .19em; text-transform: uppercase; }
  .docket strong { display: block; margin-top: .2rem; color: #ded8ca; font: 500 clamp(1.1rem, 2vw, 1.75rem)/1.1 Georgia, serif; }
  .docket ol { display: flex; align-items: end; gap: .3rem; margin: 0; padding: 0; list-style: none; }
  .docket li { display: grid; gap: .25rem; width: clamp(1.6rem, 4vw, 3.2rem); color: rgba(168,183,190,.32); font: 700 .46rem/1 system-ui, sans-serif; font-variant-numeric: tabular-nums; }
  .docket li i { display: block; height: 2px; background: currentColor; }
  .docket li.complete { color: rgba(143,217,240,.48); }
  .docket li.active { color: var(--clock-gold); }

  .stage { position: absolute; inset: 17% 5% 22%; }
  .schedule { position: absolute; left: 50%; top: 7%; width: min(32rem, 78vw); display: grid; grid-template-columns: repeat(4, 1fr); gap: .45rem; transform: translateX(-50%); transition: opacity .7s ease, transform .7s ease; }
  .schedule span,
  .schedule strong { padding: .45rem .55rem; color: rgba(164,179,187,.35); border: 1px solid rgba(164,179,187,.11); font: 700 .48rem/1.2 system-ui, sans-serif; letter-spacing: .1em; text-align: center; }
  .schedule strong { grid-column: 1 / -1; color: #e4c988; border-color: rgba(225,185,108,.5); background: rgba(225,185,108,.06); animation: docket-stamp .8s steps(3, end) both; }
  [data-beat]:not([data-beat='schedule-fault']) .schedule { opacity: .28; transform: translateX(-50%) translateY(-.6rem); }

  .blank-date { position: absolute; left: 50%; top: 49%; width: 5.4rem; height: 5.4rem; transform: translate(-50%, -50%) scale(.42); opacity: 0; transition: opacity .8s ease, transform 1.4s ease; }
  .blank-date span { position: absolute; inset: 0; border: 1px solid rgba(225,185,108,.66); box-shadow: 0 0 2.4rem rgba(225,185,108,.12), inset 0 0 1.2rem rgba(0,0,0,.8); }
  .blank-date i { position: absolute; inset: 23%; border: 1px solid rgba(143,217,240,.28); transform: rotate(45deg); }
  [data-beat='blank-date'] .blank-date,
  [data-beat='witness-arrives'] .blank-date { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  [data-beat='witness-arrives'] .blank-date { transform: translate(-50%, -50%) scale(2.7); opacity: .22; }

  .witness { position: absolute; left: 50%; top: 50%; width: 7rem; height: 13rem; transform: translate(-50%, -43%); opacity: 0; transition: opacity 1.2s ease; }
  .witness-head { position: absolute; left: 50%; top: 0; width: 2.15rem; height: 2.45rem; transform: translateX(-50%); border-radius: 48% 48% 42% 42%; background: #020307; box-shadow: 0 0 0 1px rgba(143,217,240,.18), 0 0 2.4rem rgba(143,217,240,.09); }
  .witness-body { position: absolute; left: 50%; top: 2rem; width: 6.5rem; height: 9rem; transform: translateX(-50%); background: #020307; clip-path: polygon(43% 0, 57% 0, 82% 36%, 100% 100%, 0 100%, 18% 36%); box-shadow: inset 0 0 0 1px rgba(143,217,240,.12); }
  .witness small { position: absolute; left: 50%; bottom: 0; width: max-content; transform: translateX(-50%); color: rgba(143,217,240,.58); font: 700 .48rem/1 system-ui, sans-serif; letter-spacing: .16em; }
  [data-beat='witness-arrives'] .witness { opacity: 1; }

  .forecast-plates,
  .loka-seals { position: absolute; left: 50%; top: 50%; width: min(52rem, 90vw); display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(.5rem, 2vw, 1.4rem); transform: translate(-50%, -42%); opacity: 0; pointer-events: none; transition: opacity 1s ease, transform 1s ease; }
  .forecast-plates.visible,
  .loka-seals.visible { opacity: 1; transform: translate(-50%, -50%); }
  .forecast-plates article { min-height: 8rem; display: grid; place-items: center; align-content: center; gap: .7rem; padding: .8rem; color: rgba(173,189,197,.5); border: 1px solid rgba(173,189,197,.18); background: rgba(7,9,13,.78); }
  .forecast-plates article > span,
  .forecast-plates article > strong { font: 700 .52rem/1 system-ui, sans-serif; letter-spacing: .14em; }
  .forecast-plates article > strong { color: rgba(225,185,108,.72); }
  .forecast-plates i { width: 2.7rem; height: 2.7rem; opacity: .52; }
  .prism-mark { border: 1px solid #bd9bdb; transform: rotate(45deg); }
  .storm-mark { border: 1px solid #d27f69; clip-path: polygon(46% 0, 100% 0, 62% 42%, 92% 42%, 30% 100%, 45% 56%, 12% 56%); background: #d27f69; }
  .wave-mark { border: 1px solid #9dbaca; border-radius: 50%; box-shadow: inset 0 0 0 .5rem #07090d, inset 0 0 0 .56rem #9dbaca; }
  [data-beat='three-loka-seals'] .forecast-plates,
  [data-beat='passage-remains'] .forecast-plates { opacity: 0; transform: translate(-50%, -58%); }

  .loka-seals article { min-width: 0; text-align: center; }
  .loka-seals article > span { display: block; margin-top: .9rem; color: rgba(194,201,198,.56); font: 700 .52rem/1 system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .loka-seals article > strong { display: block; margin-top: .32rem; color: #eee8da; font: 500 clamp(1rem, 2.2vw, 1.5rem)/1 Georgia, serif; }
  .seal { position: relative; width: clamp(5.4rem, 9vw, 7rem); aspect-ratio: 1; margin: auto; color: #d8b768; border: 1px solid currentColor; border-radius: 50%; filter: drop-shadow(0 0 1.2rem rgba(216,183,104,.14)); }
  .seal i,
  .seal b { position: absolute; display: block; }
  .lotus i { left: 50%; top: 50%; width: 23%; height: 46%; border: 1px solid currentColor; border-radius: 70% 20% 70% 20%; transform-origin: 0 0; }
  .lotus i:nth-child(1) { transform: rotate(0deg) translate(-50%, -84%); } .lotus i:nth-child(2) { transform: rotate(45deg) translate(-50%, -84%); } .lotus i:nth-child(3) { transform: rotate(90deg) translate(-50%, -84%); } .lotus i:nth-child(4) { transform: rotate(135deg) translate(-50%, -84%); } .lotus i:nth-child(5) { transform: rotate(180deg) translate(-50%, -84%); } .lotus i:nth-child(6) { transform: rotate(225deg) translate(-50%, -84%); } .lotus i:nth-child(7) { transform: rotate(270deg) translate(-50%, -84%); } .lotus i:nth-child(8) { transform: rotate(315deg) translate(-50%, -84%); }
  .lotus b { inset: 39%; border: 1px solid currentColor; border-radius: 50%; }
  .circuit { color: #75c8d7; }
  .circuit i { inset: 14%; border: 1px solid currentColor; border-radius: 50%; }
  .circuit i:nth-child(2) { inset: 27%; } .circuit i:nth-child(3) { inset: 40%; } .circuit i:nth-child(4) { inset: 47%; background: currentColor; }
  .circuit b { left: 49%; top: 0; width: 2%; height: 100%; background: linear-gradient(transparent 0 12%, currentColor 12% 18%, transparent 18% 82%, currentColor 82% 88%, transparent 88%); transform: rotate(48deg); }
  .mountain { color: #b5bdcf; border-radius: 50% 50% 42% 42%; }
  .mountain i { left: 13%; right: 13%; bottom: 20%; height: 53%; border-left: 1px solid currentColor; border-top: 1px solid currentColor; transform: rotate(45deg) skew(-8deg, -8deg); }
  .mountain i:nth-child(2) { left: 34%; right: 34%; bottom: 29%; height: 32%; opacity: .55; }
  .mountain i:nth-child(3), .mountain i:nth-child(4) { display: none; }
  .mountain b { left: calc(50% - 2px); top: calc(50% - 2px); width: 4px; height: 4px; border-radius: 50%; background: currentColor; box-shadow: 0 0 1rem currentColor; }

  .caption { position: absolute; left: 50%; bottom: 8.5%; width: min(47rem, 88vw); transform: translateX(-50%); text-align: center; animation: caption-in .7s ease both; }
  .caption > span { color: rgba(143,217,240,.58); font: 700 .5rem/1 system-ui, sans-serif; letter-spacing: .18em; }
  .caption p { margin: .48rem 0 .3rem; color: #e8dfce; font: italic clamp(1rem, 2.2vw, 1.35rem)/1.4 Georgia, serif; }
  .caption small { display: block; color: rgba(183,194,199,.5); font: 500 .62rem/1.4 system-ui, sans-serif; }
  .progress { position: absolute; left: 50%; bottom: 5.4%; width: min(38rem, 74vw); height: 1px; transform: translateX(-50%); background: rgba(255,255,255,.08); }
  .progress i { display: block; width: calc(var(--revelation-progress) * 100%); height: 100%; background: var(--clock-gold); box-shadow: 0 0 .8rem rgba(225,185,108,.35); }
  button { font: 700 .66rem/1 system-ui, sans-serif; letter-spacing: .07em; cursor: pointer; }
  .continue { position: absolute; left: 50%; bottom: 2%; transform: translateX(-50%); padding: .62rem 1.2rem; color: #101014; background: #e2c47f; border: 1px solid #f5dfaa; border-radius: 999px; animation: caption-in .7s ease both; }
  .skip { position: absolute; right: 2rem; bottom: 2rem; padding: .45rem .7rem; color: rgba(218,218,218,.62); background: rgba(5,7,10,.72); border: 1px solid rgba(255,255,255,.12); border-radius: .35rem; }
  @keyframes docket-stamp { from { opacity: 0; transform: translateY(-.5rem); } to { opacity: 1; transform: translateY(0); } }
  @keyframes caption-in { from { opacity: 0; transform: translate(-50%, .5rem); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes local-tick { 0% { transform: scale(.3); box-shadow: 0 0 0 rgba(225,185,108,0); } 45% { transform: scale(1.5); box-shadow: 0 0 2rem rgba(225,185,108,.5); } 100% { transform: scale(1); box-shadow: 0 0 .7rem rgba(225,185,108,.3); } }
  .reduced *,
  :global(html[data-motion='reduced']) .revelation * { animation: none !important; transition: none !important; }
  @media (max-width: 720px) {
    .docket { align-items: start; gap: .8rem; }
    .docket ol { display: grid; grid-template-columns: repeat(4, 1fr); width: 9rem; }
    .stage { inset: 20% 3% 25%; }
    .schedule { grid-template-columns: repeat(2, 1fr); top: 2%; }
    .forecast-plates,
    .loka-seals { gap: .35rem; }
    .forecast-plates article { min-height: 6.5rem; padding: .35rem; }
    .forecast-plates article > strong { font-size: .4rem; letter-spacing: .06em; }
    .loka-seals article > span { font-size: .42rem; letter-spacing: .08em; }
    .loka-seals article > strong { font-size: .9rem; }
    .caption { bottom: 9%; }
    .caption small { display: none; }
    .progress { bottom: 6%; }
    .continue { bottom: 1.5%; }
    .skip { right: 1rem; bottom: 1rem; }
  }
  @media (prefers-reduced-motion: reduce) { .revelation * { animation: none !important; transition: none !important; } }
</style>
