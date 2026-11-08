import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { PlacedGlyph } from "../../../../src/combat/spellcasting/aoe/PlacedGlyph"

const flags: Record<string, unknown> = {}
const actor = {
  getFlag: (_scope: string, key: string) => flags[key],
  setFlag: jest.fn(async (_scope: string, key: string, value: unknown) => {
    flags[key] = value
  }),
  unsetFlag: jest.fn(async (_scope: string, key: string) => {
    delete flags[key]
  }),
}

const spell: any = { uuid: "s", name: "Zap", damageType: "shock" }

describe("PlacedGlyph", () => {
  const listeners: ((id: string | undefined) => void)[] = []

  beforeEach(() => {
    for (const key of Object.keys(flags)) delete flags[key]
    listeners.length = 0
    PlacedGlyph.select(undefined)
    ;(globalThis as any).Hooks = {
      on: (_name: string, fn: any) => listeners.push(fn),
      off: jest.fn(),
      callAll: (_name: string, id: string | undefined) =>
        listeners.forEach((fn) => fn(id)),
    }
    ;(globalThis as any).canvas = { scene: { id: "here" } }
    // The shared test stand-in returns one id for everything; Glyphs need distinct ones.
    let counter = 0
    ;(globalThis as any).foundry.utils.randomID = () => `glyph-${++counter}`
  })

  it("keeps Glyphs on the actor and tells them apart by scene", async () => {
    await PlacedGlyph.add(actor, {
      sceneId: "here",
      cell: { x: 1, y: 1 },
      spell,
      skill: "arcana",
    })
    await PlacedGlyph.add(actor, {
      sceneId: "elsewhere",
      cell: { x: 2, y: 2 },
      spell,
      skill: "arcana",
    })

    expect(PlacedGlyph.of(actor)).toHaveLength(2)
    expect(PlacedGlyph.onScene(actor).map((g) => g.cell)).toEqual([
      { x: 1, y: 1 },
    ])
  })

  it("removes one Glyph, clearing the flag when none are left", async () => {
    await PlacedGlyph.add(actor, {
      sceneId: "here",
      cell: { x: 1, y: 1 },
      spell,
      skill: "a",
    })
    await PlacedGlyph.add(actor, {
      sceneId: "here",
      cell: { x: 2, y: 2 },
      spell,
      skill: "a",
    })
    const [first] = PlacedGlyph.of(actor)

    await PlacedGlyph.remove(actor, first.id)
    expect(PlacedGlyph.of(actor)).toHaveLength(1)

    await PlacedGlyph.remove(actor, PlacedGlyph.of(actor)[0].id)
    expect(actor.unsetFlag).toHaveBeenCalled()
    expect(PlacedGlyph.of(actor)).toEqual([])
  })

  it("announces which Glyph is highlighted, and drops the highlight of a removed one", async () => {
    const seen: (string | undefined)[] = []
    PlacedGlyph.onSelect((id) => seen.push(id))
    await PlacedGlyph.add(actor, {
      sceneId: "here",
      cell: { x: 1, y: 1 },
      spell,
      skill: "a",
    })
    const [glyph] = PlacedGlyph.of(actor)

    PlacedGlyph.select(glyph.id)
    PlacedGlyph.select(glyph.id)
    expect(PlacedGlyph.selected).toBe(glyph.id)

    await PlacedGlyph.remove(actor, glyph.id)
    expect(PlacedGlyph.selected).toBeUndefined()
    expect(seen).toEqual([glyph.id, undefined])
  })
})
