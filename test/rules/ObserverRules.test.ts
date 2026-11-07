import { afterEach, describe, expect, jest, test } from "@jest/globals"

import { ActorBaseDataRulesApplicator } from "../../src/rules/util/ActorBaseDataRulesApplicator"
import { ItemsCache } from "../../src/rules/util/ItemsCache"

describe("observer rule preparation", () => {
  const originalSetProperty = (foundry.utils as any).setProperty

  afterEach(() => {
    ;(foundry.utils as any).setProperty = originalSetProperty
    jest.restoreAllMocks()
  })

  test("computes modifiers and choices without document writes", () => {
    ;(foundry.utils as any).setProperty = (obj, path, value) => {
      const keys = path.split(".")
      const last = keys.pop()
      const parent = keys.reduce((current, key) => current[key], obj)
      parent[last] = value
    }
    jest.spyOn(ItemsCache, "perks").mockReturnValue([])
    const actor = {
      id: "observer-hero",
      isOwner: false,
      visible: true,
      getFlag: jest.fn(),
      setFlag: jest.fn(),
      toggleStatusEffect: jest.fn(),
      createEmbeddedDocuments: jest.fn(),
      items: [],
      effects: [],
      system: {
        level: { current: 1 },
        stats: { might: 2 },
        trained: false,
        getRuleToggleState: () => true,
        getActiveRules: () => [
          {
            key: "FlatModifier",
            selector: ["stats.might"],
            value: 3,
            valueMultiplier: "",
          },
          {
            key: "ChoiceSet",
            channel: "path",
            sourceMode: "static",
            selections: [{ value: "system.trained" }],
          },
          {
            key: "ToggleRule",
            selector: ["flags.test", "statuses.toggles.test"],
            value: true,
          },
          { key: "GrantItem", type: "weapon", uuid: "item" },
          { key: "GrantItem", type: "ActiveEffect", uuid: "effect" },
        ],
      },
    }

    ActorBaseDataRulesApplicator.apply(actor as any)

    expect(actor.system.stats.might).toBe(5)
    expect(actor.system.trained).toBe(true)
    expect(actor.setFlag).not.toHaveBeenCalled()
    expect(actor.toggleStatusEffect).not.toHaveBeenCalled()
    expect(actor.createEmbeddedDocuments).not.toHaveBeenCalled()
  })
})
