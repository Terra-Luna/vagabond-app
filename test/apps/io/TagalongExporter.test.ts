import { describe, expect, jest, test } from "@jest/globals"

import { TagalongExporter } from "../../../src/apps/io/TagalongExporter"
import type { HeroDataModel } from "../../../src/model/actor/HeroDataModel"

const createHero = (overrides: Record<string, unknown> = {}) =>
  ({
    tagalongId: "tagalong-hero-id",
    parent: {
      id: "actor-id",
      name: "Test Hero",
      items: [
        { type: "ancestry", name: "Elf" },
        { type: "class", name: "Mage" },
      ],
    },
    level: { current: 3, xp: 120 },
    stats: {
      might: 2,
      dexterity: 3,
      awareness: 4,
      reason: 5,
      presence: 6,
      luck: 2,
    },
    skills: {
      arcana: { trained: true },
      brawl: { trained: false },
      medicine: { trained: true },
    },
    spells: [{ parent: { name: "Spark" } }],
    perks: [
      { _sourceId: "perk-id", parent: { id: "perk-item", name: "Focus" } },
    ],
    health: { value: 8 },
    mana: { value: 4 },
    statuses: { counters: { fatigue: 1, luck: 2, studied: 3 } },
    inventory: {
      coins: { g: 2, s: 3, c: 4 },
      items: [],
    },
    ...overrides,
  }) as unknown as HeroDataModel

