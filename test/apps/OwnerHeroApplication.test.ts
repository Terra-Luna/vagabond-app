import { afterEach, describe, expect, jest, test } from "@jest/globals"

import { AlchemySelectionApp } from "../../src/apps/hero-choices/alchemy/AlchemySelectionApp"
import { PerkSelectionApp } from "../../src/apps/hero-choices/perks/PerkSelectionApp"
import { SpellSelectionApp } from "../../src/apps/hero-choices/spells/SpellSelectionApp"
import { TrainingSelectionApp } from "../../src/apps/hero-choices/training/TrainingSelectionApp"
import { ItemShopApp } from "../../src/apps/shop/ItemShopApp"
import { VagabondApplication } from "../../src/apps/VagabondApplication"

describe.each([
  ["shop", ItemShopApp],
  ["perk selection", PerkSelectionApp],
  ["spell selection", SpellSelectionApp],
  ["training selection", TrainingSelectionApp],
  ["alchemy selection", AlchemySelectionApp],
])("%s access", (_name, App) => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("rejects observers and allows owners", () => {
    const warn = jest.spyOn(ui.notifications!, "warn")
    const base = jest
      .spyOn(VagabondApplication.prototype as any, "_canRender")
      .mockReturnValue(undefined)
    const app = Object.create(App.prototype)
    app.actor = { isOwner: false }

    expect(app._canRender({})).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(base).not.toHaveBeenCalled()

    app.actor.isOwner = true
    expect(app._canRender({})).toBeUndefined()
    expect(base).toHaveBeenCalledTimes(1)
  })
})

test("a denied app releases its registration and update hook", () => {
  const originalHooks = Object.getOwnPropertyDescriptor(globalThis, "Hooks")
  const on = jest.fn(() => 42)
  const off = jest.fn()
  Object.defineProperty(globalThis, "Hooks", {
    configurable: true,
    value: { on, off },
  })

  try {
    const actor = { id: "observer-test", name: "Hero", isOwner: false } as any
    const denied = new ItemShopApp(actor)
    expect((denied as any)._canRender({})).toBe(false)
    expect(off).toHaveBeenCalledWith("updateActor", 42)

    actor.isOwner = true
    const owner = new ItemShopApp(actor)
    const registry = (VagabondApplication as any)._openAppsRegistry
    expect(registry.get(ItemShopApp).get(actor.id)).toBe(owner)
    ;(owner as any).releaseRegistration()
  }
  finally {
    if (originalHooks) Object.defineProperty(globalThis, "Hooks", originalHooks)
    else Reflect.deleteProperty(globalThis, "Hooks")
  }
})
