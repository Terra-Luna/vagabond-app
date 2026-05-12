import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/systems/vagabond-lite/",
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
    }
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      name: "vagabond-lite",
      entry: "src/vagabond-lite.tsx",
      formats: ["es"],
      fileName: "vagabond-lite"
    }
  },
  plugins: [react()],
})