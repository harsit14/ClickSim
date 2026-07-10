import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const index = readFileSync(join(dist, 'index.html'), 'utf8')
const worker = readFileSync(join(dist, 'sw.js'), 'utf8')
const catalog = JSON.parse(readFileSync(join(dist, 'i18n/en.json'), 'utf8'))
const assets = readdirSync(join(dist, 'assets')).filter((file) => statSync(join(dist, 'assets', file)).isFile())
const issues = []
if (/\b(?:src|href)="\/assets\//.test(index)) issues.push('index.html contains root-absolute asset paths')
if (!index.includes('./assets/')) issues.push('index.html does not contain relative asset paths')
for (const asset of assets) if (!worker.includes(`./assets/${asset}`)) issues.push(`service worker does not precache assets/${asset}`)
if (!worker.includes('./index.html')) issues.push('service worker does not precache index.html')
if (!worker.includes('./i18n/en.json')) issues.push('service worker does not precache the English catalog')
if (!catalog.messages || Object.keys(catalog.messages).length < 900) issues.push('localization catalog is missing or incomplete')
if (issues.length > 0) {
  console.error(issues.join('\n'))
  process.exit(1)
}
console.log(`Offline/static build passed: ${assets.length} assets and ${Object.keys(catalog.messages).length} strings precached.`)
