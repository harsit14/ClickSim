import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildEnglishCatalog } from '../src/localization/catalog'

const destination = resolve('dist/i18n/en.json')
const messages = buildEnglishCatalog()
mkdirSync(resolve('dist/i18n'), { recursive: true })
writeFileSync(destination, `${JSON.stringify({ locale: 'en', messages }, null, 2)}\n`, 'utf8')
console.log(`Localization catalog written: ${Object.keys(messages).length} messages.`)
