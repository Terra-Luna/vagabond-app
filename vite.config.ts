import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  return {
    base: "/systems/vagabond-lite/",
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      port: 30001,
      open: "/",
      proxy: {
        "^(?!/systems/vagabond-lite)": "http://localhost:30000/",
        "/socket.io": {
          target: "ws://localhost:30000",
          ws: true,
          changeOrigin: true,
          secure: false
        },
      },
      watch: {
        ignored: [
          "**/src/rules/util/ItemsCache.ts",
        ]
      }
    },
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: false,
      cssCodeSplit: false,
      minify: false,
      lib: {
        name: "vagabond-lite",
        entry: "src/vagabond-lite.tsx",
        formats: ["es"],
        fileName: "vagabond-lite"
      },
      rollupOptions: {
        treeshake: false,
        output: {
          exports: "named"
        }
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      svgr({
        svgrOptions: {
          replaceAttrValues: {
            '#000': 'currentColor',
            '#000000': 'currentColor'
          },
        },
      })
    ],
  }
})
