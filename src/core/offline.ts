export function registerOfflineWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    const workerUrl = new URL('sw.js', document.baseURI)
    void navigator.serviceWorker.register(workerUrl, { scope: './' }).catch(() => {
      // Static hosting and private browsing may reject service workers; local saves still work.
    })
  }, { once: true })
}
