import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 собирает один HTML-файл (для публикации как артефакт)
const single = process.env.SINGLE === '1'
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
  build: { assetsInlineLimit: single ? 100_000_000 : 4096, chunkSizeWarningLimit: 2500 },
})
