import { defineConfig } from "eslint/config"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

export default defineConfig([
    {
        files: ["**/*.ts"],
        ignores: ["./test/**", "jest**"],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            "semi": "error",
            "prefer-const": "error",
            "no-unreachable": "error"
        }
    }
])