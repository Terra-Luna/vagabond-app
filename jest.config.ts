import type { Config } from 'jest'
import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset({
  diagnostics: {
    ignoreCodes: [1343]
  }
})

export default {
  ...presetConfig,
  setupFiles: ["./test/globals.js"],
  moduleNameMapper: {
    '^.+\\.css\\?inline$': '<rootDir>/test/__mocks__/styleMock.js',
    '^.+\\.css$': '<rootDir>/test/__mocks__/styleMock.js',
    '^.+styleUtils$': '<rootDir>/test/__mocks__/styleUtils.js',
    '^.+\\.svg\\?react$': '<rootDir>/test/__mocks__/svgMock.tsx',
    '^.+\\.svg$': '<rootDir>/test/__mocks__/svgMock.tsx'
  }
} satisfies Config