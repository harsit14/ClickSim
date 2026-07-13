import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const cacheable = new Set(['.html', '.css', '.js', '.json', '.svg', '.png', '.webp', '.woff2'])

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(path) : [path]
  })
}

const files = filesIn(dist)
  .filter((file) => cacheable.has(extname(file)) && relative(dist, file) !== 'sw.js')
  .map((file) => `./${relative(dist, file).replaceAll('\\', '/')}`)
  .sort()
const fingerprint = files.map((file) => `${file}:${statSync(join(dist, file.slice(2))).size}`).join('|')
let hash = 2166136261
for (const character of fingerprint) {
  hash ^= character.charCodeAt(0)
  hash = Math.imul(hash, 16777619)
}
const cacheName = `ember-static-${(hash >>> 0).toString(36)}`
const source = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(files)};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('ember-static-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put('./index.html', response.clone());
      }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => Response.error())));
});
`
writeFileSync(join(dist, 'sw.js'), source, 'utf8')
console.log(`Offline worker written: ${files.length} precached files in ${cacheName}.`)
