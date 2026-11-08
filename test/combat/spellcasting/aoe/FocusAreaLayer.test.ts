import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { FocusAreaLayer } from "../../../../src/combat/spellcasting/aoe/FocusAreaLayer"

// The layer's drawing dependencies pull in the whole Foundry/React stack, none of which these tests exercise.
jest.mock("../../../../src/apps/focus-manager/focus-hook-rules", () => ({
  isMovement: () => false,
}))
jest.mock("../../../../src/model/actor/util/FocusSpellUtil", () => ({
  FocusSpellUtil: {},
}))
jest.mock("../../../../src/util/LightSourceUtil", () => ({
  LightSourceUtil: {},
}))
jest.mock("../../../../src/combat/spellcasting/aoe/AreaOutline", () => ({
  AreaOutline: {},
}))
jest.mock("../../../../src/combat/spellcasting/aoe/PlacedAreaCells", () => ({
  PlacedAreaCells: {},
}))

describe("FocusAreaLayer temporary areas", () => {
  const handlers = new Map<string, (...args: any[]) => any>()
  const scene = {
    getFlag: jest.fn(() => ({ abc: {} })),
    unsetFlag: jest.fn(async (..._args: unknown[]) => undefined),
  }

  beforeEach(() => {
    handlers.clear()
    scene.unsetFlag.mockClear()
    ;(globalThis as any).Hooks = {
      on: (name: string, fn: (...args: any[]) => any) => handlers.set(name, fn),
    }
    ;(globalThis as any).game = { user: { isActiveGM: true }, scenes: [scene] }
    new FocusAreaLayer().registerHooks()
  })

  it("clears them when a round starts", () => {
    handlers.get("updateCombat")?.({}, { round: 2 })
    expect(scene.unsetFlag).toHaveBeenCalledTimes(1)
  })

  it("keeps them while the round is unchanged", () => {
    handlers.get("updateCombat")?.({}, { turn: 1 })
    expect(scene.unsetFlag).not.toHaveBeenCalled()
  })

  it("clears them when combat ends", () => {
    handlers.get("deleteCombat")?.({})
    expect(scene.unsetFlag).toHaveBeenCalledTimes(1)
  })
})
