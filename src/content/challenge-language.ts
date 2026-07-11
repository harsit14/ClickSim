import type { ChallengeDef } from './challenges'

export interface ChallengeLanguageContext {
  readonly id: string
  readonly currency: string
  readonly currencyGlyph: string
  readonly generators: readonly { readonly id: string; readonly name: string }[]
  readonly events: { readonly noun: string }
}

interface ChallengeLexicon {
  readonly unitSingular: string
  readonly unitPlural: string
  readonly actionVerb: string
  readonly earnVerb: string
  readonly inputPlural: string
  readonly upgradePlural: string
  readonly productionNoun: string
  readonly produceVerb: string
  readonly functionVerb: string
  readonly relationshipPlural: string
  readonly manualCurrencyVerb: string
  readonly silenceSound: string
  readonly silenceRhythm: string
  readonly silencePlace: string
}

const EMBERLIGHT_LEXICON: ChallengeLexicon = {
  unitSingular: 'Kindling',
  unitPlural: 'Kindlings',
  actionVerb: 'kindle',
  earnVerb: 'earn',
  inputPlural: 'clicks',
  upgradePlural: 'upgrades',
  productionNoun: 'production',
  produceVerb: 'produce',
  functionVerb: 'function',
  relationshipPlural: 'resonances',
  manualCurrencyVerb: 'earned',
  silenceSound: 'music',
  silenceRhythm: 'rhythm',
  silencePlace: 'the dark',
}

const LEXICONS: Readonly<Record<string, ChallengeLexicon>> = {
  emberlight: EMBERLIGHT_LEXICON,
  tidefall: {
    unitSingular: 'formation', unitPlural: 'formations', actionVerb: 'surface', earnVerb: 'surface',
    inputPlural: 'touches', upgradePlural: 'adaptations', productionNoun: 'flow', produceVerb: 'contribute',
    functionVerb: 'carry the current', relationshipPlural: 'relationships', manualCurrencyVerb: 'surfaced', silenceSound: 'song',
    silenceRhythm: 'tide rhythm', silencePlace: 'the pressure-dark',
  },
  verdance: {
    unitSingular: 'organism', unitPlural: 'organisms', actionVerb: 'grow', earnVerb: 'cultivate',
    inputPlural: 'tendings', upgradePlural: 'grafts', productionNoun: 'growth', produceVerb: 'contribute',
    functionVerb: 'grow', relationshipPlural: 'root relationships', manualCurrencyVerb: 'cultivated', silenceSound: 'canopy-song',
    silenceRhythm: 'growth rhythm', silencePlace: 'the shade',
  },
  clockwork: {
    unitSingular: 'mechanism', unitPlural: 'mechanisms', actionVerb: 'build', earnVerb: 'transmit',
    inputPlural: 'manual engagements', upgradePlural: 'patents', productionNoun: 'transmission', produceVerb: 'transmit',
    functionVerb: 'operate', relationshipPlural: 'linkages', manualCurrencyVerb: 'transmitted', silenceSound: 'bells',
    silenceRhythm: 'cadence', silencePlace: 'the unpowered city',
  },
  prismata: {
    unitSingular: 'form', unitPlural: 'forms', actionVerb: 'unfold', earnVerb: 'unfold',
    inputPlural: 'marks', upgradePlural: 'revisions', productionNoun: 'possibility', produceVerb: 'contribute',
    functionVerb: 'answer a creation direction', relationshipPlural: 'mandala relations', manualCurrencyVerb: 'unfolded', silenceSound: 'page-breath',
    silenceRhythm: 'fourfold cycle', silencePlace: 'the unwritten margin',
  },
  tempest: {
    unitSingular: 'refuge', unitPlural: 'refuges', actionVerb: 'sustain', earnVerb: 'return',
    inputPlural: 'tendings', upgradePlural: 'corrections', productionNoun: 'continuity', produceVerb: 'contribute',
    functionVerb: 'carry the circuit', relationshipPlural: 'current relations', manualCurrencyVerb: 'sustained', silenceSound: 'water-bed',
    silenceRhythm: 'returning tide', silencePlace: 'the still ocean',
  },
  canticle: {
    unitSingular: 'refuge', unitPlural: 'refuges', actionVerb: 'release', earnVerb: 'carry',
    inputPlural: 'tendings', upgradePlural: 'paths', productionNoun: 'cadence', produceVerb: 'contribute',
    functionVerb: 'carry the cycle', relationshipPlural: 'mountain relations', manualCurrencyVerb: 'carried', silenceSound: 'mountain wind',
    silenceRhythm: 'five-act cycle', silencePlace: 'the open summit',
  },
}

const CANONICAL_GENERATOR_SLOTS: Readonly<Record<string, number>> = {
  spark: 0,
  wisp: 1,
  hearth: 2,
  sun: 9,
  ember2: 17,
}

