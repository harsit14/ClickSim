<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { UniverseId } from '../content/universes'
  import type { GardenClosure, GardenLink, GardenNode } from '../endgame/garden'
  import type { GardenEnding } from '../endgame/types'
  import {
    allGardenPresencesTended,
    COMPANION_IDLE_MS,
    COMPANION_SETTLE_MS,
    companionStillnessComplete,
    HUNGER_HOLD_MS,
    hungerHoldComplete,
    ritualProgress,
    tendGardenPresence,
  } from '../endgame/garden-ritual'

  let {
    nodes,
    links,
    closures,
    answers,
    ending,
    credits,
    reducedMotion = false,
    frozen = false,
    exportMessage = '',
    onclose,
    onreturn,
    onchoose,
    oncontinueatlas,
    onfreeze,
    onexport,
  }: {
    nodes: readonly GardenNode[]
    links: readonly GardenLink[]
    closures: readonly GardenClosure[]
    answers: readonly GardenEnding[]
    ending: GardenEnding | null
    credits: readonly string[]
    reducedMotion?: boolean
    frozen?: boolean
    exportMessage?: string
    onclose: () => void
    onreturn: () => void
    onchoose: (ending: GardenEnding) => void
    oncontinueatlas: () => void
    onfreeze: () => void
    onexport: () => void
  } = $props()

  const MATERIALS: Record<UniverseId, string> = {
    emberlight: 'banked coal and hearthstone',
    tidefall: 'returning water and salt',
    verdance: 'root, leaf, and living shade',
    clockwork: 'open brass and an unclaimed interval',
    brahmalok: 'lotus water, manuscript margin, and fourfold light',
    vishnulok: 'still ocean, open refuge, and returning current',
    kailash: 'moonlit snow, blue stone, and the path downward',
  }

  function materialFor(universeId: UniverseId): string {
    return MATERIALS[universeId]
  }

  type Ritual = 'choice' | 'warden' | 'hunger' | 'companion'
  let ritual = $state<Ritual>('choice')
  let selectedUniverseId = $state<UniverseId | null>(null)
  let tended = $state<readonly UniverseId[]>([])
  let hungerHolding = $state(false)
  let hungerStartedAt = $state<number | null>(null)
  let hungerElapsed = $state(0)
  let companionArmed = $state(false)
  let companionLastInputAt = $state<number | null>(null)
  let companionElapsed = $state(0)
  let animationFrame: number | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let wardenTimer: ReturnType<typeof setTimeout> | null = null

  const ritualRatio = $derived(
    ritual === 'hunger'
      ? ritualProgress(hungerElapsed, HUNGER_HOLD_MS)
      : ritual === 'companion'
        ? ritualProgress(companionElapsed, COMPANION_IDLE_MS)
        : nodes.length > 0 ? tended.length / nodes.length : 0,
  )

  const hungerWords = $derived(
    ritualRatio < .28 ? 'Keep drawing them inward.'
      : ritualRatio < .62 ? 'Do not release what you chose to take.'
        : ritualRatio < .9 ? 'The field is resisting you.'
          : 'Hold through the last refusal.',
  )

  const companionWords = $derived(
    !companionArmed ? 'Step away. Let the field settle.'
      : ritualRatio < .32 ? 'Do nothing.'
        : ritualRatio < .7 ? 'They are beginning without you.'
          : 'Stay outside the answer.',
  )
  const selectedNode = $derived(nodes.find((node) => node.universeId === selectedUniverseId) ?? nodes[0] ?? null)

  function cancelFrame() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  function finish(id: GardenEnding) {
    cancelFrame()
    hungerHolding = false
    companionArmed = false
    onchoose(id)
  }

  function tickHunger(now: number) {
    if (!hungerHolding || hungerStartedAt === null) return
    hungerElapsed = Math.max(0, now - hungerStartedAt)
    if (hungerHoldComplete(hungerStartedAt, now)) {
      hungerElapsed = HUNGER_HOLD_MS
      finish('hunger')
      return
    }
    animationFrame = requestAnimationFrame(tickHunger)
  }

  function startHungerHold() {
    if (ritual !== 'hunger' || hungerHolding || ending) return
    cancelFrame()
    hungerHolding = true
    hungerStartedAt = performance.now()
    hungerElapsed = 0
    animationFrame = requestAnimationFrame(tickHunger)
  }

  function releaseHungerHold() {
    if (!hungerHolding || ending) return
    cancelFrame()
    hungerHolding = false
    hungerStartedAt = null
    hungerElapsed = 0
  }

  function tickCompanion(now: number) {
    if (ritual !== 'companion' || !companionArmed || companionLastInputAt === null || ending) return
    companionElapsed = Math.max(0, now - companionLastInputAt)
    if (companionStillnessComplete(companionLastInputAt, now)) {
      companionElapsed = COMPANION_IDLE_MS
      finish('companion')
      return
    }
    animationFrame = requestAnimationFrame(tickCompanion)
  }

  function armCompanion() {
    if (ritual !== 'companion' || ending) return
    cancelFrame()
    companionArmed = true
    companionLastInputAt = performance.now()
    companionElapsed = 0
    animationFrame = requestAnimationFrame(tickCompanion)
  }

  function noteInput() {
    if (ritual !== 'companion' || !companionArmed || ending) return
    cancelFrame()
    companionLastInputAt = performance.now()
    companionElapsed = 0
    animationFrame = requestAnimationFrame(tickCompanion)
  }

  function beginRitual(id: GardenEnding) {
    cancelFrame()
    if (settleTimer !== null) clearTimeout(settleTimer)
    if (id === 'continue') {
      finish(id)
      return
    }
    ritual = id
    tended = []
    hungerHolding = false
    hungerStartedAt = null
    hungerElapsed = 0
    companionArmed = false
    companionLastInputAt = null
    companionElapsed = 0
    if (id === 'companion') settleTimer = setTimeout(armCompanion, COMPANION_SETTLE_MS)
  }

  function resetRitual() {
    cancelFrame()
    if (settleTimer !== null) clearTimeout(settleTimer)
    settleTimer = null
    ritual = 'choice'
    tended = []
    hungerHolding = false
    hungerStartedAt = null
    hungerElapsed = 0
    companionArmed = false
    companionLastInputAt = null
    companionElapsed = 0
  }

  function tend(universeId: UniverseId) {
    if (ritual !== 'warden' || tended.includes(universeId) || ending) return
    tended = tendGardenPresence(tended, universeId)
    if (allGardenPresencesTended(tended, nodes.map((node) => node.universeId))) {
      wardenTimer = setTimeout(() => finish('warden'), 550)
    }
  }

  function hungerKeyDown(event: KeyboardEvent) {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault()
      startHungerHold()
    }
  }

  function hungerKeyUp(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      releaseHungerHold()
    }
  }

  onMount(() => {
    document.addEventListener('pointerdown', noteInput, true)
    document.addEventListener('keydown', noteInput, true)
    document.addEventListener('wheel', noteInput, { capture: true, passive: true })
  })

  onDestroy(() => {
    cancelFrame()
    if (settleTimer !== null) clearTimeout(settleTimer)
    if (wardenTimer !== null) clearTimeout(wardenTimer)
    document.removeEventListener('pointerdown', noteInput, true)
    document.removeEventListener('keydown', noteInput, true)
    document.removeEventListener('wheel', noteInput, true)
  })
