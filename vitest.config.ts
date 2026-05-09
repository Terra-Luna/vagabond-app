/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Specify your test options here
        globals: true,
        environment: 'node', // Use 'jsdom' if testing browser components
    },
})