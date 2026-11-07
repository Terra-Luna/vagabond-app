import { beforeEach, describe, expect, it, jest } from "@jest/globals"

// The layer's drawing dependencies pull in the whole Foundry/React stack, none of which these tests exercise.
const stub = (path: string, exports: Record<string, unknown>) =>
  jest.unstable_mockModule(path, () => exports)
stub("../../../../src/apps/focus-manager/focus-hook-rules", {
  isMovement: () => false,
})
stub("../../../../src/model/actor/util/FocusSpellUtil", { FocusSpellUtil: {} })
stub("../../../../src/util/LightSourceUtil", { LightSourceUtil: {} })
stub("../../../../src/combat/spellcasting/aoe/AreaOutline", { AreaOutline: {} })
stub("../../../../src/combat/spellcasting/aoe/PlacedAreaCells", {
  PlacedAreaCells: {},
})

const { FocusAreaLayer } =
  await import("../../../../src/combat/spellcasting/aoe/FocusAreaLayer")

describe("FocusAreaLayer temporary areas", () => {
  const handlers = new Map<string, (...args: any[]) => any>()
  const scene = {
    getFlag: jest.fn(() => ({ abc: {} })),
    unsetFlag: jest.fn(async () => undefined),
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
