import { afterEach, describe, expect, jest, test } from "@jest/globals"

import { ItemsCache } from "../../src/rules/util/ItemsCache"
import { PerkRulesSelectionsApplicator } from "../../src/rules/util/PerkRulesSelectionsApplicator"

describe("hero rule selections", () => {
  const cachedItems = ItemsCache.items
  const actors = game.actors

  afterEach(() => {
    ItemsCache.items = cachedItems
    ;(game as any).actors = actors
    jest.restoreAllMocks()
  })

  test.each([true, false])(
    "derives spell and perk lists for owner=%s without updating observers",
    (isOwner) => {
      ItemsCache.items = new Map([
        [
          "spell-uuid",
          {
            uuid: "spell-uuid",
            name: "Polymorph",
            type: "spell",
            flags: { "vagabond-app": { polymorph: true } },
            system: { toObject: () => ({ description: "spell" }) },
          },
        ],
        [
          "perk-uuid",
          {
            uuid: "perk-uuid",
            name: "Perk",
            type: "perk",
            flags: {},
            system: { toObject: () => ({ rules: [] }) },
          },
        ],
      ])
      const prepareBaseData = jest.fn()
      const actor = {
        isOwner,
        prepareBaseData,
        system: {
          getActiveRules: () => [
            { key: "GrantItem", type: "spell", uuid: "spell-uuid" },
            { key: "GrantItem", type: "perk", uuid: "perk-uuid" },
          ],
        },
      }

      PerkRulesSelectionsApplicator.apply(actor as any)

      expect(actor.system).toMatchObject({
        spells: [{ _sourceId: "spell-uuid", parent: { name: "Polymorph" } }],
        perks: [{ _sourceId: "perk-uuid", parent: { name: "Perk" } }],
      })
      expect(prepareBaseData).toHaveBeenCalledTimes(1)
    },
  )

  test("stamps a ChoiceSet rule's item flags onto the items it selected", () => {
    ItemsCache.items = new Map([
      [
        "spell-uuid",
        {
          uuid: "spell-uuid",
          name: "Fireball",
          type: "spell",
          flags: {},
          system: { toObject: () => ({ description: "spell" }) },
        },
      ],
    ])
    const actor = {
      prepareBaseData: jest.fn(),
      system: {
        getActiveRules: () => [
          {
            key: "ChoiceSet",
            channel: "item",
            selections: [{ id: "s1", value: "spell-uuid", subselect: "" }],
            itemFlags: [
              { key: "naturallyAttuned", value: "true" },
              { key: "modifiers.spell.manaDiscount", value: "-1" },
              { key: "", value: "ignored" },
            ],
          },
        ],
      },
    }

    PerkRulesSelectionsApplicator.apply(actor as any)

    expect(
      (actor.system as any).spells[0].parent.flags["vagabond-app"],
    ).toEqual({
      naturallyAttuned: true,
      modifiers: { spell: { manaDiscount: -1 } },
      sourceId: "spell-uuid",
    })
    expect(ItemsCache.items.get("spell-uuid")?.flags).toEqual({})
  })

  test("refreshes visible observer sheets when cached items change", () => {
    const ownerUpdate = jest.fn()
    const observerPrepare = jest.fn()
    const observerRender = jest.fn()
    const hiddenPrepare = jest.fn()
    ;(game as any).actors = [
      { type: "hero", isOwner: true, system: { forceUpdate: ownerUpdate } },
      {
        type: "hero",
        isOwner: false,
        visible: true,
        prepareData: observerPrepare,
        sheet: { render: observerRender },
      },
      {
        type: "hero",
        isOwner: false,
        visible: false,
        prepareData: hiddenPrepare,
      },
    ]

    ItemsCache.refreshAllActors()

    expect(ownerUpdate).toHaveBeenCalledTimes(1)
    expect(observerPrepare).toHaveBeenCalledTimes(1)
    expect(observerRender).toHaveBeenCalledWith(false)
    expect(hiddenPrepare).not.toHaveBeenCalled()
  })
})
