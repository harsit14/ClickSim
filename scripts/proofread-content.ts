import { buildEnglishCatalog } from '../src/localization/catalog'

const messages = buildEnglishCatalog()
const issues: string[] = []
for (const [key, value] of Object.entries(messages)) {
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) issues.push(`${key}: contains a control character`)
  if (/\b([a-z]{2,})\s+\1\b/i.test(value)) issues.push(`${key}: repeats an adjacent word`)
  if (/\s{2,}/.test(value.replace(/\n/g, ''))) issues.push(`${key}: contains repeated inline whitespace`)
  if (/\b(?:todo|tbd|placeholder)\b/i.test(value)) issues.push(`${key}: contains unfinished copy`)
}

if (Object.keys(messages).length < 900) issues.push(`catalog: expected at least 900 messages, received ${Object.keys(messages).length}`)
if (issues.length > 0) {
  console.error(issues.join('\n'))
  process.exit(1)
}
console.log(`Content proofread passed: ${Object.keys(messages).length} localized messages.`)
