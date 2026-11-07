import { describe, expect, it, jest } from "@jest/globals"

import { TemporaryArea } from "../../../../src/combat/spellcasting/aoe/TemporaryArea"

const sceneWith = (areas: Record<string, unknown>) => ({
  getFlag: jest.fn(() => areas),
  unsetFlag: jest.fn(async () => undefined),
})

const setGame = (isActiveGM: boolean, scenes: any[]) => {
  ;(globalThis as any).game = {
    user: { isActiveGM },
    scenes: Object.assign(scenes, {
      get: (id: string) => scenes.find((s) => s.id === id),
    }),
  }
}

describe("TemporaryArea.remove", () => {
  it("drops only the given cast's area", async () => {
    const scene = { ...sceneWith({ abc: {} }), id: "s1" }
    setGame(true, [scene])

    await TemporaryArea.remove("s1", "abc")
    await TemporaryArea.remove("s1", "other")

    expect(scene.unsetFlag).toHaveBeenCalledTimes(1)
    expect(scene.unsetFlag).toHaveBeenCalledWith(
      "vagabond-app",
      "temporarySpellAreas.abc",
    )
  })

  it("relays the request to the GM when a player removes", async () => {
    const emit = jest.fn()
    const scene = { ...sceneWith({ abc: {} }), id: "s1" }
    setGame(false, [scene])
    ;(globalThis as any).game.socket = { emit }

    await TemporaryArea.remove("s1", "abc")

    expect(scene.unsetFlag).not.toHaveBeenCalled()
    expect(emit).toHaveBeenCalledWith("system.vagabond-app", {
      action: "removeTemporarySpellArea",
      sceneId: "s1",
      attackId: "abc",
    })
  })
})

describe("TemporaryArea.clearAll", () => {
  it("clears every scene that has temporary areas, whatever scene the combat is on", async () => {
    const withAreas = sceneWith({ abc: {} })
    const empty = sceneWith({})
    setGame(true, [withAreas, empty])

    await TemporaryArea.clearAll()

    expect(withAreas.unsetFlag).toHaveBeenCalledWith(
      "vagabond-app",
      "temporarySpellAreas",
    )
    expect(empty.unsetFlag).not.toHaveBeenCalled()
  })

  it("leaves clearing to the active GM", async () => {
    const scene = sceneWith({ abc: {} })
    setGame(false, [scene])

    await TemporaryArea.clearAll()

    expect(scene.unsetFlag).not.toHaveBeenCalled()
  })
})
