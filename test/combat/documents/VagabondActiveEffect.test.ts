import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals"

// Only the effect class is under test; its model dependencies are stubbed out.
jest.mock("../../../src/model/combat/ActiveEffectDataModel", () => ({
  ActiveEffectDataModel: class {},
}))
jest.mock("../../../src/model/item/equip/EquipmentDataModel", () => ({
  EquipmentDataModel: class {},
}))

let VagabondActiveEffect: any
const info = jest.fn()

const effect = (
  statuses: string[],
  immunities: string[] | undefined,
  userId = "me",
) => {
  const instance = Object.create(VagabondActiveEffect.prototype)
  instance.statuses = new Set(statuses)
  instance.parent = {
    name: "Wisp",
    system: { modifiers: { damage: { in: { statusImmunities: immunities } } } },
  }
  return { instance, user: { id: userId } }
}

describe("VagabondActiveEffect status immunities", () => {
  beforeAll(() => {
    ;(globalThis as any).ActiveEffect = class {

      async _preCreate() {
        return undefined
      }

    }
    ;(globalThis as any).Item = class {}
    // Loaded here so the stand-in ActiveEffect above exists when the class is defined.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    VagabondActiveEffect =
      require("../../../src/combat/documents/VagabondActiveEffect").VagabondActiveEffect
  })

  beforeEach(() => {
    info.mockClear()
    ;(globalThis as any).game = { userId: "me" }
    ;(globalThis as any).ui = { notifications: { info } }
  })

  it("blocks a status the actor is immune to, however it was applied", async () => {
    const { instance, user } = effect(["burning"], ["burning", "prone"])
    expect(await instance._preCreate({}, {}, user)).toBe(false)
  })

  it("lets the user who tried to apply it know why nothing happened", async () => {
    const { instance, user } = effect(["burning"], ["burning"])
    await instance._preCreate({}, {}, user)
    expect(info).toHaveBeenCalledTimes(1)

    info.mockClear()
    const other = effect(["burning"], ["burning"], "someone-else")
    await other.instance._preCreate({}, {}, other.user)
    expect(info).not.toHaveBeenCalled()
  })

  it("allows statuses the actor isn't immune to", async () => {
    const { instance, user } = effect(["blinded"], ["burning"])
    expect(await instance._preCreate({}, {}, user)).toBeUndefined()
  })

  it("allows effects that aren't statuses, and actors with no immunities", async () => {
    expect(
      await effect([], ["burning"]).instance._preCreate({}, {}, { id: "me" }),
    ).toBeUndefined()
    expect(
      await effect(["burning"], undefined).instance._preCreate(
        {},
        {},
        { id: "me" },
      ),
    ).toBeUndefined()
  })
})
