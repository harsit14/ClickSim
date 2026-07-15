<script lang="ts">
  import { onDestroy } from 'svelte'
  import { landingPrimaryCta } from '../experience/landing'
  import emberlightImage from '../assets/landing/emberlight.webp?url'
  import tidefallImage from '../assets/landing/tidefall.webp?url'
  import verdanceImage from '../assets/landing/verdance.webp?url'
  import clockworkImage from '../assets/landing/clockwork.webp?url'
  import brahmalokImage from '../assets/landing/brahmalok.webp?url'
  import vishnulokImage from '../assets/landing/vishnulok.webp?url'
  import kailashImage from '../assets/landing/kailash.webp?url'

  let {
    returningPlayer,
    onenter,
  }: {
    returningPlayer: boolean
    onenter: () => void
  } = $props()

  const realms = [
    {
      name: 'Emberlight',
      chapter: 'I',
      image: emberlightImage,
      description: 'Raise warmth, settlement, and a remembered sky from one surviving ember.',
      accent: '#ffbd69',
    },
    {
      name: 'Tidefall',
      chapter: 'II',
      image: tidefallImage,
      description: 'Learn the pulse of a moonless ocean where every current keeps a record.',
      accent: '#80e5dd',
    },
    {
      name: 'Verdance',
      chapter: 'III',
      image: verdanceImage,
      description: 'Grow a living network of roots, grafts, cohorts, pruning, and inherited memory.',
      accent: '#a9d97c',
    },
    {
      name: 'Clockwork',
      chapter: 'IV',
      image: clockworkImage,
      description: 'Route deterministic power through a civic machine that remembers every choice.',
      accent: '#e0bd70',
    },
    {
      name: 'Brahmalok',
      chapter: 'V',
      image: brahmalokImage,
      description: 'Unfold possibility through seed, measure, name, and forms that remain revisable.',
      accent: '#e9a5d7',
    },
    {
      name: 'Vishnulok',
      chapter: 'VI',
      image: vishnulokImage,
      description: 'Sustain continuity through refuge, correction, and the courage to return.',
      accent: '#b3a8ff',
    },
    {
      name: 'Kailash',
      chapter: 'VII',
      image: kailashImage,
      description: 'Approach a still point where release is not erasure, and restraint has weight.',
      accent: '#c9ddff',
    },
  ] as const

  const realmNames = ['Emberlight', 'Tidefall', 'Verdance', 'Clockwork', 'Brahmalok', 'Vishnulok', 'Kailash']
  const features = [
    {
      glyph: '✦',
      eyebrow: 'Touch the world',
      title: 'Clicks that stay alive',
      copy: 'Critical hits, musical rhythm, combos, and catchable Omens make active play expressive without demanding constant attention.',
    },
    {
      glyph: '◒',
      eyebrow: 'Leave without losing',
      title: 'Offline progress, gently',
      copy: 'Your world keeps tending while you are away. Return to a clear report—never decay, punishment, or an energy timer.',
    },
    {
      glyph: '⌁',
      eyebrow: 'Build what you can see',
      title: 'Eighteen Kindlings per realm',
      copy: 'Every purchase changes the world itself. Settlements, organisms, machines, and constellations grow across the canvas.',
    },
    {
      glyph: '✧',
      eyebrow: 'Begin again with purpose',
      title: 'Epochs, not empty resets',
      copy: 'Every turning tells you what changes, what remains, and what it earns. Permanent choices reshape the runs that follow.',
    },
    {
      glyph: '◇',
      eyebrow: 'Master new laws',
      title: 'Trials with real constraints',
      copy: 'Twelve authored trials ask you to rethink familiar strategies, then return your parked world safely when the attempt ends.',
    },
    {
      glyph: '❖',
      eyebrow: 'Remember what happened',
      title: 'A story written by progress',
      copy: 'Archives, Echoes, hidden records, endings, and a post-saga Atlas turn a number game into a journey with a memory.',
    },
  ] as const

  let featuredIndex = $state(0)
  let leaving = $state(false)
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  const featuredRealm = $derived(realms[featuredIndex])
  const primaryCta = $derived(landingPrimaryCta(returningPlayer))

  function enterGame() {
    if (leaving) return
    leaving = true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    enterTimer = setTimeout(onenter, reducedMotion ? 0 : 560)
  }

  function showRealm(index: number) {
    featuredIndex = (index + realms.length) % realms.length
  }

  onDestroy(() => {
    if (enterTimer) clearTimeout(enterTimer)
  })
</script>

<svelte:head>
  <title>EMBER — Rebuild a universe from one last light</title>
  <meta
    name="description"
    content="A story-driven incremental game about rebuilding a dead universe—and deciding what the next one should become."
  />
</svelte:head>

