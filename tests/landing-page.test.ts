import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { landingPrimaryCta, shouldShowLanding } from '../src/experience/landing'

test('the landing page welcomes the first visit once per tab session', () => {
  assert.equal(shouldShowLanding({
    sessionEntered: false,
    developmentScenario: false,
    playtestMode: false,
    forceLanding: false,
  }), true)
  assert.equal(shouldShowLanding({
    sessionEntered: true,
    developmentScenario: false,
    playtestMode: false,
    forceLanding: false,
  }), false)
})

test('development routes stay direct unless landing review is forced', () => {
  assert.equal(shouldShowLanding({
    sessionEntered: false,
    developmentScenario: true,
    playtestMode: false,
    forceLanding: false,
  }), false)
  assert.equal(shouldShowLanding({
    sessionEntered: true,
    developmentScenario: true,
    playtestMode: true,
    forceLanding: true,
  }), true)
})

test('the primary invitation distinguishes new and returning players', () => {
  assert.equal(landingPrimaryCta(false), 'Ignite the first light')
  assert.equal(landingPrimaryCta(true), 'Continue your universe')
})

test('the landing page compiles cleanly and presents the complete game promise', () => {
  const landingPath = new URL('../src/ui/LandingPage.svelte', import.meta.url)
  const source = readFileSync(landingPath, 'utf8')
  const compiled = compile(source, {
    filename: landingPath.pathname,
    generate: 'client',
  })

  assert.deepEqual(compiled.warnings, [])
  assert.match(source, /seven\s+authored realms/i)
  assert.match(source, /offline progress/i)
  assert.match(source, /rhythm/i)
  assert.match(source, /trials/i)
  assert.match(source, /story/i)
  assert.match(source, /No ads · No gacha · No energy timers/i)
  assert.match(source, /prefers-reduced-motion/)
})

test('the simulation starts only after the landing entry is accepted', () => {
  const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const root = readFileSync(new URL('../src/Root.svelte', import.meta.url), 'utf8')

  assert.match(main, /function startGameRuntime\(\)[\s\S]*startLoop\(\)[\s\S]*startAutosave\(\)/)
  assert.match(main, /if \(!showLanding\) startGameRuntime\(\)/)
  assert.match(main, /onenter: \(\) => \{[\s\S]*markLandingEntered\(\)[\s\S]*startGameRuntime\(\)/)
  assert.match(root, /\{#if landingOpen\}[\s\S]*<LandingPage[\s\S]*\{:else\}[\s\S]*<App/)
})
