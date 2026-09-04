import js from "@eslint/js"
import json from "@eslint/json"
import { defineConfig } from "eslint/config"
import pluginReact from "eslint-plugin-react"
import { reactRefresh } from 'eslint-plugin-react-refresh';
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ignores: ["src/macro/*"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "off"
    }
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { "simple-import-sort": simpleImportSort, "unused-imports": unusedImports },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error"
    }
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  pluginReact.configs.flat['jsx-runtime'],
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  reactRefresh.configs.vite()
])
