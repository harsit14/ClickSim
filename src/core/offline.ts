export function registerOfflineWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    const replacingExistingWorker = navigator.serviceWorker.controller !== null
    let refreshingForUpdate = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!replacingExistingWorker || refreshingForUpdate) return
      refreshingForUpdate = true
      window.location.reload()
    })

    const workerUrl = new URL('sw.js', document.baseURI)
    void navigator.serviceWorker.register(workerUrl, {
      scope: './',
      updateViaCache: 'none',
    }).then((registration) => registration.update()).catch(() => {
      // Static hosting and private browsing may reject service workers; local saves still work.
    })
  }, { once: true })
}
