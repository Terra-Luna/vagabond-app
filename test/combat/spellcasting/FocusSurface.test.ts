import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { FocusSurface } from "../../../src/combat/spellcasting/FocusSurface"

const mockDealSurface = jest.fn(async (..._args: unknown[]) => undefined)
const mockUpdate = jest.fn(async (..._args: unknown[]) => undefined)
let mockInside: { document: { id: string; actorId: string } }[] = []
let mockExposed = false
let mockInstances: any[] = []

// The surface rules only need these collaborators; the rest of the Foundry/React stack is stubbed out.
// Each stub reads the test state lazily, because the mocks are installed before this file's variables exist.
jest.mock("../../../src/combat/engine/HeroAttack", () => ({
  HeroAttack: { dealSurface: (...args: unknown[]) => mockDealSurface(...args) },
}))
jest.mock("../../../src/combat/spellcasting/focus-round", () => ({
  currentRoundKey: () => "c:2",
}))
jest.mock("../../../src/combat/spellcasting/FocusAreaExposure", () => ({
  FocusAreaExposure: {
    hasArea: () => true,
    autoPref: () => undefined,
    targetsIn: () => mockInside,
    occupantsOf: () => mockInside,
    isExposed: () => mockExposed,
  },
}))
jest.mock("../../../src/model/actor/util/FocusSpellUtil", () => ({
  FocusSpellUtil: {
    update: (...args: unknown[]) => mockUpdate(...args),
    instances: () => mockInstances,
  },
}))

const dealSurface = mockDealSurface
const update = mockUpdate

const token = (id: string, actorId = id) => ({ document: { id, actorId } })

const surfaceInstance = (patch: Record<string, unknown> = {}) => ({
  id: "f1",
  spell: "spell",
  combatId: "c",
  round: 1,
  delivery: {
    spell: { surface: { enabled: true } },
    area: {},
  },
  surfaceKey: "c:2",
  surfaceIds: ["a"],
  ...patch,
})

describe("FocusSurface", () => {
  beforeEach(() => {
    dealSurface.mockClear()
    update.mockClear()
    mockInside = [token("a"), token("b")]
    mockExposed = false
    mockInstances = []
    ;(globalThis as any).game = {
      combat: { id: "c", started: true, round: 2 },
      user: { isActiveGM: true },
      actors: { contents: [] },
    }
    ;(globalThis as any).canvas = { ready: true }
  })

  it("is only active for a surface spell with an area", () => {
    expect(FocusSurface.isActive(surfaceInstance() as any)).toBe(true)
    expect(
      FocusSurface.isActive({
        ...surfaceInstance(),
        delivery: { spell: {}, area: {} },
      } as any),
    ).toBe(false)
  })

  it("never hits the caster of an area that follows them", () => {
    mockInside = [token("a", "caster"), token("b", "other")]
    const ids = FocusSurface.tokensIn({
      delivery: { area: { follow: { actorId: "caster" } } },
    } as any)
    expect(ids).toEqual(["b"])
  })

  it("an arrival takes On Enter straight away when no check is owed", async () => {
    await FocusSurface.onMove({}, surfaceInstance() as any)

    expect(dealSurface).toHaveBeenCalledWith(
      {},
      expect.anything(),
      "onEnter",
      ["b"],
      "f1",
    )
    expect(update).toHaveBeenCalledWith({}, "f1", { surfaceIds: ["a", "b"] })
  })

  it("an arrival waits for the Focus check when one is owed", async () => {
    mockExposed = true

    await FocusSurface.onMove(
      {},
      surfaceInstance({ round: 1, paidKey: undefined }) as any,
    )
    expect(dealSurface).not.toHaveBeenCalled()
    expect(update).toHaveBeenLastCalledWith({}, "f1", {
      surfaceIds: ["a", "b"],
      surfacePendingIds: ["b"],
    })
  })

  it("a spell cast this round is settled, so its arrivals aren't made to wait", async () => {
    mockExposed = true
    await FocusSurface.onMove({}, surfaceInstance({ round: 2 }) as any)
    expect(dealSurface).toHaveBeenCalledTimes(1)
  })

  it("an arrival isn't made to wait once the check has been paid", async () => {
    mockExposed = true

    await FocusSurface.onMove({}, surfaceInstance({ paidKey: "c:2" }) as any)

    expect(dealSurface).toHaveBeenCalledTimes(1)
  })

  it("the same token entering twice in a round is hit once", async () => {
    await FocusSurface.onMove(
      {},
      surfaceInstance({ surfaceIds: ["a", "b"] }) as any,
    )
    expect(dealSurface).not.toHaveBeenCalled()
  })

  it("a stale round only records who is inside, without dealing damage", async () => {
    await FocusSurface.onMove({}, surfaceInstance({ surfaceKey: "c:1" }) as any)

    expect(dealSurface).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith({}, "f1", {
      surfaceKey: "c:2",
      surfaceIds: ["a", "b"],
    })
  })

  it("pending newcomers take On Enter once the check is passed", async () => {
    await FocusSurface.applyPending(
      {},
      surfaceInstance({ surfacePendingIds: ["b"] }) as any,
    )
    expect(dealSurface).toHaveBeenCalledWith(
      {},
      expect.anything(),
      "onEnter",
      ["b"],
      "f1",
    )
  })

  it("everyone still inside takes On Stay when a round starts, whatever upkeep says", async () => {
    const hero = { type: "hero" }
    mockInstances = [surfaceInstance({ surfaceKey: "c:1", surfaceIds: ["z"] })]
    ;(globalThis as any).game.actors.contents = [hero]
    mockExposed = true

    await FocusSurface.startOfRound()

    expect(dealSurface).toHaveBeenCalledWith(
      hero,
      expect.anything(),
      "onStay",
      ["a", "b"],
      "f1",
    )
    expect(update).toHaveBeenCalledWith(hero, "f1", {
      surfaceKey: "c:2",
      surfaceIds: ["a", "b"],
      surfacePendingIds: undefined,
    })
  })
})
