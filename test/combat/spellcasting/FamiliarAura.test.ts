import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { FamiliarAura } from "../../../src/combat/spellcasting/FamiliarAura"

const mockDrop = jest.fn(async (..._args: unknown[]) => undefined)
const mockRemove = jest.fn(async (..._args: unknown[]) => undefined)
let mockInstances: any[] = []
let mockTemporary: Record<string, any> = {}

// Only the Focus and area bookkeeping matter here; the rest of the Foundry/React stack is stubbed out.
jest.mock("../../../src/model/actor/util/FocusSpellUtil", () => ({
  FocusSpellUtil: {
    instances: () => mockInstances,
    drop: (...args: unknown[]) => mockDrop(...args),
  },
}))
jest.mock("../../../src/combat/spellcasting/aoe/TemporaryArea", () => ({
  TemporaryArea: {
    of: () => mockTemporary,
    remove: (...args: unknown[]) => mockRemove(...args),
  },
}))

const hero = { id: "hero", type: "hero" }
const living = () => ({ actor: { system: { health: { value: 3 } }, statuses: new Set() } })
const dead = () => ({
  actor: { system: { health: { value: 0 } }, statuses: new Set(["dead"]) },
})

const instance = (tokenId?: string) => ({
  id: "focus-1",
  spell: "spell",
  delivery: {
    area: {
      sceneId: "s1",
      follow: { kind: "aura", size: 10, actorId: "hero", tokenId },
    },
  },
})

describe("FamiliarAura", () => {
  let tokens: Map<string, any>

  beforeEach(() => {
    mockDrop.mockClear()
    mockRemove.mockClear()
    mockInstances = []
    mockTemporary = {}
    tokens = new Map()
    const scenes: any = [{ id: "s1", tokens: { get: (id: string) => tokens.get(id) } }]
    scenes.get = () => scenes[0]
    ;(globalThis as any).game = {
      user: { isActiveGM: true },
      actors: { contents: [hero] },
      scenes,
    }
    ;(globalThis as any).Hooks = { on: () => 0 }
  })

  it("drops the Focus on an Aura whose Familiar has died, deferring its effects", async () => {
    tokens.set("fam", dead())
    mockInstances = [instance("fam")]
    await FamiliarAura.sweep()
    // Not immediate; forced to defer so the effects last until the next round starts when in combat.
    expect(mockDrop).toHaveBeenCalledWith(hero, "focus-1", false, false, true)
  })

  it("drops the Focus when the Familiar's token is deleted", async () => {
    tokens.set("fam", living())
    mockInstances = [instance("fam")]
    await FamiliarAura.sweep("fam")
    expect(mockDrop).toHaveBeenCalledTimes(1)
  })

  it("keeps the Focus while the Familiar lives", async () => {
    tokens.set("fam", living())
    mockInstances = [instance("fam")]
    await FamiliarAura.sweep()
    expect(mockDrop).not.toHaveBeenCalled()
  })

  it("leaves an Aura centered on its caster alone", async () => {
    mockInstances = [instance()]
    await FamiliarAura.sweep()
    expect(mockDrop).not.toHaveBeenCalled()
  })

  it("ends the area of an unfocused Aura whose Familiar died", async () => {
    tokens.set("fam", dead())
    mockTemporary = { atk1: { anchorTokenId: "fam" }, atk2: {} }
    await FamiliarAura.sweep()
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockRemove).toHaveBeenCalledWith("s1", "atk1")
  })

  it("only the active GM acts", async () => {
    ;(globalThis as any).game.user.isActiveGM = false
    tokens.set("fam", dead())
    mockInstances = [instance("fam")]
    await FamiliarAura.sweep()
    expect(mockDrop).not.toHaveBeenCalled()
  })
})
