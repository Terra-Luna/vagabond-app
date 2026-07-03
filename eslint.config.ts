import js from "@eslint/js"
import json from "@eslint/json"
import { defineConfig } from "eslint/config"
import pluginReact from "eslint-plugin-react"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, simpleImportSort },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "warn"
    }
  },
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    }
  },
  pluginReact.configs.flat['jsx-runtime'],
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
])
