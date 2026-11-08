import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { FocusSpellUtil } from "../../../../src/model/actor/util/FocusSpellUtil"

// Only the effect-record bookkeeping is under test; what it imports for the rest is stubbed out.
jest.mock(
  "../../../../src/apps/vagabond-tools/usecase/CountdownManager",
  () => ({
    CountdownManager: {},
  }),
)
jest.mock("../../../../src/combat/engine/util/fx-removal", () => ({
  removeFx: async () => undefined,
}))
jest.mock("../../../../src/combat/spellcasting/focus-ownership", () => ({
  isOwnedByFocus: () => true,
}))
jest.mock("../../../../src/model/actor/util/PolymorphUtil", () => ({
  PolymorphUtil: {},
}))
jest.mock("../../../../src/model/actor/util/StatusEffectUtil", () => ({
  StatusEffectUtil: { isDesignatedUser: () => true },
}))

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

describe("FocusSpellUtil.makePermanent", () => {
  beforeEach(() => {
    for (const key of Object.keys(flags)) delete flags[key]
  })

  it("ties the effect to no Focus any more and marks it as permanent", async () => {
    flags.focusedSpellFx = [
      { spell: "s", focusId: "f1", targetUuid: "t1", effect: "charmed" },
      { spell: "s", focusId: "f1", targetUuid: "t2", effect: "charmed" },
    ]

    await FocusSpellUtil.makePermanent(actor, {
      spell: "s",
      targetUuid: "t1",
      effect: "charmed",
    })

    expect(flags.focusedSpellFx).toEqual([
      { spell: "s", focusId: "f1", targetUuid: "t2", effect: "charmed" },
      { spell: "s", targetUuid: "t1", effect: "charmed", permanent: true },
    ])
  })

  it("stops it waiting to wear off when the round ends", async () => {
    flags.focusPendingRelease = [
      {
        combatId: "c",
        round: 1,
        records: [
          { spell: "s", targetUuid: "t1", effect: "confused" },
          { spell: "s", targetUuid: "t2", effect: "confused" },
        ],
      },
    ]

    await FocusSpellUtil.makePermanent(actor, {
      spell: "s",
      targetUuid: "t1",
      effect: "confused",
    })

    expect(flags.focusPendingRelease).toEqual([
      {
        combatId: "c",
        round: 1,
        records: [{ spell: "s", targetUuid: "t2", effect: "confused" }],
      },
    ])
  })

  it("clears a round's pending release once nothing else is waiting in it", async () => {
    flags.focusPendingRelease = [
      {
        combatId: "c",
        round: 1,
        records: [{ spell: "s", targetUuid: "t1", effect: "confused" }],
      },
    ]

    await FocusSpellUtil.makePermanent(actor, {
      spell: "s",
      targetUuid: "t1",
      effect: "confused",
    })

    expect(flags.focusPendingRelease).toBeUndefined()
  })
})
