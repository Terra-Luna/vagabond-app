import { defineConfig } from "eslint/config"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import simpleImportSort from "eslint-plugin-simple-import-sort"

export default defineConfig([
    {
        files: ["**/*.ts"],
        ignores: ["./test/**", "jest**"],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "simple-import-sort": simpleImportSort
        },
        rules: {
            "semi": ["error", "never"],
            "simple-import-sort/imports": "error",
            "prefer-const": "error",
            "no-unreachable": "error"
        }
    }
])