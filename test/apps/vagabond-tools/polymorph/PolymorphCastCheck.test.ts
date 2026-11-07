import { beforeEach, describe, expect, it, jest } from "@jest/globals"

// The check itself pulls in dice and chat code that these tests don't exercise.
const stub = (path: string, exports: Record<string, unknown>) =>
  jest.unstable_mockModule(path, () => exports)
stub("../../../../src/combat/engine/roll/SkillCheck", { SkillCheck: class {} })
stub("../../../../src/view/chat/ChatCardSerializer", {
  sendVagabondChatCard: async () => undefined,
})
stub("../../../../src/model/actor/util/FocusSpellUtil", {
  FocusSpellUtil: {
    hasHostileToken: (ids: string[]) => ids.includes("hostile"),
  },
})
stub("../../../../src/combat/spellcasting/focus-round", {
  currentRoundKey: () => "c:1",
})
stub("../../../../src/util/lang", { appLang: {} })

const { PolymorphCastCheck } =
  await import("../../../../src/apps/vagabond-tools/polymorph/PolymorphCastCheck")

describe("PolymorphCastCheck.isRequired", () => {
  const hero = { id: "h", type: "hero" }

  beforeEach(() => {
    PolymorphCastCheck.isRequired(hero, ["hostile"])
  })

  it("is required when a form is dropped on a hostile token", () => {
    expect(PolymorphCastCheck.isRequired(hero, ["hostile"])).toBe(true)
  })

  it("is not required without hostile targets", () => {
    expect(PolymorphCastCheck.isRequired(hero, ["friend", undefined])).toBe(
      false,
    )
  })

  it("is not required for non-heroes", () => {
    expect(
      PolymorphCastCheck.isRequired({ id: "n", type: "npc" }, ["hostile"]),
    ).toBe(false)
  })

  it("is covered once by a cast that already passed its check", () => {
    PolymorphCastCheck.markPassed("h")

    expect(PolymorphCastCheck.isRequired(hero, ["hostile"])).toBe(false)
    expect(PolymorphCastCheck.isRequired(hero, ["hostile"])).toBe(true)
  })
})
