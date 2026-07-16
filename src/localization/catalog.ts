import { GUIDE_CHAPTERS } from '../content/guide'
import { V2_UNIVERSE_BY_ID } from '../content/universes'
import { ATLAS_FRAGMENTS, ATLAS_LAWS, ATLAS_MASTERIES, CONVERGENCES } from '../endgame/atlas'
import { GARDEN_CLOSURES, GARDEN_LINKS, GARDEN_NODES } from '../endgame/garden'
import { LUMEN_COMPLICITY_LINES } from '../content/lumen-complicity'
import { REALM_CHOICE_CALLBACKS, REALM_CONCLUSIONS } from '../content/endings'
import { SAGA_LUMEN_LINES } from '../content/saga-lumen'

export const SHELL_MESSAGES: Readonly<Record<string, string>> = {
  'shell.game-title': 'EMBER',
  'shell.legacy-title': 'The Legacy of Light',
  'shell.chronicle-title': 'The Chronicle',
  'shell.loadouts-title': 'Law loadouts',
  'shell.atlas-title': 'Atlas of Possible Worlds',
  'shell.garden-title': 'The Garden',
  'shell.route-begin': 'Begin temporary route',
  'shell.route-abandon': 'Abandon and restore source run',
  'shell.route-complete': 'Archive completed route',
  'shell.loadout-save': 'Save and create build code',
  'shell.loadout-import': 'Read code',
  'shell.garden-continue': 'Continue into the Atlas',
  'shell.close': 'Close',
}

