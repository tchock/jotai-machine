import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: {
        'jotai-machine': resolve(__dirname, 'src/index.ts'),
      },
      name: 'jotai-machine',
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          rect: 'react',
        },
      },
    },
  },
})
