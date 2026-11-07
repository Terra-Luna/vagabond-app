import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals"

import { FocusManagerApp } from "../../../src/apps/focus-manager/FocusManagerApp"
import { FocusAreaExposure } from "../../../src/combat/spellcasting/FocusAreaExposure"
import { FocusLightExposure } from "../../../src/combat/spellcasting/FocusLightExposure"
import { FocusUpkeep } from "../../../src/combat/spellcasting/FocusUpkeep"
import { FOCUS_FX_FLAG, FOCUS_SPELLS_FLAG, FocusSpellUtil } from "../../../src/model/actor/util/FocusSpellUtil"
import { sys_id } from "../../../src/util/foundry-util"
import { LightSourceUtil } from "../../../src/util/LightSourceUtil"

const originalGame = game
const originalCanvas = Object.getOwnPropertyDescriptor(globalThis, "canvas")
const originalConst = Object.getOwnPropertyDescriptor(globalThis, "CONST")
const originalInfo = Object.getOwnPropertyDescriptor(ui.notifications!, "info")

beforeEach(() => {
  Object.defineProperty(ui.notifications!, "info", {
    configurable: true,
    value: jest.fn(),
  })
})

afterEach(async () => {
  await FocusUpkeep.evaluateExposures(undefined, true)
  jest.restoreAllMocks()
  if (originalInfo)
    Object.defineProperty(ui.notifications!, "info", originalInfo)
  else Reflect.deleteProperty(ui.notifications!, "info")
  Object.defineProperty(globalThis, "game", {
    configurable: true,
    writable: true,
    value: originalGame,
  })
  if (originalCanvas)
    Object.defineProperty(globalThis, "canvas", originalCanvas)
  else Reflect.deleteProperty(globalThis, "canvas")
  if (originalConst) Object.defineProperty(globalThis, "CONST", originalConst)
  else Reflect.deleteProperty(globalThis, "CONST")
})

const createWorld = (
  instances: any[],
  records: any[] = [],
  inCombat = true,
) => {
  const flags = { [FOCUS_SPELLS_FLAG]: instances, [FOCUS_FX_FLAG]: records }
  const hero: any = {
    id: `hero-${instances[0].id}`,
    name: "Caster",
    type: "hero",
    isOwner: true,
    system: {},
    getFlag: (_scope, key) => flags[key],
    setFlag: async (_scope, key, value) => {
      flags[key] = value
      ;(FocusManagerApp as any).onUpdateActor(hero, {
        flags: { [sys_id]: { [key]: value } },
      })
    },
  }
  const combat: any = {
    id: "new-combat",
    round: 1,
    started: true,
    combatant: null,
    combatants: inCombat ? [{ actor: hero }] : [],
  }
  Object.defineProperty(globalThis, "game", {
    configurable: true,
    writable: true,
    value: {
      ...originalGame,
      user: { isActiveGM: true, isGM: false },
      combat,
      actors: { contents: [hero] },
    },
  })
  Object.defineProperty(globalThis, "canvas", {
    configurable: true,
    value: { ready: true },
  })
  return { hero, combat }
}