function pluralize(noun: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`
  return `${noun}s`
}

function lowerFirst(value: string): string {
  return value.length === 0 ? value : value[0].toLocaleLowerCase() + value.slice(1)
}

function upperFirst(value: string): string {
  return value.length === 0 ? value : value[0].toLocaleUpperCase() + value.slice(1)
}

function thirdPerson(verb: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(verb)) return `${verb}es`
  if (/[^aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ies`
  return `${verb}s`
}

function singularize(value: string): string {
  return value.endsWith('s') ? value.slice(0, -1) : value
}

/**
 * Resolves the canonical trial mechanics into the current world's vocabulary. Stable
 * challenge IDs and generator tiers remain canonical; only player-facing language moves.
 */
export function localizeChallengeText(text: string, context: ChallengeLanguageContext): string {
  const lexicon = LEXICONS[context.id] ?? EMBERLIGHT_LEXICON
  const eventPlural = pluralize(context.events.noun)

  if (text === 'No music. No rhythm. No stars. Just you and the dark.') {
    return `No ${lexicon.silenceSound}. No ${lexicon.silenceRhythm}. No ${eventPlural}. Just you and ${lexicon.silencePlace}.`
  }

  let localized = text
    .replaceAll('Every point of light is clicked.', `${context.currency} can only be ${lexicon.manualCurrencyVerb} through ${lexicon.inputPlural}.`)
    .replaceAll('{currency}', context.currency)
    .replaceAll('✦', context.currencyGlyph)
    .replaceAll('falling stars', eventPlural)
    .replaceAll('Falling Stars', upperFirst(eventPlural))
    .replaceAll('generator resonances', `${lowerFirst(lexicon.unitSingular)} ${lexicon.relationshipPlural}`)

  for (const generator of context.generators) {
    localized = localized.replaceAll(`{${generator.id}}`, generator.name)
  }
  for (const [token, index] of Object.entries(CANONICAL_GENERATOR_SLOTS)) {
    const generator = context.generators[index]
    if (generator) localized = localized.replaceAll(`{${token}}`, generator.name)
  }

  return localized
    .replace(/\bGenerators\b/g, upperFirst(lexicon.unitPlural))
    .replace(/\bgenerators\b/g, lowerFirst(lexicon.unitPlural))
    .replace(/\bGenerator\b/g, upperFirst(lexicon.unitSingular))
    .replace(/\bgenerator\b/g, lowerFirst(lexicon.unitSingular))
    .replace(/\bKindlings\b/g, upperFirst(lexicon.unitPlural))
    .replace(/\bkindlings\b/g, lowerFirst(lexicon.unitPlural))
    .replace(/\bKindling\b/g, upperFirst(lexicon.unitSingular))
    .replace(/\bkindling\b/g, lowerFirst(lexicon.unitSingular))
    .replace(/\bkindle\b/g, lexicon.actionVerb)
    .replace(/\bClicks\b/g, upperFirst(lexicon.inputPlural))
    .replace(/\bclicks\b/g, lexicon.inputPlural)
    .replace(/\bUpgrades\b/g, upperFirst(lexicon.upgradePlural))
    .replace(/\bupgrades\b/g, lexicon.upgradePlural)
    .replace(/\bUpgrade\b/g, upperFirst(singularize(lexicon.upgradePlural)))
    .replace(/\bupgrade\b/g, singularize(lexicon.upgradePlural))
    .replace(/\bProduction\b/g, upperFirst(lexicon.productionNoun))
    .replace(/\bproduction\b/g, lexicon.productionNoun)
    .replace(/\bProduces\b/g, upperFirst(thirdPerson(lexicon.produceVerb)))
    .replace(/\bproduces\b/g, thirdPerson(lexicon.produceVerb))
    .replace(/\bProduce\b/g, upperFirst(lexicon.produceVerb))
    .replace(/\bproduce\b/g, lexicon.produceVerb)
    .replace(/\bfunction\b/g, lexicon.functionVerb)
    .replace(/\blight\/s\b/g, `${context.currency.toLocaleLowerCase()}/s`)
    .replace(/\blight\b/g, context.currency.toLocaleLowerCase())
    .replace(/\bkindle\b/g, lexicon.actionVerb)
    .replace(/\bearn\b/g, lexicon.earnVerb)
}

export interface ChallengeDisplayCopy {
  readonly name: string
  readonly flavor: string
  readonly rules: string
  readonly goalText: string
  readonly rewardDesc: string
}

export function localizedChallengeCopy(
  challenge: ChallengeDef,
  context: ChallengeLanguageContext,
  identity: { readonly name: string; readonly flavor: string },
): ChallengeDisplayCopy {
  return {
    name: identity.name,
    flavor: identity.flavor,
    rules: localizeChallengeText(challenge.rules, context),
    goalText: localizeChallengeText(challenge.goalText, context),
    rewardDesc: localizeChallengeText(challenge.rewardDesc, context),
  }
}
