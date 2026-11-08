import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { StatusImmunityUtil } from "../../../../src/model/actor/util/StatusImmunityUtil"

jest.mock("../../../../src/model/actor/util/StatusEffectUtil", () => ({
  StatusEffectUtil: { isDesignatedUser: () => mockDesignated },
}))
let mockDesignated = true

const effect = (id: string, ...statuses: string[]) => ({
  id,
  statuses: new Set(statuses),
})

const actor = (immunities: string[] | undefined, effects: any[]) => ({
  uuid: "Actor.a",
  system: { modifiers: { damage: { in: { statusImmunities: immunities } } } },
  effects: { contents: effects },
  deleteEmbeddedDocuments: jest.fn(async (..._args: unknown[]) => undefined),
})

describe("StatusImmunityUtil", () => {
  beforeEach(() => {
    mockDesignated = true
  })

  it("finds the status effects the actor is immune to", () => {
    const a = actor(
      ["burning", "prone"],
      [effect("e1", "burning"), effect("e2", "blinded"), effect("e3")],
    )
    expect(StatusImmunityUtil.immuneEffectIds(a)).toEqual(["e1"])
  })

  it("finds nothing for an actor with no immunities", () => {
    expect(
      StatusImmunityUtil.immuneEffectIds(
        actor(undefined, [effect("e", "burning")]),
      ),
    ).toEqual([])
    expect(
      StatusImmunityUtil.immuneEffectIds(actor([], [effect("e", "burning")])),
    ).toEqual([])
  })

  it("removes them from an actor that has just become immune", async () => {
    const a = actor(
      ["burning"],
      [effect("e1", "burning"), effect("e2", "prone")],
    )

    await StatusImmunityUtil.purge(a)

    expect(a.deleteEmbeddedDocuments).toHaveBeenCalledWith("ActiveEffect", [
      "e1",
    ])
  })

  it("leaves the removal to the designated user, and does nothing when there's nothing to remove", async () => {
    mockDesignated = false
    const a = actor(["burning"], [effect("e1", "burning")])
    await StatusImmunityUtil.purge(a)
    expect(a.deleteEmbeddedDocuments).not.toHaveBeenCalled()

    mockDesignated = true
    const clean = actor(["burning"], [effect("e2", "prone")])
    await StatusImmunityUtil.purge(clean)
    expect(clean.deleteEmbeddedDocuments).not.toHaveBeenCalled()
  })
})
