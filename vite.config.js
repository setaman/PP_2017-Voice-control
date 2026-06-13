import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    proxy: {
      '/audio': 'http://localhost:3001'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'fix-clj-fuzzy-this',
          setup(build) {
            build.onLoad({ filter: /clj-fuzzy/ }, (args) => {
              let contents = readFileSync(args.path, 'utf8')
              contents = contents.replace('ba=this', 'ba=globalThis')
              return { contents, loader: 'js' }
            })
          }
        }
      ]
    }
  }
})