describe("TagalongExporter", () => {
  test("builds a Tagalong character from the hero model", () => {
    const result = TagalongExporter.buildTagalongHero(createHero())

    expect(result.character).toMatchObject({
      id: "tagalong-hero-id",
      userId: "",
      name: "Test Hero",
      ancestry: "Elf",
      class: "Mage",
      level: 3,
      xp: 120,
      assignedStats: {
        might: 2,
        dexterity: 3,
        awareness: 4,
        reason: 5,
        presence: 6,
        luck: 2,
      },
      levelStats: {
        might: 0,
        dexterity: 0,
        awareness: 0,
        reason: 0,
        presence: 0,
        luck: 0,
      },
      advancementStats: {
        might: 0,
        dexterity: 0,
        awareness: 0,
        reason: 0,
        presence: 0,
        luck: 0,
      },
      trained_skills: ["arcana", "medicine"],
      known_spells: ["Spark"],
      selected_perks: [{ source: "manual", id: "perk-id", name: "Focus" }],
      current_hp: 8,
      current_mana: 4,
      fatigue: 1,
      current_luck: 2,
      studied_dice: 3,
      current_wealth: { g: 2, s: 3, c: 4 },
      inventory: [],
    })
  })

  test("maps inventory items to the Tagalong item format", () => {
    const item = {
      id: "sword-id",
      name: "Iron Sword",
      type: "weapon",
      system: {
        displayName: "Iron Sword",
        description: "A sturdy blade.",
        category: "weapons",
        bulk: { quantity: 1, slots: 2, totalSlots: 2 },
        value: { g: 1, s: 2, c: 3 },
        isEquippable: true,
        isEquipped: true,
        relicPowers: [{ id: "keen" }],
        damage: { dice: { faces: 6, modifier: 2 } },
        range: "melee",
        grip: { style: "H", state: "HH" },
        properties: ["versatile"],
        material: "steel",
      },
    }
    const hero = createHero({
      parent: {
        id: "actor-id",
        name: "Test Hero",
        items: [
          { type: "ancestry", name: "Elf" },
          { type: "class", name: "Mage" },
          item,
        ],
      },
      inventory: { coins: { g: 0, s: 0, c: 0 }, items: [] },
    })

    expect(
      TagalongExporter.buildTagalongHero(hero).character.inventory,
    ).toEqual([
      {
        id: "sword-id",
        name: "Iron Sword",
        computedName: "Iron Sword",
        notes: "A sturdy blade.",
        type: "weapon",
        category: "weapons",
        quantity: 1,
        slots: 2,
        total_slots: 2,
        value: { g: 1, s: 2, c: 3 },
        can_equip: true,
        is_equipped: true,
        is_custom: false,
        range: "melee",
        damage: "d6+2",
        grip: "1H",
        active_grip: "2H",
        properties: ["versatile"],
        might_req: 0,
        armor_rating: 0,
        material: "steel",
        relic_powers: [{ id: "keen" }],
      },
    ])
  })

  test("prefixes the timestamped filename with vgbndapp and the hero name", () => {
    const hero = createHero({
      parent: {
        id: "actor-id",
        name: "Luna",
        items: [
          { type: "ancestry", name: "Human" },
          { type: "class", name: "Rogue" },
        ],
      },
      level: { current: 10, xp: 120 },
    })

    expect(
      TagalongExporter.createFilename(hero, new Date(2026, 10, 3, 11, 5, 9)),
    ).toBe("vgbndapp-Luna-L10-Human-Rogue-2026-11-03-11-05-09.json")
  })

  test("downloads the serialized Tagalong character", () => {
    const saveDataToFile = jest.fn()
    Object.defineProperty(globalThis, "foundry", {
      configurable: true,
      value: { utils: { saveDataToFile } },
    })

    TagalongExporter.export(createHero())

    expect(saveDataToFile).toHaveBeenCalledTimes(1)
    expect(saveDataToFile).toHaveBeenCalledWith(
      expect.any(String),
      "application/json",
      expect.stringMatching(/^vgbndapp-Test-Hero-L3-Elf-Mage-/),
    )
    expect(
      JSON.parse(saveDataToFile.mock.calls[0][0] as string),
    ).toHaveProperty("character.name", "Test Hero")
  })

  test("exports Foundry data with the fvtt filename prefix", () => {
    const saveDataToFile = jest.fn()
    Object.defineProperty(globalThis, "foundry", {
      configurable: true,
      value: { utils: { saveDataToFile } },
    })
    Object.defineProperty(globalThis, "game", {
      configurable: true,
      value: {
        world: { id: "w" },
        version: "13",
        system: { id: "s", version: "1" },
      },
    })
    const actor = {
      system: createHero(),
      uuid: "Actor.h",
      toCompendium: () => ({ name: "Test Hero" }),
    }

    TagalongExporter.exportFoundryData(actor)

    expect(saveDataToFile).toHaveBeenCalledTimes(1)
    expect(saveDataToFile.mock.calls[0][2]).toMatch(/^fvtt-Test-Hero-L3-/)
    expect(
      JSON.parse(saveDataToFile.mock.calls[0][0] as string),
    ).toHaveProperty("_stats.exportSource.uuid", "Actor.h")
  })

  test("adds a hero-only Tagalong Export option between export and import", () => {
    const saveDataToFile = jest.fn()
    Object.defineProperty(globalThis, "foundry", {
      configurable: true,
      value: { utils: { saveDataToFile } },
    })
    const actors: Record<string, unknown> = {
      h: { type: "hero", isOwner: true, system: createHero() },
      n: { type: "npc", isOwner: true, system: {} },
    }
    Object.defineProperty(globalThis, "game", {
      configurable: true,
      value: { actors: { get: (id: string) => actors[id] } },
    })
    const li = (id: string) =>
      ({ closest: () => ({ dataset: { entryId: id } }) }) as any
    const options: any[] = [
      { label: "SIDEBAR.Export" },
      { label: "SIDEBAR.Import" },
    ]

    TagalongExporter.extendContextOptions(options)

    expect(options.map((option) => option.label)).toEqual([
      "SIDEBAR.Export",
      "Tagalong Export",
      "SIDEBAR.Import",
    ])
    expect(options[1].visible(li("h"))).toBe(true)
    expect(options[1].visible(li("n"))).toBe(false)

    options[1].onClick({}, li("h"))
    expect(saveDataToFile).toHaveBeenCalledTimes(1)
    expect(saveDataToFile.mock.calls[0][2]).toMatch(/^vgbndapp-Test-Hero-/)
  })

  test("appends the Tagalong Export option when export and import are not adjacent", () => {
    const options: any[] = [{ label: "SIDEBAR.Export" }, { label: "Other" }]

    TagalongExporter.extendContextOptions(options)

    expect(options.map((option) => option.label)).toEqual([
      "SIDEBAR.Export",
      "Other",
      "Tagalong Export",
    ])
  })
})
