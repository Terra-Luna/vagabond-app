import type { Config } from 'jest'
import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset({
  //...options
})

export default {
  ...presetConfig,
  setupFiles: ["./test/globals.js"],
  moduleNameMapper: {
    '^.+\\.css\\?inline$': '<rootDir>/test/__mocks__/styleMock.js',
    '^.+\\.css$': '<rootDir>/test/__mocks__/styleMock.js',
    '^.+\\.svg\\?react$': '<rootDir>/test/__mocks__/svgMock.tsx',
    '^.+\\.svg$': '<rootDir>/test/__mocks__/svgMock.tsx'
  }
} satisfies Config