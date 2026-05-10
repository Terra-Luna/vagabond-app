import type { Config } from 'jest'
import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset({
  //...options
})

export default {
  ...presetConfig,
  globalSetup: './test/setup-tests.js'
} satisfies Config