export function buildEnglishCatalog(): Readonly<Record<string, string>> {
  const messages: Record<string, string> = { ...SHELL_MESSAGES }
  const put = (key: string, value: string | undefined) => {
    if (value?.trim()) messages[key] = value.trim()
  }

  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    const root = `universe.${universeId}`
    put(`${root}.name`, pack.identity.name)
    put(`${root}.epithet`, pack.identity.epithet)
    put(`${root}.premise`, pack.identity.premise)
    put(`${root}.question`, pack.identity.civilizationQuestion)
    put(`${root}.currency`, pack.economy.currency.localName)
    put(`${root}.epoch`, pack.economy.localPrestige.localName)
    put(`${root}.archive`, pack.archive.localName)
    for (const generator of pack.economy.generators) {
      put(`${root}.kindling.${generator.id}.name`, generator.name)
      put(`${root}.kindling.${generator.id}.flavor`, generator.flavor)
    }
    for (const upgrade of pack.economy.upgrades) {
      put(`${root}.upgrade.${upgrade.id}.name`, upgrade.name)
      put(`${root}.upgrade.${upgrade.id}.flavor`, upgrade.flavor)
    }
    for (const doctrine of pack.economy.doctrines) {
      put(`${root}.doctrine.${doctrine.id}.name`, doctrine.name)
      put(`${root}.doctrine.${doctrine.id}.description`, doctrine.description)
    }
    for (const omen of pack.omens) {
      put(`${root}.omen.${omen.id}.name`, omen.name)
      put(`${root}.omen.${omen.id}.description`, omen.description)
    }
    for (const record of pack.archive.records) {
      put(`${root}.archive-record.${record.id}.name`, record.name)
      put(`${root}.archive-record.${record.id}.observation`, record.observation)
      put(`${root}.archive-record.${record.id}.implication`, record.implication)
      put(`${root}.archive-record.${record.id}.effect`, record.effectDescription)
    }
    for (const shelf of pack.archive.shelves) {
      put(`${root}.archive-shelf.${shelf.id}.name`, shelf.name)
      put(`${root}.archive-shelf.${shelf.id}.reward`, shelf.rewardDescription)
    }
    for (const trial of pack.trials) {
      put(`${root}.trial.${trial.id}.name`, trial.name)
      put(`${root}.trial.${trial.id}.failure`, trial.historicalFailure)
      put(`${root}.trial.${trial.id}.goal`, trial.goal.description)
      put(`${root}.trial.${trial.id}.accessibility`, trial.accessibilityDescription)
    }
    for (const echo of pack.story.echoes) {
      put(`${root}.echo.${echo.id}.title`, echo.title)
      put(`${root}.echo.${echo.id}.text`, echo.text)
    }
  }

  for (const chapter of GUIDE_CHAPTERS) {
    const root = `guide.${chapter.id}`
    put(`${root}.nav`, chapter.nav)
    put(`${root}.title`, chapter.title)
    put(`${root}.summary`, chapter.summary)
    for (const [index, block] of chapter.blocks.entries()) {
      put(`${root}.block.${index}.heading`, block.heading)
      block.paragraphs.forEach((paragraph, paragraphIndex) => put(`${root}.block.${index}.paragraph.${paragraphIndex}`, paragraph))
      block.bullets?.forEach((bullet, bulletIndex) => put(`${root}.block.${index}.bullet.${bulletIndex}`, bullet))
      put(`${root}.block.${index}.note`, block.note)
    }
  }

  for (const law of ATLAS_LAWS) {
    put(`atlas.law.${law.id}.name`, law.name)
    put(`atlas.law.${law.id}.description`, law.description)
  }
  for (const fragment of ATLAS_FRAGMENTS) {
    put(`atlas.fragment.${fragment.id}.title`, fragment.title)
    put(`atlas.fragment.${fragment.id}.text`, fragment.text)
  }
  for (const mastery of ATLAS_MASTERIES) put(`atlas.mastery.${mastery.id}`, mastery.label)
  for (const convergence of CONVERGENCES) {
    put(`atlas.convergence.${convergence.id}.name`, convergence.name)
    put(`atlas.convergence.${convergence.id}.description`, convergence.description)
  }
  for (const node of GARDEN_NODES) {
    put(`garden.node.${node.universeId}.name`, node.name)
    put(`garden.node.${node.universeId}.offering`, node.offering)
    put(`garden.node.${node.universeId}.question`, node.question)
  }
  for (const link of GARDEN_LINKS) {
    put(`garden.link.${link.id}.name`, link.name)
    put(`garden.link.${link.id}.result`, link.result)
  }
  for (const closure of GARDEN_CLOSURES) {
    put(`garden.closure.${closure.id}.name`, closure.name)
    put(`garden.closure.${closure.id}.consequence`, closure.consequence)
    put(`garden.closure.${closure.id}.final-line`, closure.finalLine)
  }
  for (const [universeId, conclusion] of Object.entries(REALM_CONCLUSIONS)) {
    const root = `conclusion.${universeId}`
    put(`${root}.title`, conclusion.title)
    put(`${root}.theme`, conclusion.theme)
    put(`${root}.conflict`, conclusion.conflict)
    put(`${root}.emotional-purpose`, conclusion.emotionalPurpose)
    put(`${root}.tableau`, conclusion.tableau)
    put(`${root}.archive-title`, conclusion.archiveTitle)
    put(`${root}.question`, conclusion.question)
    conclusion.lines.forEach((line, index) => put(`${root}.line.${index}`, line))
    put(`${root}.afterword`, conclusion.afterword)
    for (const answer of conclusion.choices) {
      const answerRoot = `${root}.answer.${answer.id}`
      put(`${answerRoot}.label`, answer.label)
      put(`${answerRoot}.stance`, answer.stance)
      put(`${answerRoot}.line`, answer.line)
      put(`${answerRoot}.benefit`, answer.benefit)
      put(`${answerRoot}.cost`, answer.cost)
      put(`${answerRoot}.acknowledgment`, answer.acknowledgment)
      put(`${answerRoot}.coda`, answer.coda)
      put(`${answerRoot}.law`, answer.lawName)
      put(`${answerRoot}.vessel`, answer.vesselEcho)
      put(`${answerRoot}.garden`, answer.gardenEcho)
      answer.epilogue.forEach((line, index) => put(`${answerRoot}.epilogue.${index}`, line))
    }
  }
  for (const callback of REALM_CHOICE_CALLBACKS) {
    put(`conclusion.callback.${callback.id}.completion`, callback.completionLine)
    put(`conclusion.callback.${callback.id}.lumen`, callback.lumenLine)
  }
  for (const line of SAGA_LUMEN_LINES) put(`lumen.saga.${line.id}`, line.text)
  for (const line of LUMEN_COMPLICITY_LINES) put(`lumen.complicity.${line.id}`, line.text)

  return Object.fromEntries(Object.entries(messages).sort(([left], [right]) => left.localeCompare(right)))
}