</script>

<section
  class="garden-scene"
  class:reduced={reducedMotion}
  class:frozen
  class:warden-tending={ritual === 'warden'}
  class:hunger-drawing={ritual === 'hunger'}
  class:hunger-holding={hungerHolding}
  class:companion-waiting={ritual === 'companion'}
  class:companion-armed={companionArmed}
  class:ending-warden={ending === 'warden'}
  class:ending-hunger={ending === 'hunger'}
  class:ending-companion={ending === 'companion'}
  style:--ritual-progress={ritualRatio}
  aria-labelledby="garden-title"
>
  <div class="sky" aria-hidden="true">
    <i class="haze"></i>
    <i class="horizon"></i>
    <i class="near-ground"></i>
  </div>

  <div class="garden-actions">
    <div>
      <button onclick={onreturn}>Return to the Legacy</button>
      {#if ending}
        <button aria-pressed={frozen} onclick={onfreeze}>{frozen ? 'Resume Garden' : 'Freeze Garden'}</button>
        <button onclick={onexport}>Save ending card</button>
      {/if}
    </div>
    <button class="garden-close" aria-label="Close the Garden" onclick={onclose}>Close</button>
    {#if exportMessage}<p class="export-status" role="status">{exportMessage}</p>{/if}
  </div>

  <header class="garden-heading">
    <span>where restored worlds meet without becoming one</span>
    <h2 id="garden-title">The Garden</h2>
  </header>

  {#if ritual === 'choice' && selectedNode}
    <section class="presence-reading" aria-live="polite" aria-label={`Question from ${selectedNode.name}`}>
      <span>{selectedNode.name} asks</span>
      <strong>{selectedNode.question}</strong>
      <em>{selectedNode.offering} · {materialFor(selectedNode.universeId)}</em>
    </section>
  {/if}

  <svg class="relations" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
    <path class="shared-sky" d="M 135 170 C 330 80, 520 110, 780 150" />
    <path class="rain-treaty" d="M 125 420 C 230 520, 350 520, 455 455" />
    <path class="weather-clock" d="M 855 395 C 900 310, 900 230, 820 190" />
    <path class="choir-storms" d="M 860 405 C 750 540, 600 560, 500 500" />
    <path class="garden-map" d="M 450 470 C 470 510, 485 515, 505 505" />
    <path class="open-future" d="M 815 185 C 800 145, 790 140, 775 150" />
    <path class="first-water" d="M 130 175 C 65 250, 70 340, 120 420" />
  </svg>

  <div class="relation-names" aria-hidden="true">
    {#each links as link (link.id)}
      <span class={link.id}>{link.name}</span>
    {/each}
  </div>

  <div class="presences">
    {#each nodes as node (node.universeId)}
      <figure class="presence {node.universeId}" class:selected={selectedNode?.universeId === node.universeId} class:tended={tended.includes(node.universeId)}>
        <div class="material" aria-hidden="true">
          {#if node.universeId === 'emberlight'}
            <i class="coal"></i><i class="coal"></i><i class="coal"></i><b class="ember"></b>
          {:else if node.universeId === 'tidefall'}
            <i class="pool"></i><i class="drop"></i><b class="return-ring"></b>
          {:else if node.universeId === 'verdance'}
            <i class="trunk"></i><i class="branch left"></i><i class="branch right"></i><b class="leaf one"></b><b class="leaf two"></b><b class="leaf three"></b>
          {:else if node.universeId === 'clockwork'}
            <i class="wheel"></i><i class="tooth"></i><b class="hand"></b><b class="interval"></b>
          {:else if node.universeId === 'brahmalok'}
            <i class="lotus-petal north"></i><i class="lotus-petal east"></i><i class="lotus-petal south"></i><i class="lotus-petal west"></i><b class="lotus-center"></b><b class="open-margin"></b>
          {:else if node.universeId === 'vishnulok'}
            <i class="returning-current"></i><i class="refuge-arc"></i><b class="harbor-light"></b>
          {:else}
            <i class="summit left"></i><i class="summit right"></i><b class="downward-river"></b><b class="open-ring"></b>
          {/if}
        </div>
        <button
          class="presence-reader"
          disabled={ritual !== 'choice' || !!ending}
          aria-pressed={selectedNode?.universeId === node.universeId}
          aria-label={`Read ${node.name}: ${node.question}`}
          onfocus={() => (selectedUniverseId = node.universeId)}
          onpointerenter={() => (selectedUniverseId = node.universeId)}
          onclick={() => (selectedUniverseId = node.universeId)}
        ><span class="sr-only">Read {node.name}</span></button>
        {#if ritual === 'warden' && !ending}
          <button
            class="tend-presence"
            class:complete={tended.includes(node.universeId)}
            disabled={tended.includes(node.universeId)}
            aria-label={tended.includes(node.universeId) ? `${node.name} has been tended` : `Tend ${node.name}`}
            onclick={() => tend(node.universeId)}
          >{tended.includes(node.universeId) ? 'boundary kept' : 'tend this presence'}</button>
        {/if}
        <figcaption>
          <strong>{node.name}</strong>
          <span>{node.offering}</span>
          <small>{node.question}</small>
          <em>{materialFor(node.universeId)}</em>
        </figcaption>
      </figure>
    {/each}
  </div>

  <div class="clearing" aria-hidden="true"><i></i><b></b></div>

  {#if ending}
    <section class="garden-credits" aria-live="polite" aria-label="The Garden's answer">
      {#each credits as line, index}
        {#if index === 0}<h3>{line}</h3>{:else}<p>{line}</p>{/if}
      {/each}
      <button onclick={oncontinueatlas}>Walk on into the Atlas</button>
    </section>
  {:else if ritual === 'choice'}
    <section class="garden-answers" aria-labelledby="answers-title">
      <div class="answer-memory">
        <span id="answers-title">answers already lived</span>
        <strong>{answers.join(' · ') || 'none carried here'}</strong>
      </div>
      <div class="answer-paths">
        {#each closures as closure (closure.id)}
          <button class="path {closure.id}" onclick={() => beginRitual(closure.id)}>
            <strong>{closure.name}</strong>
            <span>{closure.consequence}</span>
            <em>{closure.finalLine}</em>
          </button>
        {/each}
      </div>
      {#if !closures.some((closure) => closure.id === 'continue')}
        <p class="continue-hint">Another path appears after every prior answer has been lived.</p>
      {/if}
    </section>
  {:else if ritual === 'warden'}
    <section class="ritual-instruction warden-instruction" aria-live="polite">
      <span>The Warden does not gather.</span>
      <strong>Visit every presence. Tend it, then leave its boundary intact.</strong>
      <button onclick={resetRitual}>Step back from this answer</button>
    </section>
  {:else if ritual === 'hunger'}
    <section class="ritual-instruction hunger-instruction" aria-live="polite">
      <span>The field will not call a brief appetite a doctrine.</span>
      <button
        class="hunger-hold"
        class:holding={hungerHolding}
        aria-label="Hold to draw every presence into the Heart; releasing begins again"
        onpointerdown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); startHungerHold() }}
        onpointerup={releaseHungerHold}
        onpointercancel={releaseHungerHold}
        onlostpointercapture={releaseHungerHold}
        onkeydown={hungerKeyDown}
        onkeyup={hungerKeyUp}
      >
        <i aria-hidden="true"></i>
        <strong>{hungerHolding ? hungerWords : 'Press and do not release.'}</strong>
      </button>
      <button class="leave-answer" onclick={resetRitual}>Refuse this appetite</button>
    </section>
  {:else}
    <section class="ritual-instruction companion-instruction" aria-live="polite">
      <span>The Companion cannot make the first connection.</span>
      <strong>{companionWords}</strong>
      <i class="stillness-mark" aria-hidden="true"></i>
      <button class="leave-answer" onclick={resetRitual}>Return to the clearing</button>
    </section>
  {/if}

  <ul class="sr-only" aria-label="Relations among the restored worlds">
    {#each links as link (link.id)}
      <li>{link.name}: {link.result}</li>
    {/each}
  </ul>
</section>

<style>
  .garden-scene {
    --quiet: #070a0d;
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100%;
    min-height: 35rem;
    overflow: hidden;
    color: #e8ddc6;
    background:
      radial-gradient(ellipse at 50% 48%, rgba(114, 145, 121, .1), transparent 28%),
      radial-gradient(ellipse at 50% 105%, rgba(111, 86, 61, .22), transparent 48%),
      linear-gradient(#05070b 0 58%, #090d0d 77%, #0c0f0d);
    font-family: var(--font-body, Inter, sans-serif);
  }
  .sky, .presences, .relations, .relation-names { position: absolute; inset: 0; }
  .sky { z-index: -2; overflow: hidden; }
  .haze { position: absolute; inset: 12% 8% 23%; background: radial-gradient(ellipse, rgba(195, 189, 146, .045), transparent 62%); filter: blur(1.5rem); }
  .horizon { position: absolute; left: -10%; right: -10%; bottom: 22%; height: 22%; border-radius: 50%; border-top: 1px solid rgba(186, 173, 133, .09); background: linear-gradient(rgba(22, 31, 27, .58), rgba(5, 8, 8, .88)); transform: rotate(-1deg); }
  .near-ground { position: absolute; left: -8%; right: -8%; bottom: -20%; height: 47%; border-radius: 50% 50% 0 0; background: radial-gradient(ellipse at 50% 0, rgba(52, 57, 40, .2), transparent 52%), #070a09; }

  .garden-actions { position: absolute; z-index: 12; top: 1rem; left: 1rem; right: 1rem; display: flex; justify-content: space-between; }
  .garden-actions > div { display: flex; gap: .7rem; }
  .export-status { position: absolute; left: 0; top: 2.2rem; margin: 0; color: rgba(232, 221, 198, .58); font-size: .6rem; }
  button { font: inherit; }
  .garden-actions button, .garden-credits button {
    padding: .45rem .65rem;
    color: rgba(232, 221, 198, .68);
    background: transparent;
    border: 0;
    border-bottom: 1px solid rgba(232, 221, 198, .18);
    cursor: pointer;
  }
  button:hover, button:focus-visible { color: #fff3d9; outline: 1px solid rgba(232, 221, 198, .42); outline-offset: .25rem; }
  .garden-heading { position: absolute; z-index: 4; top: 4.5%; left: 50%; text-align: center; transform: translateX(-50%); }
  .garden-heading span { display: block; color: rgba(232, 226, 204, .76); font-size: .6875rem; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; }
  .garden-heading h2 { margin: .25rem 0 0; color: rgba(239, 226, 196, .86); font: italic clamp(1.45rem, 2.3vw, 2.35rem) Fraunces, Georgia, serif; font-weight: 400; letter-spacing: .03em; }

  .presence-reading { position: absolute; z-index: 6; top: 11.5%; left: 50%; width: min(29rem, 72vw); padding: .55rem .8rem; transform: translateX(-50%); text-align: center; background: rgba(5,8,8,.84); border: 1px solid rgba(232,221,198,.2); border-radius: .65rem; }
  .presence-reading span { display: block; color: rgba(232,226,204,.76); font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; }
  .presence-reading strong { display: block; margin-top: .18rem; color: #fff3d9; font: italic 700 .82rem/1.35 Fraunces, Georgia, serif; }
  .presence-reading em { display: block; margin-top: .18rem; color: rgba(232,226,204,.72); font-size: .6875rem; font-style: normal; }

  .relations { z-index: -1; width: 100%; height: 100%; opacity: .48; transition: opacity .8s ease, filter .8s ease; }
  .relations path { fill: none; stroke: rgba(198, 186, 143, .28); stroke-width: 1.1; stroke-dasharray: 2 8; vector-effect: non-scaling-stroke; animation: relation-breathe 9s ease-in-out infinite alternate; }
  .relations .rain-treaty { stroke: rgba(91, 196, 166, .25); }
  .relations .weather-clock, .relations .open-future { stroke: rgba(145, 190, 212, .24); }
  .relations .choir-storms, .relations .garden-map { stroke: rgba(170, 145, 213, .22); }
  .relation-names { z-index: 0; pointer-events: none; }
  .relation-names span { position: absolute; color: rgba(238, 229, 195, .72); font: italic .6875rem Fraunces, Georgia, serif; letter-spacing: .04em; text-shadow: 0 1px .35rem #000; }
  .relation-names .shared-sky { top: 16%; left: 44%; }
  .relation-names .rain-treaty { left: 25%; bottom: 18%; }
  .relation-names .weather-clock { top: 37%; right: 8%; }
  .relation-names .choir-storms { right: 25%; bottom: 15%; }
  .relation-names .garden-map { left: 47%; bottom: 10%; }
  .relation-names .open-future { top: 17%; right: 13%; }
  .relation-names .first-water { top: 44%; left: 6%; }

  .presence { position: absolute; z-index: 2; width: 11rem; margin: 0; text-align: center; transform: translate(-50%, -50%); transition: opacity .8s ease, filter .8s ease, translate .8s ease, scale .8s ease; }
  .presence-reader { position: absolute; z-index: 1; inset: -.2rem 1.1rem 0; padding: 0; color: transparent; background: transparent; border: 1px solid transparent; border-radius: 50%; cursor: pointer; }
  .presence-reader:disabled { pointer-events: none; }
  .presence-reader:focus-visible,
  .presence.selected .presence-reader { outline: 2px solid color-mix(in srgb, var(--world) 72%, white); outline-offset: .2rem; }
  .presence.emberlight { left: 13%; top: 27%; --world: #ff9b4a; }
  .presence.tidefall { left: 12%; top: 63%; --world: #57d9c1; }
  .presence.verdance { left: 37%; top: 70%; --world: #9bcc71; }
  .presence.clockwork { left: 83%; top: 29%; --world: #d7b46f; }
  .presence.brahmalok { left: 72%; top: 25%; --world: #d9a060; }
  .presence.vishnulok { left: 87%; top: 62%; --world: #e2cb7e; }
  .presence.kailash { left: 62%; top: 72%; --world: #78aec0; }
  .material { position: relative; width: 5.8rem; height: 5.8rem; margin: 0 auto .25rem; filter: drop-shadow(0 0 .8rem color-mix(in srgb, var(--world) 22%, transparent)); }
  .material i, .material b { position: absolute; display: block; box-sizing: border-box; }
  figcaption strong { display: block; color: color-mix(in srgb, var(--world) 60%, #f3e8cf); font: 600 .78rem Fraunces, Georgia, serif; }
  figcaption span, figcaption small, figcaption em { display: block; margin-top: .15rem; line-height: 1.35; }
  figcaption span { color: rgba(238, 231, 211, .76); font-size: .6875rem; }
  figcaption small { color: transparent; font: italic .6875rem/1.35 Fraunces, Georgia, serif; transition: color .2s ease; }
  figcaption em { color: rgba(238, 231, 211, .7); font-size: .6875rem; font-style: normal; letter-spacing: .03em; }
  .presence.selected figcaption small,
  .presence:focus-within figcaption small { color: rgba(255, 246, 224, .92); }
  .tend-presence { position: relative; z-index: 2; min-height: 1.5rem; margin-top: .35rem; padding: .28rem .4rem; color: color-mix(in srgb, var(--world) 55%, #efe2c9); background: rgba(4,8,8,.72); border: 1px solid color-mix(in srgb, var(--world) 35%, transparent); border-radius: 50%; font-size: .6875rem; letter-spacing: .04em; cursor: pointer; }
  .tend-presence.complete { color: rgba(232,221,198,.5); border-style: dotted; }
  .presence.tended .material { filter: drop-shadow(0 0 1.1rem color-mix(in srgb, var(--world) 48%, transparent)); }
  .presence.tended::after { content: ''; position: absolute; inset: -.3rem 1.2rem 1.6rem; border: 1px solid color-mix(in srgb, var(--world) 24%, transparent); border-radius: 50%; pointer-events: none; }

  .coal { width: 2rem; height: 1.4rem; bottom: 1rem; left: 1.15rem; border-radius: 52% 38% 58% 40%; background: #18120f; border-bottom: .18rem solid rgba(255, 126, 48, .55); transform: rotate(-18deg); }
  .coal:nth-child(2) { left: 2.3rem; bottom: .8rem; transform: rotate(12deg); }
  .coal:nth-child(3) { left: 1.85rem; bottom: 1.7rem; transform: rotate(28deg); }
  .ember { left: 2.45rem; bottom: 2.3rem; width: .9rem; height: 1.7rem; border-radius: 70% 30% 60% 40%; background: radial-gradient(circle at 50% 75%, #fff4ad, #ff9b4a 45%, transparent 70%); animation: ember-tend 3.8s ease-in-out infinite alternate; }
  .pool { left: .4rem; right: .4rem; bottom: 1rem; height: 1.6rem; border-radius: 50%; border: 1px solid rgba(87,217,193,.48); background: radial-gradient(ellipse, rgba(87,217,193,.18), transparent 68%); }
  .drop { left: 2.55rem; top: .55rem; width: .8rem; height: 1.2rem; border-radius: 60% 40% 65% 35%; background: rgba(119, 229, 211, .62); transform: rotate(45deg); animation: water-return 5s ease-in-out infinite; }
  .return-ring { inset: 1.35rem .8rem 1.1rem; border: 1px solid rgba(87,217,193,.2); border-radius: 50%; }
  .trunk { left: 2.75rem; top: 1.25rem; width: .32rem; height: 3.7rem; background: linear-gradient(#6f794c, #3c422b); border-radius: 50%; }
  .branch { left: 2.8rem; top: 1.6rem; width: 2rem; height: 1.5rem; border-top: .18rem solid #778453; border-radius: 50%; transform: rotate(-28deg); transform-origin: left; }
  .branch.left { left: 1rem; transform: scaleX(-1) rotate(-28deg); }
  .leaf { width: 1.25rem; height: .7rem; border-radius: 80% 20% 80% 20%; background: rgba(155,204,113,.56); }
  .leaf.one { left: .75rem; top: 1.1rem; transform: rotate(18deg); }
  .leaf.two { right: .7rem; top: 1.4rem; transform: rotate(-18deg); }
  .leaf.three { left: 2.3rem; top: .25rem; }
  .wheel { inset: .55rem; border: .18rem dotted rgba(215,180,111,.6); border-radius: 50%; animation: escapement 14s steps(12,end) infinite; }
  .tooth { inset: 1.3rem; border: 1px solid rgba(215,180,111,.42); border-radius: 50%; }
  .hand { left: 2.82rem; top: 1.15rem; width: .12rem; height: 1.75rem; background: #e0c98f; transform-origin: bottom; transform: rotate(28deg); }
  .interval { left: 2.63rem; top: 2.63rem; width: .55rem; height: .55rem; border: 1px solid #d7b46f; border-radius: 50%; background: #090b0d; }
  .lotus-petal { left: 2.14rem; top: .55rem; width: 1.5rem; height: 2.15rem; border: 1px solid rgba(230,174,112,.58); border-radius: 65% 35% 62% 38%; background: linear-gradient(rgba(218,133,98,.16), transparent); transform-origin: 50% 2.35rem; }
  .lotus-petal.east { transform: rotate(90deg); }
  .lotus-petal.south { transform: rotate(180deg); }
  .lotus-petal.west { transform: rotate(270deg); }
  .lotus-center { left: 2.38rem; top: 2.35rem; width: 1.05rem; height: 1.05rem; border: 1px solid rgba(244,204,120,.72); border-radius: 50%; background: radial-gradient(circle, rgba(244,204,120,.48), transparent 64%); }
  .open-margin { left: .65rem; right: .65rem; bottom: .42rem; height: .48rem; border-top: 1px solid rgba(217,160,96,.38); border-left: 1px solid rgba(217,160,96,.22); border-right: 1px solid rgba(217,160,96,.22); }
  .returning-current { inset: .65rem .35rem 1rem; border: .14rem solid rgba(103,169,198,.48); border-left-color: transparent; border-radius: 50%; transform: rotate(-24deg); animation: current-return 9s ease-in-out infinite alternate; }
  .refuge-arc { left: 1.2rem; top: 1.35rem; width: 3.4rem; height: 2.6rem; border: 1px solid rgba(226,203,126,.58); border-bottom-color: transparent; border-radius: 55% 55% 42% 42%; }
  .harbor-light { left: 2.47rem; top: 2.25rem; width: .85rem; height: .85rem; border-radius: 50%; background: radial-gradient(circle, #fff7c7, rgba(226,203,126,.68) 34%, transparent 72%); box-shadow: 0 0 1rem rgba(226,203,126,.3); }
  .summit { left: .6rem; bottom: .72rem; width: 3.2rem; height: 3.85rem; border-left: 1px solid rgba(120,174,192,.54); border-top: 1px solid rgba(120,174,192,.54); transform: rotate(45deg); background: linear-gradient(135deg, rgba(67,95,108,.18), transparent 52%); }
  .summit.right { left: 2.7rem; bottom: .55rem; width: 2.4rem; height: 2.8rem; opacity: .58; }
  .downward-river { left: 2.7rem; top: 1.2rem; width: .28rem; height: 3.6rem; border-left: .12rem solid rgba(181,225,231,.6); border-radius: 50%; transform: rotate(9deg); }
  .open-ring { left: 2.12rem; top: 2.25rem; width: 1.5rem; height: 1.5rem; border: 1px solid rgba(203,147,91,.7); border-right-color: transparent; border-radius: 50%; transform: rotate(-18deg); }

  .clearing { position: absolute; z-index: 1; left: 50%; top: 47%; width: min(27vw, 23rem); aspect-ratio: 1.8; border-radius: 50%; transform: translate(-50%, -50%); background: radial-gradient(ellipse, rgba(224,205,151,.08), transparent 68%); }
  .clearing i { position: absolute; inset: 24%; border: 1px solid rgba(224,205,151,.13); border-radius: 50%; }
  .clearing b { position: absolute; left: 50%; top: 50%; width: .28rem; height: .28rem; border-radius: 50%; background: rgba(251,227,165,.7); box-shadow: 0 0 2rem .5rem rgba(251,227,165,.15); }

  .garden-answers, .garden-credits { position: absolute; z-index: 6; left: 50%; top: 46%; width: min(38rem, 42vw); transform: translate(-50%, -50%); text-align: center; }
  .answer-memory { margin-bottom: .55rem; color: rgba(232,221,198,.38); font-size: .5rem; letter-spacing: .13em; text-transform: uppercase; }
  .answer-memory strong { display: block; margin-top: .18rem; color: rgba(232,221,198,.58); font-weight: 500; }
  .answer-paths { display: flex; justify-content: center; align-items: stretch; gap: .2rem; }
  .answer-paths .path { flex: 1; min-width: 0; padding: .45rem .35rem; color: rgba(232,221,198,.54); background: linear-gradient(transparent, rgba(221,209,177,.025)); border: 0; border-bottom: 1px solid rgba(221,209,177,.13); cursor: pointer; }
  .path strong { display: block; color: rgba(244,230,198,.76); font: 600 .68rem Fraunces, Georgia, serif; }
  .path span, .path em { display: none; }
  .path:hover span, .path:focus-visible span { display: block; margin-top: .35rem; color: rgba(232,221,198,.62); font-size: .54rem; line-height: 1.4; }
  .path:hover em, .path:focus-visible em { display: block; margin-top: .25rem; color: rgba(247,231,199,.75); font: italic .54rem Fraunces, Georgia, serif; }
  .continue-hint { margin: .6rem 0 0; color: rgba(232,221,198,.38); font: italic .55rem Fraunces, Georgia, serif; }
  .garden-credits { width: min(34rem, 42vw); padding: 1rem 1.5rem; background: radial-gradient(ellipse, rgba(5,8,9,.96) 30%, rgba(5,8,9,.64) 68%, transparent); }
  .garden-credits h3 { margin: 0 0 .6rem; color: rgba(246,231,197,.82); font: 500 .86rem Fraunces, Georgia, serif; letter-spacing: .1em; }
  .garden-credits p { margin: .22rem 0; color: rgba(226,217,198,.55); font: italic .58rem/1.4 Fraunces, Georgia, serif; }
  .garden-credits button { margin-top: .7rem; }
  .ritual-instruction { position: absolute; z-index: 7; left: 50%; top: 45%; width: min(32rem, 40vw); transform: translate(-50%, -50%); text-align: center; }
  .ritual-instruction > span { display: block; color: rgba(232,221,198,.4); font-size: .52rem; letter-spacing: .12em; text-transform: uppercase; }
  .ritual-instruction > strong { display: block; margin-top: .3rem; color: rgba(244,230,198,.76); font: 500 .7rem/1.45 Fraunces, Georgia, serif; }
  .ritual-instruction > button:not(.hunger-hold) { margin-top: .65rem; padding: .35rem .5rem; color: rgba(232,221,198,.5); background: transparent; border: 0; border-bottom: 1px solid rgba(232,221,198,.14); cursor: pointer; font-size: .55rem; }
  .warden-instruction { top: 45%; width: min(25rem, 32vw); padding: .65rem 1rem; background: radial-gradient(ellipse, rgba(5,8,9,.88), rgba(5,8,9,.4) 64%, transparent); }
  .warden-tending .relations { opacity: .28; }

  .hunger-hold { position: relative; display: grid; place-items: center; width: 7.4rem; aspect-ratio: 1; margin: .7rem auto 0; padding: 1rem; color: rgba(244,230,198,.76); background: radial-gradient(circle, #100e0c 48%, transparent 50%); border: 0; border-radius: 50%; cursor: grab; touch-action: none; }
  .hunger-hold:active, .hunger-hold.holding { cursor: grabbing; }
  .hunger-hold i { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(rgba(238,188,111,.68) calc(var(--ritual-progress) * 1turn), rgba(238,188,111,.09) 0); mask: radial-gradient(circle, transparent 61%, black 63%); }
  .hunger-hold::after { content: ''; position: absolute; inset: 17%; border: 1px solid rgba(238,188,111,.2); border-radius: 50%; box-shadow: inset 0 0 1.2rem rgba(238,126,67, calc(var(--ritual-progress) * .22)); }
  .hunger-hold strong { position: relative; z-index: 1; max-width: 5rem; font: 500 .6rem/1.35 Fraunces, Georgia, serif; }
  .hunger-drawing .relations { opacity: calc(.46 - var(--ritual-progress) * .34); }
  .hunger-holding .presence { opacity: calc(1 - var(--ritual-progress) * .78); filter: saturate(calc(1 - var(--ritual-progress) * .82)); scale: calc(1 - var(--ritual-progress) * .28); }
  .hunger-holding .clearing { scale: calc(1 + var(--ritual-progress) * .24); filter: brightness(calc(1 + var(--ritual-progress) * .85)); }
  .ending-hunger .presence { opacity: .2; filter: saturate(.15); scale: .72; }

  .companion-instruction { pointer-events: none; }
  .companion-instruction .leave-answer { pointer-events: auto; opacity: 0; transition: opacity .6s ease; }
  .companion-instruction:hover .leave-answer, .companion-instruction:focus-within .leave-answer { opacity: 1; }
  .stillness-mark { display: block; width: .4rem; height: .4rem; margin: .65rem auto; border: 1px solid rgba(232,221,198,.35); border-radius: 50%; box-shadow: 0 0 calc(1.8rem * var(--ritual-progress)) rgba(232,221,198,.45); }
  .companion-waiting .relations { opacity: calc(.25 + var(--ritual-progress) * .65); filter: drop-shadow(0 0 calc(.45rem * var(--ritual-progress)) rgba(205,202,166,.3)); }
  .companion-waiting .presence { filter: brightness(calc(1 + var(--ritual-progress) * .28)); }
  .companion-armed .presence.emberlight { translate: calc(1.2rem * var(--ritual-progress)) calc(.5rem * var(--ritual-progress)); }
  .companion-armed .presence.tidefall { translate: calc(1.3rem * var(--ritual-progress)) calc(-.7rem * var(--ritual-progress)); }
  .companion-armed .presence.verdance { translate: calc(.6rem * var(--ritual-progress)) calc(-1rem * var(--ritual-progress)); }
  .companion-armed .presence.clockwork { translate: calc(-1.2rem * var(--ritual-progress)) calc(.55rem * var(--ritual-progress)); }
  .companion-armed .presence.brahmalok { translate: calc(-.8rem * var(--ritual-progress)) calc(.5rem * var(--ritual-progress)); }
  .companion-armed .presence.vishnulok { translate: calc(-1.25rem * var(--ritual-progress)) calc(-.7rem * var(--ritual-progress)); }
  .companion-armed .presence.kailash { translate: calc(-.5rem * var(--ritual-progress)) calc(-1rem * var(--ritual-progress)); }
  .ending-companion .relations { opacity: .9; filter: drop-shadow(0 0 .45rem rgba(205,202,166,.3)); }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  .frozen * { animation-play-state: paused !important; transition: none !important; }
  .reduced *, :global([data-motion='reduced']) .garden-scene * { animation: none !important; transition: none !important; }
  @keyframes relation-breathe { to { opacity: .62; stroke-dashoffset: 20; } }
  @keyframes ember-tend { to { transform: scale(.82) rotate(3deg); opacity: .72; } }
  @keyframes water-return { 0% { transform: translateY(0) rotate(45deg); opacity: .2; } 48% { opacity: .8; } 70% { transform: translateY(2.3rem) rotate(45deg); opacity: 0; } 100% { transform: translateY(0) rotate(45deg); opacity: 0; } }
  @keyframes escapement { to { transform: rotate(360deg); } }
  @keyframes current-return { from { transform: rotate(-24deg); opacity: .42; } to { transform: rotate(12deg); opacity: .78; } }

  @media (max-width: 900px) {
    .garden-scene { min-height: 42rem; overflow-y: auto; }
    .garden-actions > div { align-items: flex-start; flex-direction: column; gap: .1rem; }
    .export-status { top: 6.4rem; }
    .garden-heading { top: 4rem; }
    .relations, .relation-names { display: none; }
    .presences { position: relative; inset: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem .5rem; padding: 8rem 1rem 2rem; }
    .presence { position: relative; left: auto !important; top: auto !important; width: auto; transform: none; }
    .presence.kailash { grid-column: 1 / -1; }
    figcaption small { color: rgba(235,226,204,.58); }
    .clearing { display: none; }
    .garden-answers, .garden-credits, .ritual-instruction { position: relative; left: auto; top: auto; bottom: auto; width: calc(100% - 2rem); margin: 0 auto 2rem; transform: none; }
    .answer-paths { flex-wrap: wrap; }
    .answer-paths .path { flex: 1 1 42%; }
  }
</style>