<main class="landing" class:leaving aria-label="EMBER game introduction">
  <div class="ambient" aria-hidden="true">
    <span class="glow glow-one"></span>
    <span class="glow glow-two"></span>
    <span class="star-field star-field-near"></span>
    <span class="star-field star-field-far"></span>
  </div>

  <nav class="landing-nav" aria-label="Landing navigation">
    <a class="brand" href="#top" aria-label="EMBER home">
      <span class="brand-mark" aria-hidden="true"><i></i></span>
      <span>EMBER</span>
    </a>
    <div class="nav-links">
      <a href="#journey">The journey</a>
      <a href="#ways-to-play">How it plays</a>
      <button class="nav-enter" type="button" onclick={enterGame}>{returningPlayer ? 'Continue' : 'Play now'}</button>
    </div>
  </nav>

  <section id="top" class="hero" aria-labelledby="landing-title">
    <div class="hero-copy">
      <p class="eyebrow"><span aria-hidden="true">✦</span> A story-driven incremental universe</p>
      <h1 id="landing-title">Begin with a spark.<br /><em>Leave behind a universe.</em></h1>
      <p class="hero-summary">
        The last light is waiting for your hand. Kindle a world, carry its memory through seven
        authored realms, and decide what creation should become next.
      </p>
      <div class="hero-actions">
        <button class="primary-cta" type="button" onclick={enterGame} disabled={leaving}>
          <span>{leaving ? 'Opening the universe…' : primaryCta}</span>
          <i aria-hidden="true">→</i>
        </button>
        <a class="secondary-cta" href="#journey">See what awaits <span aria-hidden="true">↓</span></a>
      </div>
      <ul class="trust-line" aria-label="Player-friendly promises">
        <li><span aria-hidden="true">✓</span> No account</li>
        <li><span aria-hidden="true">✓</span> Local autosave</li>
        <li><span aria-hidden="true">✓</span> Offline progress</li>
      </ul>
      {#if returningPlayer}
        <p class="return-note"><span aria-hidden="true">✧</span> Your saved realm is ready exactly where you left it.</p>
      {/if}
    </div>

    <div class="hero-visual" aria-label="A glimpse of the Emberlight realm">
      <span class="orbit orbit-one" aria-hidden="true"></span>
      <span class="orbit orbit-two" aria-hidden="true"></span>
      <div class="world-window">
        <div class="gameplay-focus gameplay-heart">
          <img src={emberlightImage} alt="The Emberlight Heart and growing light counter" />
          <span>1 · Click the Heart</span>
          <div class="heart-pulse" aria-hidden="true"><i></i></div>
        </div>
        <div class="gameplay-focus gameplay-upgrade">
          <img src={emberlightImage} alt="A close view of the Spark Kindling upgrade" />
          <span>3 · Buy a Kindling</span>
        </div>
      </div>
      <div class="gameplay-loop" aria-label="The core gameplay loop">
        <span><small>Realm I · Emberlight</small><strong>See the loop, not a mockup.</strong></span>
        <ol>
          <li><b>Click</b> the Heart</li>
          <li><b>Grow</b> your light</li>
          <li><b>Build</b> the world</li>
        </ol>
      </div>
    </div>

    <a class="scroll-cue" href="#journey" aria-label="Scroll to discover the journey">
      <span>Discover</span><i aria-hidden="true"></i>
    </a>
  </section>

  <section class="promise-band" aria-label="The shape of the game">
    <div><strong>01</strong><span>One surviving light</span></div>
    <i aria-hidden="true">→</i>
    <div><strong>18</strong><span>Kindlings in every realm</span></div>
    <i aria-hidden="true">→</i>
    <div><strong>07</strong><span>Worlds with different laws</span></div>
    <i aria-hidden="true">→</i>
    <div><strong>∞</strong><span>A story that remembers</span></div>
  </section>

  <section id="journey" class="journey section-shell" aria-labelledby="journey-title">
    <div class="section-intro">
      <p class="eyebrow">Seven realms · seven ways to rebuild</p>
      <h2 id="journey-title">The rules change.<br /><em>Your history does not.</em></h2>
      <p>
        Each crossing opens a new visual language, soundscape, economy, active system, Archive,
        trials, and ending ritual. Previous realms wait intact for your return.
      </p>
    </div>

    <div class="realm-stage" style={`--realm-accent: ${featuredRealm.accent}`}>
      <div class="realm-image">
        <img src={featuredRealm.image} alt={`${featuredRealm.name} realm gameplay`} />
        <div class="realm-vignette" aria-hidden="true"></div>
        <p><span>Realm {featuredRealm.chapter}</span><strong>{featuredRealm.name}</strong></p>
      </div>
      <div class="realm-story">
        <span class="realm-number">{featuredRealm.chapter}</span>
        <p class="eyebrow">A different law of light</p>
        <h3>{featuredRealm.name}</h3>
        <p>{featuredRealm.description}</p>
        <div class="realm-controls" aria-label="Choose a realm preview">
          <button type="button" onclick={() => showRealm(featuredIndex - 1)} aria-label="Previous realm">←</button>
          <span>{featuredIndex + 1} / {realms.length}</span>
          <button type="button" onclick={() => showRealm(featuredIndex + 1)} aria-label="Next realm">→</button>
        </div>
      </div>
    </div>

    <div class="realm-tabs" aria-label="Realm previews">
      {#each realms as realm, index}
        <button
          type="button"
          class:active={featuredIndex === index}
          aria-pressed={featuredIndex === index}
          onclick={() => showRealm(index)}
        >
          <span>{realm.chapter}</span>{realm.name}
        </button>
      {/each}
    </div>
  </section>

  <section id="ways-to-play" class="features section-shell" aria-labelledby="features-title">
    <div class="section-intro centered">
      <p class="eyebrow">Play close · step away · return when you wish</p>
      <h2 id="features-title">An incremental game<br /><em>with something to say.</em></h2>
      <p>Every system serves the world, the strategy, or the story. Usually all three.</p>
    </div>
    <div class="feature-grid">
      {#each features as feature, index}
        <article class:feature-wide={index === 0 || index === 5}>
          <div class="feature-top">
            <span class="feature-glyph" aria-hidden="true">{feature.glyph}</span>
            <small>0{index + 1}</small>
          </div>
          <p>{feature.eyebrow}</p>
          <h3>{feature.title}</h3>
          <div class="feature-rule" aria-hidden="true"><i></i></div>
          <p>{feature.copy}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="philosophy section-shell" aria-labelledby="philosophy-title">
    <div class="philosophy-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
    <div>
      <p class="eyebrow">Made to respect your time</p>
      <h2 id="philosophy-title">Wonder without the hooks.</h2>
      <p>
        EMBER is patient by design. Missing an Omen never removes progress. Leaving never makes
        your world decay. Returning never means catching up to someone else.
      </p>
      <strong>No ads · No gacha · No energy timers</strong>
    </div>
    <ul>
      <li><span aria-hidden="true">◇</span><div><strong>Play actively or idly</strong><small>Rhythm and criticals reward attention; automation and offline progress reward patience.</small></div></li>
      <li><span aria-hidden="true">◇</span><div><strong>Understand every turning</strong><small>Reset previews state what changes, what stays, and what you gain before you decide.</small></div></li>
      <li><span aria-hidden="true">◇</span><div><strong>Shape the presentation</strong><small>Reduced motion, large text, high contrast, mute-safe cues, and adjustable visual density are built in.</small></div></li>
    </ul>
  </section>

  <section class="realm-roll" aria-label="The seven realm names">
    <p>One journey across</p>
    <div>
      {#each realmNames as realm}
        <span>{realm}</span>
      {/each}
    </div>
  </section>

  <section class="final-invitation section-shell" aria-labelledby="invitation-title">
    <span class="final-mark" aria-hidden="true"><i></i></span>
    <p class="eyebrow">The dark is not empty</p>
    <h2 id="invitation-title">There is still one light.<br /><em>It only needs a hand.</em></h2>
    <p>Start with a single click. The universe will teach you the rest.</p>
    <button class="primary-cta final-cta" type="button" onclick={enterGame} disabled={leaving}>
      <span>{leaving ? 'Opening the universe…' : primaryCta}</span>
      <i aria-hidden="true">→</i>
    </button>
    <small>Desktop-first browser game · progress saves locally</small>
  </section>

  <footer>
    <a class="brand footer-brand" href="#top" aria-label="EMBER home">
      <span class="brand-mark" aria-hidden="true"><i></i></span><span>EMBER</span>
    </a>
    <p>A story-driven incremental game about rebuilding a dead universe.</p>
    <button type="button" onclick={enterGame}>{returningPlayer ? 'Return to your realm' : 'Begin the journey'} <span aria-hidden="true">↗</span></button>
  </footer>
</main>

<style>
  :global(html:has(.landing)) { scroll-behavior: smooth; }
  :global(body:has(.landing)) { background: #05060b; }

  .landing {
    --landing-bg: #05060b;
    --landing-surface: #0b0c14;
    --landing-surface-soft: #11111c;
    --landing-line: rgba(255, 220, 158, 0.14);
    --landing-gold: #ffd38a;
    --landing-amber: #f3a54c;
    --landing-text: #eeeaf2;
    --landing-dim: #9d98aa;
    position: fixed;
    inset: 0;
    z-index: 100;
    overflow-x: hidden;
    overflow-y: auto;
    color: var(--landing-text);
    background:
      radial-gradient(circle at 68% 8%, rgba(189, 113, 55, 0.1), transparent 32rem),
      linear-gradient(180deg, #05060b 0%, #07070d 52%, #05060a 100%);
    user-select: text;
    opacity: 1;
    transition: opacity 0.48s ease, filter 0.48s ease;
    isolation: isolate;
  }

  .landing.leaving { opacity: 0; filter: blur(10px); pointer-events: none; }
  .landing :where(button, a) { font-family: var(--font-interface); }
  .landing button { color: inherit; }
  .landing a { color: inherit; text-decoration: none; }
  .landing :where(button, a):focus-visible { outline: 2px solid #ffe0a8; outline-offset: 4px; }

  .ambient { position: absolute; inset: 0 0 auto; height: 62rem; overflow: hidden; pointer-events: none; z-index: -1; }
  .glow { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.22; }
  .glow-one { top: 8rem; right: 12%; width: 28rem; height: 28rem; background: rgba(245, 164, 73, 0.24); }
  .glow-two { top: 30rem; left: -8rem; width: 22rem; height: 22rem; background: rgba(113, 91, 175, 0.16); }
  .star-field { position: absolute; inset: 0; opacity: 0.55; background-repeat: repeat; }
  .star-field-near { background-image: radial-gradient(circle, rgba(255, 222, 164, 0.8) 0 1px, transparent 1.5px); background-size: 113px 97px; transform: rotate(-3deg) scale(1.08); }
  .star-field-far { opacity: 0.28; background-image: radial-gradient(circle, rgba(213, 204, 233, 0.85) 0 0.7px, transparent 1px); background-size: 67px 71px; transform: rotate(7deg); }

  .landing-nav {
    position: absolute;
    top: 0;
    left: 50%;
    width: min(92rem, calc(100% - 4rem));
    min-height: 5.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateX(-50%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    z-index: 10;
  }
  .brand { display: inline-flex; align-items: center; gap: 0.72rem; font-size: 0.82rem; font-weight: 760; letter-spacing: 0.34em; }
  .brand-mark { position: relative; width: 1.8rem; height: 1.8rem; display: grid; place-items: center; border: 1px solid rgba(255, 211, 138, 0.28); border-radius: 50%; transform: rotate(45deg); }
  .brand-mark::before, .brand-mark::after, .brand-mark i { content: ''; position: absolute; background: var(--landing-gold); box-shadow: 0 0 12px rgba(255, 188, 92, 0.55); }
  .brand-mark::before { width: 0.32rem; height: 0.85rem; border-radius: 100% 0; transform: translate(-0.08rem, -0.15rem) rotate(18deg); }
  .brand-mark::after { width: 0.28rem; height: 0.56rem; border-radius: 100% 0; transform: translate(0.18rem, 0.19rem) rotate(18deg); opacity: 0.8; }
  .brand-mark i { width: 0.13rem; height: 0.13rem; border-radius: 50%; }
  .nav-links { display: flex; align-items: center; gap: 2rem; }
  .nav-links a { color: #b9b4c3; font-size: 0.77rem; transition: color 0.2s ease; }
  .nav-links a:hover { color: white; }
  .nav-enter { min-height: 2.5rem; padding: 0.55rem 1.1rem; color: var(--landing-gold) !important; background: rgba(255, 205, 128, 0.06); border: 1px solid rgba(255, 211, 138, 0.26); border-radius: 999px; cursor: pointer; }

  .hero {
    position: relative;
    width: min(92rem, calc(100% - 4rem));
    min-height: max(46rem, 100dvh);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(26rem, 0.9fr) minmax(34rem, 1.1fr);
    align-items: center;
    gap: clamp(3rem, 6vw, 7rem);
    padding: 8.5rem 0 5.5rem;
  }
  .hero-copy { position: relative; z-index: 2; max-width: 39rem; animation: rise-in 0.8s 0.08s ease both; }
  .eyebrow { margin: 0 0 1.35rem; color: var(--landing-gold); font: 650 0.67rem/1.35 var(--font-interface); letter-spacing: 0.2em; text-transform: uppercase; }
  .eyebrow span { margin-right: 0.45rem; }
  h1, h2 { margin: 0; font-family: var(--font-story); font-weight: 430; letter-spacing: -0.045em; }
  h1 { max-width: 43rem; font-size: clamp(3.65rem, 6.2vw, 6.9rem); line-height: 0.89; }
  h1 em, h2 em { color: var(--landing-gold); font-weight: 420; }
  .hero-summary { max-width: 35rem; margin: 2rem 0 0; color: #b8b3c0; font: 400 clamp(1rem, 1.35vw, 1.18rem)/1.75 var(--font-story); }
  .hero-actions { display: flex; align-items: center; gap: 1.5rem; margin-top: 2.25rem; }
  .primary-cta {
    min-height: 3.55rem;
    display: inline-flex;
    align-items: center;
    gap: 1.35rem;
    padding: 0.8rem 0.85rem 0.8rem 1.4rem;
    color: #1a1109 !important;
    background: linear-gradient(135deg, #ffdda1, #efaa55);
    border: 0;
    border-radius: 0.72rem;
    box-shadow: 0 0.8rem 2.5rem rgba(217, 130, 42, 0.2), inset 0 1px rgba(255, 255, 255, 0.48);
    font-size: 0.86rem;
    font-weight: 760;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .primary-cta:hover { transform: translateY(-2px); box-shadow: 0 1rem 3rem rgba(217, 130, 42, 0.3), inset 0 1px rgba(255, 255, 255, 0.48); }
  .primary-cta:disabled { cursor: wait; }
  .primary-cta i { width: 2.2rem; height: 2.2rem; display: grid; place-items: center; background: rgba(34, 20, 7, 0.12); border-radius: 0.5rem; font-style: normal; font-size: 1rem; }
  .secondary-cta { color: #c6c1cc; font-size: 0.82rem; border-bottom: 1px solid rgba(255, 255, 255, 0.14); padding-bottom: 0.28rem; }
  .secondary-cta span { margin-left: 0.45rem; color: var(--landing-gold); }
  .trust-line { display: flex; flex-wrap: wrap; gap: 1.25rem; margin: 1.4rem 0 0; padding: 0; color: #8f8a99; list-style: none; font-size: 0.7rem; }
  .trust-line span { color: var(--landing-gold); margin-right: 0.3rem; }
  .return-note { margin: 1.15rem 0 0; color: #cbc5d2; font: italic 0.82rem/1.5 var(--font-story); }
  .return-note span { color: var(--landing-gold); margin-right: 0.35rem; }

  .hero-visual { position: relative; min-width: 0; animation: visual-in 1s 0.2s ease both; }
  .world-window { position: relative; aspect-ratio: 1.6; display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(9rem, 0.72fr); overflow: hidden; background: #0c0b12; border: 1px solid rgba(255, 220, 158, 0.18); border-radius: 1.3rem; box-shadow: 0 2.5rem 7rem rgba(0, 0, 0, 0.55), 0 0 5rem rgba(224, 139, 50, 0.08); transform: perspective(1000px) rotateY(-3deg) rotateX(1deg); }
  .world-window::before { content: ''; position: absolute; inset: 0.55rem; z-index: 4; border: 1px solid rgba(255, 221, 163, 0.08); border-radius: 0.9rem; pointer-events: none; }
  .gameplay-focus { position: relative; min-width: 0; overflow: hidden; }
  .gameplay-focus::after { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(5, 6, 11, 0.8), transparent 36%); pointer-events: none; }
  .gameplay-focus > img { position: absolute; max-width: none; height: auto; display: block; filter: saturate(0.9) brightness(0.82) contrast(1.07); }
  .gameplay-focus > span { position: absolute; left: 1.25rem; bottom: 1rem; z-index: 3; padding: 0.48rem 0.65rem; color: #fff1ce; background: rgba(8, 8, 13, 0.78); border: 1px solid rgba(255, 211, 138, 0.16); border-radius: 0.5rem; font-size: 0.57rem; font-weight: 720; letter-spacing: 0.08em; text-transform: uppercase; backdrop-filter: blur(8px); }
  .gameplay-heart { border-right: 1px solid rgba(255, 220, 158, 0.14); }
  .gameplay-heart > img { width: 195%; left: 50%; top: 0; transform: translateX(-50%); }
  .gameplay-upgrade > img { width: 500%; right: 0; top: -15%; }
  .gameplay-upgrade > span { left: 0.85rem; right: 0.85rem; text-align: center; }
  .heart-pulse { position: absolute; left: 50%; top: 82%; z-index: 2; width: 3.2rem; height: 3.2rem; margin: -1.6rem 0 0 -1.6rem; display: grid; place-items: center; border: 1px solid rgba(255, 214, 140, 0.42); border-radius: 50%; box-shadow: 0 0 3rem rgba(255, 164, 67, 0.5); animation: heart-breathe 3s ease-in-out infinite; }
  .heart-pulse i { width: 0.65rem; height: 0.65rem; background: #fff2cc; border-radius: 50%; box-shadow: 0 0 1.4rem #ffb55b; }
  .gameplay-loop { margin: 1rem 0.5rem 0; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .gameplay-loop > span { display: grid; gap: 0.25rem; }
  .gameplay-loop small { color: #736e7b; font-size: 0.5rem; font-weight: 720; letter-spacing: 0.15em; text-transform: uppercase; }
  .gameplay-loop strong { color: #c5bfca; font: italic 0.78rem/1.35 var(--font-story); }
  .gameplay-loop ol { display: flex; align-items: center; gap: 0.7rem; margin: 0; padding: 0; color: #7f7987; list-style: none; font-size: 0.57rem; }
  .gameplay-loop li { display: flex; align-items: center; gap: 0.7rem; white-space: nowrap; }
  .gameplay-loop li + li::before { content: '→'; color: rgba(255, 211, 138, 0.38); }
  .gameplay-loop b { color: var(--landing-gold); font-weight: 720; }
  .orbit { position: absolute; left: 48%; top: 45%; border: 1px solid rgba(255, 213, 145, 0.1); border-radius: 50%; pointer-events: none; }
  .orbit-one { width: 116%; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(-18deg); }
  .orbit-two { width: 88%; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(22deg); }
  .scroll-cue { position: absolute; left: 0; bottom: 2.2rem; display: flex; align-items: center; gap: 0.8rem; color: #6f6b77; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
  .scroll-cue i { position: relative; width: 1px; height: 2.5rem; overflow: hidden; background: rgba(255, 255, 255, 0.12); }
  .scroll-cue i::after { content: ''; position: absolute; inset: 0 0 auto; height: 45%; background: var(--landing-gold); animation: scroll-line 2s ease-in-out infinite; }

  .promise-band { width: min(92rem, calc(100% - 4rem)); margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: center; gap: 1.5rem; padding: 2rem 2.3rem; background: rgba(255, 255, 255, 0.018); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 1rem; }
  .promise-band div { display: flex; align-items: center; gap: 0.8rem; }
  .promise-band strong { color: var(--landing-gold); font: 450 1.5rem/1 var(--font-story); }
  .promise-band span { color: #9d97a5; font-size: 0.66rem; line-height: 1.4; }
  .promise-band > i { color: rgba(255, 211, 138, 0.26); font-style: normal; }

  .section-shell { width: min(88rem, calc(100% - 4rem)); margin: 0 auto; }
  .section-intro { max-width: 41rem; }
  .section-intro h2, .philosophy h2, .final-invitation h2 { font-size: clamp(2.8rem, 4.8vw, 5.2rem); line-height: 0.96; }
  .section-intro > p:last-child { max-width: 38rem; margin: 1.5rem 0 0; color: var(--landing-dim); font: 400 1rem/1.75 var(--font-story); }
  .section-intro.centered { margin: 0 auto; text-align: center; }
  .section-intro.centered > p:last-child { margin-inline: auto; }

  .journey { padding: clamp(7rem, 10vw, 11rem) 0 5rem; }
  .realm-stage { margin-top: 4.4rem; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr); min-height: 32rem; background: linear-gradient(120deg, color-mix(in srgb, var(--realm-accent) 5%, #090a11), #08090f); border: 1px solid color-mix(in srgb, var(--realm-accent) 18%, transparent); border-radius: 1.2rem; overflow: hidden; box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.26); }
  .realm-image { position: relative; min-height: 30rem; overflow: hidden; }
  .realm-image img { width: 100%; height: 100%; display: block; object-fit: cover; filter: saturate(0.82) brightness(0.72); }
  .realm-vignette { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 60%, rgba(8, 9, 15, 0.78)), linear-gradient(0deg, rgba(4, 5, 9, 0.65), transparent 40%); }
  .realm-image > p { position: absolute; left: 2rem; bottom: 1.8rem; display: grid; margin: 0; }
  .realm-image > p span { color: var(--realm-accent); font-size: 0.52rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
  .realm-image > p strong { margin-top: 0.25rem; font: 450 1.6rem/1.2 var(--font-story); }
  .realm-story { position: relative; align-self: stretch; display: flex; flex-direction: column; justify-content: center; padding: 3rem; overflow: hidden; }
  .realm-number { position: absolute; right: -0.4rem; top: -1.8rem; color: color-mix(in srgb, var(--realm-accent) 8%, transparent); font: 400 13rem/1 var(--font-story); }
  .realm-story .eyebrow { color: var(--realm-accent); margin-bottom: 0.8rem; }
  .realm-story h3 { margin: 0; font: 450 2.65rem/1.05 var(--font-story); }
  .realm-story > p:not(.eyebrow) { position: relative; margin: 1.2rem 0 0; color: #aaa4b2; font: italic 0.9rem/1.7 var(--font-story); }
  .realm-controls { margin-top: 2.3rem; display: flex; align-items: center; gap: 0.85rem; }
  .realm-controls button { width: 2.5rem; height: 2.5rem; border: 1px solid color-mix(in srgb, var(--realm-accent) 22%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--realm-accent) 5%, transparent); cursor: pointer; }
  .realm-controls span { color: #797480; font-size: 0.62rem; font-variant-numeric: tabular-nums; }
  .realm-tabs { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 0.8rem; gap: 0.5rem; }
  .realm-tabs button { min-height: 3.4rem; display: flex; align-items: center; gap: 0.55rem; padding: 0.65rem 0.75rem; color: #7f7987; background: rgba(255, 255, 255, 0.018); border: 1px solid rgba(255, 255, 255, 0.055); border-radius: 0.65rem; font-size: 0.68rem; cursor: pointer; transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
  .realm-tabs button span { color: #5d5865; font: 500 0.8rem/1 var(--font-story); }
  .realm-tabs button:hover, .realm-tabs button.active { color: #e9e4ed; border-color: rgba(255, 211, 138, 0.2); background: rgba(255, 211, 138, 0.045); }
  .features { padding: clamp(7rem, 10vw, 10rem) 0; }
  .feature-grid { margin-top: 4.2rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
  .feature-grid article { min-height: 21rem; display: flex; flex-direction: column; padding: 1.5rem; background: linear-gradient(145deg, rgba(255, 255, 255, 0.028), rgba(255, 255, 255, 0.012)); border: 1px solid rgba(255, 255, 255, 0.065); border-radius: 0.9rem; transition: transform 0.25s ease, border-color 0.25s ease; }
  .feature-grid article:hover { transform: translateY(-4px); border-color: rgba(255, 211, 138, 0.17); }
  .feature-grid article.feature-wide { grid-column: span 2; }
  .feature-top { display: flex; justify-content: space-between; align-items: center; }
  .feature-glyph { width: 2.8rem; height: 2.8rem; display: grid; place-items: center; color: var(--landing-gold); background: rgba(255, 205, 125, 0.05); border: 1px solid rgba(255, 211, 138, 0.12); border-radius: 50%; }
  .feature-top small { color: #4f4b56; font: 500 0.65rem/1 var(--font-interface); }
  .feature-grid article > p:first-of-type { margin: 2rem 0 0.55rem; color: #726d79; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
  .feature-grid h3 { margin: 0; font: 470 1.55rem/1.12 var(--font-story); }
  .feature-rule { flex: 0 0 3.1rem; display: flex; align-items: center; }
  .feature-rule i { width: 2.4rem; border-top: 1px solid rgba(255, 211, 138, 0.17); }
  .feature-grid article > p:last-child { margin: 0; color: #938e9c; font: 400 0.78rem/1.65 var(--font-story); }

  .philosophy { position: relative; min-height: 38rem; display: grid; grid-template-columns: 1fr 0.92fr; align-items: center; gap: 8rem; padding: 6rem; background: radial-gradient(circle at 20% 50%, rgba(211, 131, 47, 0.09), transparent 24rem), #090a10; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 1.4rem; overflow: hidden; }
  .philosophy > div:nth-child(2) { position: relative; z-index: 2; }
  .philosophy > div > p:not(.eyebrow) { margin: 1.5rem 0 0; color: #9e98a6; font: 400 0.92rem/1.75 var(--font-story); }
  .philosophy > div > strong { display: inline-block; margin-top: 1.8rem; padding: 0.7rem 1rem; color: var(--landing-gold); border: 1px solid rgba(255, 211, 138, 0.16); border-radius: 999px; font-size: 0.65rem; letter-spacing: 0.05em; }
  .philosophy ul { position: relative; z-index: 2; display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
  .philosophy li { display: grid; grid-template-columns: auto 1fr; gap: 1rem; padding: 1.35rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
  .philosophy li:last-child { border: 0; }
  .philosophy li > span { color: var(--landing-gold); }
  .philosophy li div { display: grid; gap: 0.45rem; }
  .philosophy li strong { font: 470 1.05rem/1.2 var(--font-story); }
  .philosophy li small { color: #898490; font: 400 0.72rem/1.6 var(--font-story); }
  .philosophy-orbit { position: absolute; left: -5rem; bottom: -8rem; width: 30rem; height: 30rem; border: 1px solid rgba(255, 211, 138, 0.06); border-radius: 50%; }
  .philosophy-orbit::before, .philosophy-orbit::after { content: ''; position: absolute; inset: 3rem; border: 1px solid rgba(255, 211, 138, 0.055); border-radius: 50%; }
  .philosophy-orbit::after { inset: 7rem; }
  .philosophy-orbit i { position: absolute; border-radius: 50%; background: #dba352; box-shadow: 0 0 1rem rgba(238, 169, 79, 0.5); }
  .philosophy-orbit i:nth-child(1) { width: 0.4rem; height: 0.4rem; top: 3rem; left: 10rem; }
  .philosophy-orbit i:nth-child(2) { width: 0.25rem; height: 0.25rem; top: 8rem; right: 2.4rem; }
  .philosophy-orbit i:nth-child(3) { width: 0.55rem; height: 0.55rem; left: 14rem; top: 14rem; }

  .realm-roll { margin: 8rem 0 0; padding: 2.5rem 0; overflow: hidden; border-top: 1px solid rgba(255, 255, 255, 0.055); border-bottom: 1px solid rgba(255, 255, 255, 0.055); }
  .realm-roll > p { margin: 0 0 1rem; color: #5f5b65; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.2em; text-align: center; text-transform: uppercase; }
  .realm-roll > div { display: flex; justify-content: center; gap: clamp(1.2rem, 3vw, 4rem); min-width: max-content; padding: 0 2rem; }
  .realm-roll span { color: #9b95a2; font: italic 1.05rem/1.3 var(--font-story); }
  .realm-roll span::after { content: '✦'; margin-left: clamp(1.2rem, 3vw, 4rem); color: rgba(255, 211, 138, 0.25); font-size: 0.5rem; vertical-align: middle; }
  .realm-roll span:last-child::after { display: none; }

  .final-invitation { padding: clamp(8rem, 13vw, 13rem) 0; text-align: center; }
  .final-mark { position: relative; width: 6.5rem; height: 6.5rem; display: grid; place-items: center; margin: 0 auto 2rem; border: 1px solid rgba(255, 211, 138, 0.12); border-radius: 50%; box-shadow: 0 0 5rem rgba(230, 145, 54, 0.1); }
  .final-mark::before, .final-mark::after { content: ''; position: absolute; border: 1px solid rgba(255, 211, 138, 0.08); border-radius: 50%; }
  .final-mark::before { inset: 0.7rem; }
  .final-mark::after { inset: 1.4rem; }
  .final-mark i { width: 1rem; height: 1.5rem; background: linear-gradient(145deg, #fff0c7, #e9953c); border-radius: 80% 10% 80% 45%; transform: rotate(38deg); box-shadow: 0 0 2.5rem #d98235; }
  .final-invitation .eyebrow { margin-bottom: 1.3rem; }
  .final-invitation > p:not(.eyebrow) { margin: 1.5rem 0 0; color: #8d8895; font: italic 0.95rem/1.6 var(--font-story); }
  .final-cta { margin: 2.2rem auto 0; }
  .final-invitation > small { display: block; margin-top: 1.25rem; color: #5e5a65; font-size: 0.58rem; letter-spacing: 0.08em; }

  footer { width: min(92rem, calc(100% - 4rem)); min-height: 7rem; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  .footer-brand { justify-self: start; color: #aaa4b0; }
  footer > p { margin: 0; color: #625e69; font: italic 0.65rem/1.5 var(--font-story); text-align: center; }
  footer > button { justify-self: end; padding: 0.5rem 0; color: #99939f; background: transparent; border: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.12); font-size: 0.68rem; cursor: pointer; }
  footer > button span { margin-left: 0.3rem; color: var(--landing-gold); }

  @keyframes rise-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes visual-in { from { opacity: 0; transform: translateX(25px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
  @keyframes heart-breathe { 0%, 100% { transform: scale(0.92); opacity: 0.65; } 50% { transform: scale(1.1); opacity: 1; } }
  @keyframes scroll-line { 0% { transform: translateY(-120%); } 55%, 100% { transform: translateY(240%); } }

  @media (max-width: 1050px) {
    .hero { grid-template-columns: 1fr 0.95fr; gap: 3rem; }
    .gameplay-loop { align-items: flex-start; flex-direction: column; gap: 0.65rem; }
    .feature-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-grid article.feature-wide { grid-column: span 1; }
    .philosophy { gap: 4rem; padding: 4rem; }
    .realm-tabs { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 800px) {
    .landing-nav, .hero, .promise-band, .section-shell, footer { width: min(100% - 2rem, 44rem); }
    .landing-nav { min-height: 4.5rem; }
    .nav-links a { display: none; }
    .nav-links { gap: 0.6rem; }
    .hero { min-height: auto; grid-template-columns: 1fr; gap: 4.8rem; padding: 7.5rem 0 6rem; }
    .hero-copy { max-width: 38rem; }
    h1 { font-size: clamp(3.25rem, 13.5vw, 5.5rem); }
    .hero-visual { width: calc(100% - 1rem); justify-self: center; }
    .gameplay-loop { align-items: center; flex-direction: row; gap: 1.5rem; }
    .scroll-cue { display: none; }
    .promise-band { grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1.5rem; }
    .promise-band > i { display: none; }
    .promise-band div { align-items: flex-start; }
    .journey { padding-top: 7rem; }
    .realm-stage { grid-template-columns: 1fr; }
    .realm-image { min-height: 20rem; }
    .realm-story { min-height: 20rem; }
    .realm-vignette { background: linear-gradient(0deg, rgba(8, 9, 15, 0.8), transparent 55%); }
    .features { padding-block: 7rem; }
    .feature-grid { grid-template-columns: 1fr 1fr; }
    .philosophy { grid-template-columns: 1fr; gap: 3rem; padding: 3rem; }
    .realm-roll { overflow-x: auto; }
    .realm-roll > div { justify-content: flex-start; }
    footer { grid-template-columns: 1fr auto; }
    footer > p { display: none; }
  }

  @media (max-width: 560px) {
    .landing-nav, .hero, .promise-band, .section-shell, footer { width: min(100% - 1.25rem, 36rem); }
    .brand { letter-spacing: 0.24em; }
    .nav-enter { padding-inline: 0.85rem; }
    .hero { padding-top: 6.8rem; }
    .hero-actions { align-items: stretch; flex-direction: column; gap: 1rem; }
    .primary-cta { justify-content: space-between; width: 100%; }
    .secondary-cta { align-self: flex-start; }
    .trust-line { gap: 0.7rem 1rem; }
    .hero-visual { width: calc(100% - 0.5rem); }
    .world-window { aspect-ratio: 0.92; grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) 8.25rem; transform: none; }
    .gameplay-heart { border-right: 0; border-bottom: 1px solid rgba(255, 220, 158, 0.14); }
    .gameplay-heart > img { width: 175%; top: 0; }
    .gameplay-upgrade > img { width: 440%; top: -72%; }
    .gameplay-focus > span { left: 0.8rem; bottom: 0.75rem; }
    .gameplay-upgrade > span { left: auto; right: 0.75rem; width: auto; }
    .heart-pulse { top: 90%; }
    .gameplay-loop { margin: 0.9rem 0 0; align-items: stretch; flex-direction: column; gap: 0.8rem; }
    .gameplay-loop > span { text-align: center; }
    .gameplay-loop ol { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem; }
    .gameplay-loop li { justify-content: center; gap: 0.35rem; text-align: center; white-space: normal; }
    .gameplay-loop li + li::before { display: none; }
    .promise-band { grid-template-columns: 1fr; }
    .promise-band div { justify-content: space-between; }
    .section-intro h2, .philosophy h2, .final-invitation h2 { font-size: clamp(2.7rem, 13vw, 4rem); }
    .realm-stage { margin-top: 2.8rem; }
    .realm-image { min-height: 16rem; }
    .realm-story { min-height: 18rem; padding: 2rem; }
    .realm-tabs { grid-template-columns: repeat(2, 1fr); }
    .feature-grid { grid-template-columns: 1fr; }
    .feature-grid article { min-height: 18rem; }
    .philosophy { padding: 2.1rem 1.5rem; }
    .final-invitation { padding-block: 8rem; }
    footer { min-height: 6rem; }
    footer > button { max-width: 8rem; text-align: right; }
  }

  @media (prefers-reduced-motion: reduce) {
    .landing { scroll-behavior: auto; transition-duration: 0.01ms; }
    .hero-copy, .hero-visual { animation: none; }
    .heart-pulse, .scroll-cue i::after { animation: none; }
    .primary-cta, .feature-grid article { transition: none; }
  }
</style>
