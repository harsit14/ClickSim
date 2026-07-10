import { readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const INITIAL_BUDGET_BYTES = 3 * 1024 * 1024
const SINGLE_ASSET_BUDGET_BYTES = 1024 * 1024
const INITIAL_EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.svg', '.png', '.webp', '.woff2'])

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(path) : [path]
  })
}

const files = filesIn(DIST)
const initialFiles = files.filter((file) => INITIAL_EXTENSIONS.has(extname(file)))
const total = initialFiles.reduce((sum, file) => sum + statSync(file).size, 0)
const oversized = initialFiles.filter((file) => statSync(file).size > SINGLE_ASSET_BUDGET_BYTES)

if (total > INITIAL_BUDGET_BYTES || oversized.length > 0) {
  console.error(`Build budget failed: ${(total / 1024).toFixed(1)} KiB initial payload.`)
  for (const file of oversized) {
    console.error(`Oversized asset: ${relative(DIST, file)} (${(statSync(file).size / 1024).toFixed(1)} KiB)`)
  }
  process.exit(1)
}

console.log(`Build budget passed: ${(total / 1024).toFixed(1)} KiB / 3072.0 KiB initial payload; ${initialFiles.length} files.`)
