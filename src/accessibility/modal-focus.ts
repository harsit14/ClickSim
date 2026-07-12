const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function modalFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => (
    !element.hasAttribute('hidden')
    && element.getAttribute('aria-hidden') !== 'true'
    && element.getClientRects().length > 0
  ))
}

/** Keep keyboard focus inside a surface that declares itself modal. */
export function containModalKeydown(
  event: KeyboardEvent,
  container: HTMLElement,
  onclose: () => void,
): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    onclose()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = modalFocusableElements(container)
  if (focusable.length === 0) {
    event.preventDefault()
    container.focus({ preventScroll: true })
    return
  }

  const first = focusable[0]
  const last = focusable.at(-1)!
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === container || !container.contains(active))) {
    event.preventDefault()
    last.focus({ preventScroll: true })
  } else if (!event.shiftKey && (active === last || !container.contains(active))) {
    event.preventDefault()
    first.focus({ preventScroll: true })
  }
}
