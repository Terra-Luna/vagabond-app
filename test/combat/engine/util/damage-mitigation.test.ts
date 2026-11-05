import { describe, expect, test } from "@jest/globals"

import { DamageRoll } from "../../../../src/combat/engine/roll/DamageRoll"
import { mitigateBurningDamage } from "../../../../src/combat/engine/util/burning-mitigation"
import { buildSummaryRow, calculateBonusDamage, computeDamageBreakdown } from "../../../../src/combat/engine/util/damage-mitigation"

describe("calculateBonusDamage", () => {
  const target = { system: { hitDice: 8 } }
  const source = { system: { modifiers: {} } }

  test("applies the regular hit-die multiplier on any result and the crit multiplier only on a crit", () => {
    const damageRoll = new DamageRoll({
      atkName: "Test attack",
      dice: [],
      hdMultiplier: 3,
      hdMultiplierOnCrit: 2,
    })

    damageRoll.result = {
      atkName: "Test attack",
      dmgType: "physical",
      bonus: 0,
      total: 0,
      armorPiercing: 0,
      rollSummaries: [],
      rolls: [],
      isCrit: false,
    }
    expect(calculateBonusDamage(target, source, damageRoll)).toBe(24)

    damageRoll.result.isCrit = true
    expect(calculateBonusDamage(target, source, damageRoll)).toBe(40)
  })
})

describe("computeDamageBreakdown", () => {
  test("calculates per-die mitigation from the number of dice, regardless of their results", () => {
    const target = {
      system: {
        modifiers: { damage: { in: { perDieReduction: { global: 2 } } } },
        armor: { rating: 0 },
      },
      effects: [],
    }
    ;(globalThis as any).canvas = {
      scene: { tokens: { get: () => ({ actor: target }) } },
    }

    const damageRoll = new DamageRoll({
      atkName: "Test attack",
      dmgType: "fire",
      dice: [],
    })
    damageRoll.result = {
      atkName: "Test attack",
      dmgType: "fire",
      bonus: 0,
      total: 7,
      armorPiercing: 0,
      rollSummaries: [
        { result: 1, faces: 6, rerolled: false, exploded: false },
        { result: 6, faces: 6, rerolled: false, exploded: false },
      ],
      rolls: [],
    }

    const breakdown = computeDamageBreakdown(damageRoll, "target", {})
    expect(breakdown.otherMitigation).toBe(4)
    expect(breakdown.mitigated).toBe(3)

    const imbueRoll = new DamageRoll({
      atkName: "Imbue",
      dmgType: "fire",
      dice: [],
    })
    imbueRoll.result = {
      atkName: "Imbue",
      dmgType: "fire",
      bonus: 0,
      total: 1,
      armorPiercing: 0,
      rollSummaries: [
        { result: 1, faces: 6, rerolled: false, exploded: false },
      ],
      rolls: [],
    }
    const imbueBreakdown = computeDamageBreakdown(
      undefined,
      "target",
      {},
      0,
      false,
      [{ damageRoll: imbueRoll, bonus: 0 }],
    )
    expect(imbueBreakdown.otherMitigation).toBe(2)
    expect(imbueBreakdown.mitigated).toBe(0)
  })

  test("halves the fully mitigated total on a successful save after applying resistance", () => {
    const target = {
      system: {
        modifiers: {
          damage: {
            in: { resistances: ["fire"], flatReduction: { global: 2 } },
          },
        },
        armor: { rating: 4 },
      },
      effects: [],
    }
    ;(globalThis as any).canvas = {
      scene: { tokens: { get: () => ({ actor: target }) } },
    }

    const damageRoll = new DamageRoll({
      atkName: "Test attack",
      dmgType: "fire",
      dice: [],
    })
    damageRoll.result = {
      atkName: "Test attack",
      dmgType: "fire",
      bonus: 0,
      total: 65,
      armorPiercing: 0,
      rollSummaries: [],
      rolls: [],
    }

    const breakdown = computeDamageBreakdown(damageRoll, "target", {}, 0, true)
    expect(breakdown.damage).toBe(32)
    expect(breakdown.mitigatedBeforeSave).toBe(26)
    expect(breakdown.mitigated).toBe(13)
    expect(breakdown.resistanceDivisor).toBe(2)
    expect(breakdown.saveHalved).toBe(true)

    const summary = buildSummaryRow("target", 0, breakdown, 2, {}, "fire")
    expect(summary.total).toBe(14)
  })
})

describe("mitigateBurningDamage", () => {
  test("applies per-die mitigation even when it exceeds the roll result", () => {
    const actor = {
      system: {
        modifiers: { damage: { in: { perDieReduction: { global: 2 } } } },
      },
    } as any

    expect(mitigateBurningDamage(actor, "fire", 1)).toBe(0)
  })
})
