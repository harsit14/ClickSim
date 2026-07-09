const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

export function format(n: number): string {
  if (!isFinite(n)) return '∞'
  if (n < 0) return '-' + format(-n)
  if (n >= 1e36) return n.toExponential(2).replace('e+', 'e')
  if (n < 1000) {
    if (Number.isInteger(n)) return n.toString()
    return n < 10 ? n.toFixed(1) : Math.floor(n).toString()
  }
  let tier = 0
  while (n >= 1000 && tier < SUFFIXES.length - 1) {
    n /= 1000
    tier++
  }
  const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2
  return n.toFixed(digits) + SUFFIXES[tier]
}
