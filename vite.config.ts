import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor'
          if (id.includes('/src/endgame/') || id.endsWith('/src/ui/EndgameHub.svelte')) return 'endgame'
          if (/\/src\/content\/universes\/(?:brahmalok|vishnulok|kailash|future-pack|f4-runtime)/.test(id)) return 'expansion'
          return undefined
        },
      },
    },
  },
})
