import { beforeEach, describe, expect, it } from "@jest/globals"

import { AuraAnchorUtil } from "../../../../src/combat/spellcasting/aoe/AuraAnchorUtil"

const token = (actor: any) => ({ actor })
const living = () => ({ system: { health: { value: 3 } }, statuses: new Set() })

const auraArea = (tokenId?: string) =>
  ({
    sceneId: "s1",
    cells: [],
    color: "red",
    follow: { kind: "aura", size: 10, actorId: "caster", tokenId },
  }) as any

describe("AuraAnchorUtil", () => {
  const tokens = new Map<string, any>()

  beforeEach(() => {
    tokens.clear()
    ;(globalThis as any).game = {
      scenes: { get: () => ({ tokens: { get: (id: string) => tokens.get(id) } }) },
    }
  })

  it("treats a missing token as down", () => {
    expect(AuraAnchorUtil.isDown(undefined)).toBe(true)
    expect(AuraAnchorUtil.isDown(token(undefined))).toBe(true)
  })

  it("treats a token at 0 HP or marked dead as down", () => {
    expect(AuraAnchorUtil.isDown(token(living()))).toBe(false)
    expect(
      AuraAnchorUtil.isDown(
        token({ system: { health: { value: 0 } }, statuses: new Set() }),
      ),
    ).toBe(true)
    expect(
      AuraAnchorUtil.isDown(
        token({
          system: { health: { value: 3 } },
          statuses: new Set(["dead"]),
        }),
      ),
    ).toBe(true)
  })

  it("an Aura centered on its caster is never lost", () => {
    expect(AuraAnchorUtil.isLost(auraArea())).toBe(false)
  })

  it("an Aura is lost once its Familiar dies or is removed", () => {
    tokens.set("fam", token(living()))
    expect(AuraAnchorUtil.isLost(auraArea("fam"))).toBe(false)

    tokens.set("fam", token({ ...living(), statuses: new Set(["dead"]) }))
    expect(AuraAnchorUtil.isLost(auraArea("fam"))).toBe(true)

    tokens.delete("fam")
    expect(AuraAnchorUtil.isLost(auraArea("fam"))).toBe(true)
  })
})
