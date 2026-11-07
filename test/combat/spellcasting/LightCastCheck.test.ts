import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals"

import * as confirmation from "../../../src/apps/vagabond-tools/dialog/ConfirmationDialogUseCase"
import { Attack } from "../../../src/combat/engine/Attack"
import { HeroAttack } from "../../../src/combat/engine/HeroAttack"
import { toLightFxId } from "../../../src/combat/engine/util/active-effect-fx"
import { appLang } from "../../../src/util/lang"
import { LightSourceUtil } from "../../../src/util/LightSourceUtil"

const light = {
  type: "sunlight" as const,
  range: 30,
  burns: [] as string[],
  damageType: "fire",
  burnDamage: "1d6",
}

const token = (id: string, x: number, disposition: number, actor: object) => ({
  id,
  actor,
  document: { id, actorId: id, x, y: 0, width: 1, height: 1, disposition },
})

describe("cast checks for emitted light", () => {
  const caster = {
    id: "caster",
    type: "hero",
    system: {},
    getFlag: () => false,
  }
  const friend = token("caster", 0, 1, caster)
  const undeadActor = {
    system: {
      beingType: "undead",
      modifiers: {
        misc: {
          light: {
            sunlight: {
              effects: [
                { mode: "status", status: "burning", damageType: "fire" },
              ],
            },
          },
        },
      },
    },
  }
  const undead = token("undead", 300, -1, undeadActor)
  let blocked: boolean

  beforeEach(() => {
    blocked = false
    const tokens = [friend, undead]
    ;(globalThis as any).canvas = {
      ready: true,
      grid: { size: 100, distance: 5 },
      tokens: { placeables: tokens },
      scene: {
        tokens: {
          some: (fn: (doc: object) => boolean) =>
            tokens.some((t) => fn(t.document)),
          get: (id: string) => tokens.find((t) => t.id === id)?.document,
        },
      },
    }
    ;(globalThis as any).CONFIG.Canvas = {
      polygonBackends: { light: { testCollision: () => blocked } },
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("prospective sunlight detects a hostile's sunlight burning rule", () => {
    expect(LightSourceUtil.harmedHostilesForLight(["caster"], light)).toEqual([
      undead,
    ])
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], {
        ...light,
        type: "moonlight",
      }),
    ).toEqual([])
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], {
        ...light,
        type: "basic",
        burns: ["undead"],
      }),
    ).toEqual([undead])
  })

  test("respects range, walls, dispositions, immunity and missing targets", () => {
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], {
        ...light,
        range: 10,
      }),
    ).toEqual([])
    blocked = true
    expect(LightSourceUtil.harmedHostilesForLight(["caster"], light)).toEqual(
      [],
    )
    blocked = false
    expect(LightSourceUtil.harmedHostilesForLight([], light)).toEqual([])
    expect(LightSourceUtil.harmedHostilesForLight(["missing"], light)).toEqual(
      [],
    )
    const immune = token("immune", 100, -1, {
      system: {
        beingType: "undead",
        modifiers: { damage: { in: { immunities: ["fire"] } } },
      },
    })
    ;((globalThis as any).canvas.tokens as any).placeables = [friend, immune]
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], {
        ...light,
        burns: ["undead"],
      }),
    ).toEqual([])
  })

  test("finds burning hostiles around any selected light recipient", () => {
    const distant = token("distant", 2000, 1, {})
    ;((globalThis as any).canvas.tokens as any).placeables = [
      friend,
      distant,
      undead,
    ]
    expect(
      LightSourceUtil.harmedHostilesForLight(["distant", "caster"], light),
    ).toEqual([undead])
    expect(LightSourceUtil.harmedHostilesForLight(["distant"], light)).toEqual(
      [],
    )
  })

  test.each([
    { statusImmunities: ["burning"] },
    { immunities: ["fire"] },
    { absorbs: ["fire"] },
  ])(
    "does not count a hostile that cannot be harmed by Burning: %p",
    (mods) => {
      const unharmed = token("unharmed", 100, -1, {
        system: {
          ...undeadActor.system,
          modifiers: {
            ...undeadActor.system.modifiers,
            damage: { in: mods },
          },
        },
      })
      ;((globalThis as any).canvas.tokens as any).placeables = [
        friend,
        unharmed,
      ]
      expect(LightSourceUtil.harmedHostilesForLight(["caster"], light)).toEqual(
        [],
      )
    },
  )

  test("direct light damage can harm a target immune to the Burning status", () => {
    const target = token("target", 100, -1, {
      system: {
        beingType: "undead",
        modifiers: { damage: { in: { statusImmunities: ["burning"] } } },
      },
    })
    ;((globalThis as any).canvas.tokens as any).placeables = [friend, target]
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], {
        ...light,
        burns: ["undead"],
      }),
    ).toEqual([target])
  })

  test("a non-focused light does not override another focused light", () => {
    const litCaster = {
      getFlag: (_scope: string, key: string) =>
        key === "grantedLights"
          ? { moonlight: { type: "moonlight", range: 30, focused: true } }
          : undefined,
    }
    const litFriend = token("caster", 0, 1, litCaster)
    ;((globalThis as any).canvas.tokens as any).placeables = [litFriend, undead]
    expect(LightSourceUtil.harmedHostilesForLight(["caster"], light)).toEqual(
      [],
    )
    expect(
      LightSourceUtil.harmedHostilesForLight(["caster"], light, true),
    ).toEqual([undead])
  })

  test("chooses light before the check and failed casts cannot apply effects", async () => {
    jest.spyOn(caster, "getFlag").mockReturnValue(true)
    const dialog = jest
      .spyOn(confirmation, "showConfirmationDialog")
      .mockImplementation(async (options) => {
        options.onConfirm?.("sunlight")
        return true
      })
    const skillCheck = {
      result: undefined as any,
      roll: jest.fn(async () => {
        skillCheck.result = { outcome: appLang.RollResult.failure }
      }),
    }
    const attack = new HeroAttack(
      "Light",
      caster as any,
      ["caster"],
      skillCheck as any,
    )
    attack.spellDelivery = { applyEffect: true } as any
    attack.appliedEffects = [
      { effect: toLightFxId("basic", 30), duration: "focus" },
    ]

    await attack.initiate(undefined, { skipChatCard: true })

    expect(dialog).toHaveBeenCalledTimes(1)
    expect(attack.appliedEffects[0].effect).toBe(toLightFxId("sunlight", 30))
    expect(skillCheck.roll).toHaveBeenCalledTimes(1)
    expect(attack.showDamage).toBe(false)
    const apply = jest.spyOn(Attack.prototype, "applyDamageAndResolve")
    await attack.applyDamageAndResolve({}, () => undefined)
    expect(apply).not.toHaveBeenCalled()
  })

  test("a successful required check permits the spell to resolve", async () => {
    const skillCheck = {
      result: undefined as any,
      roll: jest.fn(async () => {
        skillCheck.result = { outcome: appLang.RollResult.success }
      }),
    }
    const attack = new HeroAttack(
      "Light",
      caster as any,
      ["caster"],
      skillCheck as any,
    )
    attack.spellDelivery = { applyEffect: true } as any
    attack.appliedEffects = [
      { effect: toLightFxId("sunlight", 30), duration: "focus" },
    ]
    await attack.initiate(undefined, { skipChatCard: true })
    expect(skillCheck.roll).toHaveBeenCalledTimes(1)
    expect(attack.showDamage).toBe(true)
    const apply = jest
      .spyOn(Attack.prototype, "applyDamageAndResolve")
      .mockResolvedValue(undefined)
    await attack.applyDamageAndResolve({}, () => undefined)
    expect(apply).toHaveBeenCalledTimes(1)
  })

  test("friendly light without a harmed hostile does not roll", async () => {
    const skillCheck = { roll: jest.fn() }
    const attack = new HeroAttack(
      "Light",
      caster as any,
      ["caster"],
      skillCheck as any,
    )
    attack.spellDelivery = { applyEffect: true } as any
    attack.appliedEffects = [
      { effect: toLightFxId("moonlight", 30), duration: "focus" },
    ]
    await attack.initiate(undefined, { skipChatCard: true })
    expect(skillCheck.roll).not.toHaveBeenCalled()
    expect(attack.showDamage).toBe(true)
  })

  test("a light effect without an active duration does not require a check", async () => {
    const skillCheck = { roll: jest.fn() }
    const attack = new HeroAttack(
      "Light",
      caster as any,
      ["caster"],
      skillCheck as any,
    )
    attack.spellDelivery = { applyEffect: true } as any
    attack.appliedEffects = [
      { effect: toLightFxId("sunlight", 30), duration: "-" },
    ]
    await attack.initiate(undefined, { skipChatCard: true })
    expect(skillCheck.roll).not.toHaveBeenCalled()
  })
})
