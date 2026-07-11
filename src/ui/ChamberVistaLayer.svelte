<script lang="ts">
  import type { EconomyAmount } from '../content/universes/types'
  import { planChamberVista } from '../render/chamber-vistas'

  interface Props {
    universeId: string
    generatorIds: readonly string[]
    owned: Readonly<Record<string, number>>
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    reducedMotion?: boolean
    quality?: 'low' | 'medium' | 'high'
  }

  let {
    universeId,
    generatorIds,
    owned,
    numericLawState,
    reducedMotion = false,
    quality = 'high',
  }: Props = $props()

  const vista = $derived(planChamberVista({ universeId, generatorIds, owned, numericLawState }))
</script>

{#if vista}
  <div
    class="chamber-vista {vista.id}"
    class:motion-paused={reducedMotion}
    data-chamber-vista={vista.id}
    data-vista-quality={quality}
    role="img"
    aria-label={vista.label}
    style={`--vista-intensity:${vista.intensity};--vista-detail:${vista.detail}`}
  >
    {#if vista.id === 'canopy-dawn'}
      <div class="dawn-halo"></div>
      <div class="dawn-sun"></div>
      <div class="dawn-rays"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="crown crown-left"><i></i><i></i><i></i></div>
      <div class="crown crown-right"><i></i><i></i><i></i></div>
      <div class="graft-thread"></div>
    {:else if vista.id === 'white-synthesis'}
      <div class="synthesis-rays">
        <i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
      <div class="synthesis-focus"></div>
      <div class="synthesis-beam"></div>
      <div class="synthesis-screen"><i></i></div>
    {:else if vista.id === 'full-discharge'}
      <div class="discharge-flash"></div>
      <div class="discharge-bolt"><i></i><i></i><i></i></div>
      <div class="thunder-ring ring-a"></div>
      <div class="thunder-ring ring-b"></div>
      <div class="fulgurite"><i></i><i></i><i></i></div>
    {:else}
      <div class="cathedral-nave"></div>
      <div class="cathedral-arch arch-a"></div>
      <div class="cathedral-arch arch-b"></div>
      <div class="cathedral-arch arch-c"></div>
      <div class="cathedral-wave wave-a"></div>
      <div class="cathedral-wave wave-b"></div>
      <div class="cathedral-nodes"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="cathedral-rest"></div>
    {/if}
  </div>
{/if}

<style>
  .chamber-vista {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
    opacity: calc(0.74 + var(--vista-intensity) * 0.2);
  }
  .chamber-vista div,
  .chamber-vista i { position: absolute; }

  /* Verdance — the canopy parts once, and dawn travels through living crowns. */
  .canopy-dawn .dawn-halo {
    left: 50%; top: 20%; width: min(58vw, 52rem); aspect-ratio: 2.8;
    transform: translateX(-50%);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 52%, transparent);
    border-radius: 0 0 50% 50%;
    background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--amber) 20%, transparent), transparent 68%);
    filter: drop-shadow(0 0 2.6rem color-mix(in srgb, var(--amber) 18%, transparent));
    animation: dawn-open 7s ease-in-out infinite alternate;
  }
  .canopy-dawn .dawn-sun {
    left: 50%; top: 38%; width: 4.4rem; aspect-ratio: 1;
    transform: translate(-50%, -50%); border-radius: 50%;
    background: radial-gradient(circle, #fffbd6 0 10%, var(--gold) 28%, color-mix(in srgb, var(--amber) 16%, transparent) 62%, transparent 72%);
    box-shadow: 0 0 3.4rem color-mix(in srgb, var(--gold) 34%, transparent);
  }
  .dawn-rays { inset: 0; transform-origin: 50% 38%; animation: dawn-turn 32s linear infinite; }
  .dawn-rays i { left: 50%; top: 38%; width: min(45vw, 42rem); height: 1px; transform-origin: left; background: linear-gradient(90deg, color-mix(in srgb, var(--gold) 42%, transparent), transparent); }
  .dawn-rays i:nth-child(1) { transform: rotate(9deg); }
  .dawn-rays i:nth-child(2) { transform: rotate(31deg); }
  .dawn-rays i:nth-child(3) { transform: rotate(149deg); }
  .dawn-rays i:nth-child(4) { transform: rotate(171deg); }
  .dawn-rays i:nth-child(5) { transform: rotate(90deg); opacity: 0.45; }
  .crown { top: 9%; width: 40%; height: 33%; border-bottom: 2px solid color-mix(in srgb, var(--gold) 26%, transparent); border-radius: 0 0 62% 62%; }
  .crown-left { left: -2%; transform: rotate(5deg); }
  .crown-right { right: -2%; transform: rotate(-5deg); }
  .crown i { bottom: -0.35rem; width: 4.8rem; height: 1.5rem; border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: 100% 0 100% 0; background: color-mix(in srgb, var(--gold) 3%, transparent); }
  .crown i:nth-child(1) { left: 18%; transform: rotate(-14deg); }
  .crown i:nth-child(2) { left: 46%; transform: rotate(12deg) scale(1.2); }
  .crown i:nth-child(3) { right: 4%; transform: rotate(-4deg) scale(0.8); }
  .graft-thread { left: 50%; top: 38%; width: 1px; height: 42%; background: linear-gradient(var(--gold), color-mix(in srgb, var(--amber) 12%, transparent)); box-shadow: 0 0 1rem color-mix(in srgb, var(--gold) 36%, transparent); }

  /* Prismata — six named inputs only become white after convergence. */
  .white-synthesis .synthesis-rays { inset: 0; }
  .synthesis-rays i { left: 8%; top: calc(34% + var(--ray) * 6.6%); width: 43%; height: 2px; transform-origin: right center; transform: rotate(calc((var(--ray) - 2.5) * -5.4deg)); background: linear-gradient(90deg, transparent, var(--ray-color)); box-shadow: 0 0 0.6rem var(--ray-color); animation: spectral-arrival 2.8s ease-in-out infinite alternate; animation-delay: calc(var(--ray) * -0.24s); }
  .synthesis-rays i:nth-child(1) { --ray: 0; --ray-color: #ff6576; }
  .synthesis-rays i:nth-child(2) { --ray: 1; --ray-color: #ffad55; }
  .synthesis-rays i:nth-child(3) { --ray: 2; --ray-color: #74e89e; }
  .synthesis-rays i:nth-child(4) { --ray: 3; --ray-color: #61ceff; }
  .synthesis-rays i:nth-child(5) { --ray: 4; --ray-color: #a986ff; }
  .synthesis-rays i:nth-child(6) { --ray: 5; --ray-color: #ef8fff; }
  .synthesis-focus { left: 51%; top: 53%; width: 3.8rem; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, white, color-mix(in srgb, white 72%, transparent) 18%, transparent 66%); box-shadow: 0 0 2.8rem white; animation: synthesis-focus 2.2s ease-in-out infinite alternate; }
  .synthesis-beam { left: 51%; right: 8%; top: calc(53% - 0.34rem); height: 0.68rem; background: linear-gradient(90deg, white, color-mix(in srgb, #e8f8ff 72%, transparent)); clip-path: polygon(0 35%, 100% 0, 100% 100%, 0 65%); filter: drop-shadow(0 0 0.8rem white); }
  .synthesis-screen { right: 7%; top: 30%; bottom: 24%; width: 1.5rem; border: 1px solid color-mix(in srgb, white 44%, transparent); background: color-mix(in srgb, white 7%, transparent); }
  .synthesis-screen i { left: -0.4rem; top: 50%; width: 2.3rem; height: 2.3rem; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle, white, color-mix(in srgb, white 20%, transparent) 44%, transparent 68%); }

  /* Tempest — the stored field resolves as one ground-seeking discharge. */
  .full-discharge .discharge-flash { inset: 0; background: radial-gradient(ellipse at 50% 49%, color-mix(in srgb, white 14%, transparent), transparent 48%); animation: storm-flash 4.6s steps(1, end) infinite; }
  .discharge-bolt { left: 50%; top: 24%; width: 0.25rem; height: 54%; transform: translateX(-50%) skewX(-7deg); background: white; box-shadow: 0 0 0.8rem white, 0 0 2.8rem color-mix(in srgb, var(--gold) 54%, transparent); clip-path: polygon(0 0, 100% 0, 65% 29%, 100% 29%, 28% 62%, 64% 61%, 0 100%, 32% 54%, 0 55%, 70% 24%, 35% 24%); animation: bolt-hold 4.6s steps(1, end) infinite; }
  .discharge-bolt i { left: 50%; width: min(18vw, 13rem); height: 2px; transform-origin: left center; background: linear-gradient(90deg, white, transparent); }
  .discharge-bolt i:nth-child(1) { top: 26%; transform: rotate(-39deg); }
  .discharge-bolt i:nth-child(2) { top: 52%; transform: rotate(28deg); }
  .discharge-bolt i:nth-child(3) { top: 68%; transform: rotate(-51deg); }
  .thunder-ring { left: 50%; top: 48%; width: min(50vw, 44rem); aspect-ratio: 3.4; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, white 34%, transparent); border-radius: 50%; animation: thunder-expand 4.6s ease-out infinite; }
  .ring-b { animation-delay: -2.3s; }
  .fulgurite { left: 50%; bottom: 7%; width: 9rem; height: 8rem; transform: translateX(-50%); border-left: 2px solid color-mix(in srgb, var(--gold) 52%, transparent); filter: drop-shadow(0 0 0.6rem color-mix(in srgb, var(--amber) 38%, transparent)); }
  .fulgurite i { left: 0; bottom: calc(var(--branch) * 1.5rem); width: 4.8rem; height: 1px; transform-origin: left; transform: rotate(calc(-64deg + var(--branch) * 52deg)); background: color-mix(in srgb, var(--gold) 48%, transparent); }
  .fulgurite i:nth-child(1) { --branch: 1; } .fulgurite i:nth-child(2) { --branch: 2; } .fulgurite i:nth-child(3) { --branch: 3; }

  /* Canticle — nodes, rests, and antinodes hold an inhabitable acoustic form. */
  .standing-wave-cathedral .cathedral-nave { left: 50%; top: 20%; bottom: 13%; width: min(54vw, 48rem); transform: translateX(-50%); background: radial-gradient(ellipse at 50% 90%, color-mix(in srgb, var(--gold) 12%, transparent), transparent 65%); border-bottom: 1px solid color-mix(in srgb, var(--gold) 40%, transparent); perspective: 40rem; }
  .cathedral-arch { left: 50%; bottom: 16%; transform: translateX(-50%); border: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); border-bottom: 0; border-radius: 50% 50% 0 0; box-shadow: inset 0 0 2rem color-mix(in srgb, var(--amber) 4%, transparent); }
  .arch-a { width: min(50vw, 44rem); height: 58%; }
  .arch-b { width: min(36vw, 32rem); height: 42%; opacity: 0.78; }
  .arch-c { width: min(22vw, 19rem); height: 26%; opacity: 0.58; }
  .cathedral-wave { left: 12%; right: 12%; top: 53%; height: 4.2rem; border-top: 2px solid color-mix(in srgb, var(--gold) 42%, transparent); border-radius: 50%; filter: drop-shadow(0 0 0.5rem color-mix(in srgb, var(--gold) 24%, transparent)); animation: cathedral-breathe 3.6s ease-in-out infinite alternate; }
  .wave-b { transform: scaleY(-1) translateY(-2rem); opacity: 0.58; animation-delay: -1.8s; }
  .cathedral-nodes { inset: 0; }
  .cathedral-nodes i { left: calc(20% + var(--node) * 12%); top: 53%; width: 0.72rem; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, white 60%, transparent); border-radius: 50%; background: var(--bg); box-shadow: 0 0 1rem color-mix(in srgb, var(--gold) 44%, transparent); }
  .cathedral-nodes i:nth-child(1) { --node: 0; } .cathedral-nodes i:nth-child(2) { --node: 1; } .cathedral-nodes i:nth-child(3) { --node: 2; } .cathedral-nodes i:nth-child(4) { --node: 3; } .cathedral-nodes i:nth-child(5) { --node: 4; } .cathedral-nodes i:nth-child(6) { --node: 5; }
  .cathedral-rest { left: 50%; top: 53%; width: 5.4rem; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px dashed color-mix(in srgb, white 46%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 82%, transparent); box-shadow: 0 0 2.8rem var(--bg); }

  [data-vista-quality='low'] .dawn-rays i:nth-child(n+4),
  [data-vista-quality='low'] .synthesis-screen,
  [data-vista-quality='low'] .ring-b,
  [data-vista-quality='low'] .arch-b { display: none; }
  .motion-paused,
  .motion-paused * { animation: none !important; }

  @keyframes dawn-open { to { opacity: 0.72; transform: translateX(-50%) scaleX(1.04); } }
  @keyframes dawn-turn { to { transform: rotate(360deg); } }
  @keyframes spectral-arrival { to { opacity: 0.58; filter: brightness(1.35); } }
  @keyframes synthesis-focus { to { transform: translate(-50%, -50%) scale(1.16); opacity: 0.74; } }
  @keyframes storm-flash { 0%, 8%, 11%, 100% { opacity: 0.16; } 3%, 10% { opacity: 1; } }
  @keyframes bolt-hold { 0%, 8%, 11%, 100% { opacity: 0.34; } 3%, 10% { opacity: 1; } }
  @keyframes thunder-expand { from { opacity: 0.48; transform: translate(-50%, -50%) scale(0.35); } to { opacity: 0; transform: translate(-50%, -50%) scale(1.35); } }
  @keyframes cathedral-breathe { to { transform: scaleY(1.18); opacity: 0.66; } }

  @media (max-width: 680px) {
    .crown { width: 48%; }
    .synthesis-rays i { left: 3%; width: 48%; }
    .arch-a { width: 84vw; }
    .arch-b { width: 61vw; }
    .arch-c { width: 37vw; }
    .cathedral-nodes i { left: calc(14% + var(--node) * 14.4%); }
  }
</style>