describe("Focus at combat start", () => {
  test("acquires a hostile already inside a focused area and prompts its caster", async () => {
    const instance = {
      id: "real-area-start",
      spell: "spell",
      delivery: {
        name: "Sphere",
        area: { sceneId: "scene", cells: [{ x: 50, y: 50 }] },
        spell: { damageType: "none" },
      },
      targetIds: [],
    }
    const { hero, combat } = createWorld([instance], [], false)
    const token = {
      id: "hostile",
      document: {
        id: "hostile",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        disposition: -1,
        actor: { type: "adversary" },
      },
    }
    Object.defineProperty(globalThis, "CONST", {
      configurable: true,
      value: { TOKEN_DISPOSITIONS: { HOSTILE: -1, FRIENDLY: 1, NEUTRAL: 0 } },
    })
    Object.defineProperty(globalThis, "canvas", {
      configurable: true,
      value: {
        ready: true,
        scene: { id: "scene", tokens: { get: () => undefined } },
        grid: { size: 100 },
        tokens: { placeables: [token], get: () => undefined },
      },
    })
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {})

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    const updated = FocusSpellUtil.find(hero, instance.id)!
    expect(updated.targetIds).toEqual(["hostile"])
    expect(updated.fxPendingIds).toEqual(["hostile"])
    expect(FocusUpkeep.needsCheck(hero, updated)).toBe(true)
    expect(FocusUpkeep.unresolvedInstances(hero)).toHaveLength(1)
    expect(open).toHaveBeenCalledWith(hero, 1)
  })

  test("refreshes areas before exposure evaluation and prompts a caster", async () => {
    const hostile = { id: "hostile", document: { id: "hostile" } }
    const instance = {
      id: "area-start",
      spell: "spell",
      delivery: {
        area: { cells: [{ x: 0, y: 0 }] },
        spell: { damageType: "none" },
      },
      targetIds: ["hostile"],
    }
    const { hero, combat } = createWorld([instance])
    const order: string[] = []
    jest.spyOn(FocusAreaExposure, "hostilesIn").mockReturnValue([hostile])
    jest
      .spyOn(FocusAreaExposure, "refresh")
      .mockImplementation(async (actor, it) => {
        order.push("refresh")
        await FocusSpellUtil.update(actor, it.id, {
          litKey: "new-combat:1",
          litIds: ["hostile"],
        })
      })
    jest.spyOn(FocusLightExposure, "isLightBurn").mockImplementation(() => {
      order.push("exposure")
      return false
    })
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {
        order.push("open")
      })

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    expect(FocusUpkeep.unresolvedInstances(hero)).toHaveLength(1)
    expect(open).toHaveBeenCalledWith(hero, 1)
    expect(order.indexOf("refresh")).toBeLessThan(order.indexOf("exposure"))
  })

  test("movement evaluations wait for the round-start area refresh", async () => {
    const instance = {
      id: "queued-area-start",
      spell: "spell",
      delivery: {
        area: { cells: [{ x: 0, y: 0 }] },
        spell: { damageType: "none" },
      },
    }
    const { combat } = createWorld([instance], [], false)
    let finishRefresh!: () => void
    let reportStarted!: () => void
    const started = new Promise<void>((resolve) => {
      reportStarted = resolve
    })
    const blocked = new Promise<void>((resolve) => {
      finishRefresh = resolve
    })
    jest.spyOn(FocusAreaExposure, "refresh").mockImplementation(async () => {
      reportStarted()
      await blocked
    })
    jest.spyOn(FocusAreaExposure, "hostilesIn").mockReturnValue([])
    const evaluate = jest
      .spyOn(FocusLightExposure, "isLightBurn")
      .mockReturnValue(false)

    const round = (FocusManagerApp as any).onUpdateCombat(combat, { round: 1 })
    await started
    const movement = FocusUpkeep.evaluateExposures()
    await Promise.resolve()
    expect(evaluate).not.toHaveBeenCalled()
    finishRefresh()
    await Promise.all([round, movement])
    expect(evaluate).toHaveBeenCalled()
  })

  test("a harmful light with an existing hostile prompts even when its caster is not a combatant", async () => {
    const hostile = { id: "hostile" }
    const instance = {
      id: "light-start",
      spell: "light",
      round: 1,
      combatId: "old-combat",
      delivery: { spell: { damageType: "none" } },
      targetIds: ["emitter"],
    }
    const { hero, combat } = createWorld(
      [instance],
      [{ focusId: instance.id, effect: "light:sunlight:30:undead" }],
      false,
    )
    jest.spyOn(LightSourceUtil, "harmedHostiles").mockReturnValue([hostile])
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {})

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    expect(
      FocusLightExposure.isExposed(
        hero,
        FocusSpellUtil.find(hero, instance.id)!,
      ),
    ).toBe(true)
    expect(FocusUpkeep.unresolvedInstances(hero)).toHaveLength(1)
    expect(open).toHaveBeenCalledWith(hero, 1)
  })

  test("the owning player is prompted when the active GM publishes exposure", async () => {
    const instance = {
      id: "player-light-start",
      spell: "light",
      delivery: { spell: { damageType: "none" } },
      targetIds: ["emitter"],
    }
    const { hero, combat } = createWorld(
      [instance],
      [{ focusId: instance.id, effect: "light:sunlight:30:undead" }],
      false,
    )
    const state = game as any
    state.user = { isActiveGM: true, isGM: true }
    state.users = { contents: [{ isGM: false, active: true }] }
    hero.testUserPermission = () => true
    jest
      .spyOn(LightSourceUtil, "harmedHostiles")
      .mockReturnValue([{ id: "hostile" }])
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {})

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    expect(open).not.toHaveBeenCalled()
    state.user = { isActiveGM: false, isGM: false }
    ;(FocusManagerApp as any).onUpdateActor(hero, {
      flags: {
        [sys_id]: { [FOCUS_SPELLS_FLAG]: FocusSpellUtil.instances(hero) },
      },
    })
    expect(open).toHaveBeenCalledWith(hero, 1)
  })

  test("no affected hostiles means no check or prompt", async () => {
    const instance = {
      id: "empty-start",
      spell: "light",
      delivery: { spell: { damageType: "none" } },
      targetIds: ["emitter"],
    }
    const { hero, combat } = createWorld(
      [instance],
      [{ focusId: instance.id, effect: "light:sunlight:30:undead" }],
    )
    jest.spyOn(LightSourceUtil, "harmedHostiles").mockReturnValue([])
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {})

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    expect(FocusUpkeep.unresolvedInstances(hero)).toHaveLength(0)
    expect(open).not.toHaveBeenCalled()
  })

  test("a cast in this combat and round does not immediately owe a second check", async () => {
    const instance = {
      id: "same-round",
      spell: "light",
      round: 1,
      combatId: "new-combat",
      delivery: { spell: { damageType: "none" } },
      targetIds: ["emitter"],
    }
    const { hero, combat } = createWorld(
      [instance],
      [{ focusId: instance.id, effect: "light:sunlight:30:undead" }],
    )
    jest
      .spyOn(LightSourceUtil, "harmedHostiles")
      .mockReturnValue([{ id: "hostile" }])
    const open = jest
      .spyOn(FocusManagerApp as any, "open")
      .mockImplementation(() => {})

    await (FocusManagerApp as any).onUpdateCombat(combat, {
      round: 1,
      turn: null,
    })
    expect(FocusUpkeep.unresolvedInstances(hero)).toHaveLength(0)
    expect(open).not.toHaveBeenCalled()
  })
})
