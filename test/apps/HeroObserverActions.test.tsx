import { afterEach, describe, expect, jest, test } from "@jest/globals"
import { renderToStaticMarkup } from "react-dom/server"

import { AlchemyCraftingView } from "../../src/apps/alchemy/AlchemyCraftingView"
import { RollPresetCard } from "../../src/apps/attack-builder/component/RollPresetCard"
import { FocusManagerApp } from "../../src/apps/focus-manager/FocusManagerApp"
import { HeroAttack } from "../../src/combat/engine/HeroAttack"
import { useItem } from "../../src/util/inventory-util"
import { Skill } from "../../src/view/sheets/actor/hero/tab/TopSection"

jest.mock(
  "../../src/apps/hero-choices/alchemy/AlchemySelectionUseCase",
  () => ({
    useAlchemySelection: () => ({ alchemySlots: [], alchemyItems: [] }),
  }),
)
jest.mock("../../src/apps/hero-choices/alchemy/Recipes", () => ({
  Recipes: ({ actions }) => <div>Recipes with {actions.length} actions</div>,
}))
jest.mock("../../src/apps/alchemy/component/MaterialsCounter", () => ({
  MaterialsCounter: () => null,
}))
jest.mock("../../src/rules/util/ItemsCache", () => ({
  ItemsCache: { alchemical: () => [] },
}))
jest.mock("../../src/view/component/Tooltip", () => ({
  Tooltip: ({ children, content, disabled }) => (
    <div>
      {children}
      {disabled ? null : content}
    </div>
  ),
}))
jest.mock("../../src/apps/attack-builder/RollBuilderView", () => ({
  RollBuilderView: () => <div>Roll builder</div>,
}))

afterEach(() => {
  jest.restoreAllMocks()
})

describe.each([true, false])("ownership=%s", (isOwner) => {
  test("keeps recipe information but restricts crafting actions", () => {
    const actor = { isOwner, items: [] }
    const markup = renderToStaticMarkup(
      <AlchemyCraftingView actor={actor as any} />,
    )
    expect(markup).toContain(`Recipes with ${isOwner ? 2 : 0} actions`)
  })

  test("keeps skills visible but restricts their roll builder", () => {
    const hero = { parent: { isOwner } }
    const markup = renderToStaticMarkup(
      <Skill
        hero={hero as any}
        skillKey="arcana"
        name="Arcana"
        value={10}
        trained={false}
      />,
    )
    expect(markup).toContain("Arcana")
    expect(markup.includes("Roll builder")).toBe(isOwner)
  })

  test("keeps roll presets visible but restricts the roll button", () => {
    const preset = {
      title: "Test preset",
      description: "",
      skill: "arcana",
      d20Count: 1,
      favorHinder: "none",
      critThreshold: 20,
      damageRolls: [],
    }
    const markup = renderToStaticMarkup(
      <RollPresetCard
        actor={{ isOwner } as any}
        preset={preset as any}
        EditButton={null}
        TrashButton={null}
      />,
    )
    expect(markup).toContain("Test preset")
    expect(markup.includes("<button")).toBe(isOwner)
  })
})

test("item use, attacks, imbues, custom rolls, and Focus reject observers before doing any work", async () => {
  const warn = jest.spyOn(ui.notifications!, "warn")
  const actor = { isOwner: false } as any
  const attack = Object.create(HeroAttack.prototype)
  attack.actor = actor
  await useItem(actor, undefined as any)
  await attack.initiate()
  expect(await HeroAttack.imbueAttack(actor, "", {} as any, {} as any)).toBe(
    false,
  )
  await HeroAttack.buildCustomRoll(actor, {} as any)
  FocusManagerApp.launch(actor)
  expect(warn).toHaveBeenCalledTimes(5)
})
