import { describe, expect, jest, test } from "@jest/globals"
import { renderToStaticMarkup } from "react-dom/server"

import { appLang } from "../../src/util/lang"
import { AbilitiesTab } from "../../src/view/sheets/actor/hero/tab/AbilitiesTab"
import { AlchemyTab } from "../../src/view/sheets/actor/hero/tab/AlchemyTab"
import { SpellsList } from "../../src/view/sheets/actor/hero/tab/component/spellcasting/SpellsList"
import { InventoryTab } from "../../src/view/sheets/actor/hero/tab/InventoryTab"

jest.mock("../../src/apps/alchemy/AlchemyCraftingView", () => ({
  AlchemyCraftingView: () => <div>Known recipes</div>,
}))

jest.mock("../../src/view/sheets/shared/CapacityGauge", () => ({
  CapacityGauge: () => <div>Capacity</div>,
}))

jest.mock("../../src/view/component/CoinPurse", () => ({
  HeroCoinPurse: () => <div>Coins</div>,
}))

jest.mock("../../src/view/sheets/shared/InventoryItemsTable", () => ({
  InventoryItemsTable: () => <div>Inventory</div>,
}))

jest.mock("../../src/view/sheets/item/equip/sheet/ContainerSheet", () => ({
  ContainerSheet: () => null,
}))

jest.mock("../../src/view/sheets/item/VagabondItemSheet", () => ({
  VagabondItemSheet: class {},
}))

jest.mock(
  "../../src/view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenuContext",
  () => ({
    useSpellcastingMenuContext: () => ({
      setIsSpellcastingOpen: () => undefined,
      onSelectSpell: () => undefined,
      selectedSpellId: null,
    }),
  }),
)

describe.each([true, false])("hero sheet ownership=%s", (isOwner) => {
  test("shows the alchemy selection button only to owners", () => {
    const markup = renderToStaticMarkup(
      <AlchemyTab actor={{ isOwner } as any} />,
    )
    expect(markup).toContain("Known recipes")
    expect(markup.includes(appLang.HeroSheet.Alchemy.recipesbtn)).toBe(isOwner)
  })

  test("shows spell selection only to owners while retaining the spell list", () => {
    const hero = {
      parent: { id: "hero", isOwner },
      spells: [
        {
          _sourceId: "spell",
          parent: { uuid: "spell", name: "Light", img: "" },
          damageType: "fire",
          description: "Light spell description",
        },
      ],
      statuses: { counters: { focus: 0 } },
    }
    const markup = renderToStaticMarkup(<SpellsList hero={hero as any} />)
    expect(markup.includes("Select Spells")).toBe(isOwner)
    expect(markup).toContain("Light")
  })

  test("shows perk and training selection only to owners", () => {
    const hero = {
      parent: { id: "hero", isOwner },
      class: { featureIds: [] },
      perks: [],
      level: { current: 1 },
    }
    const markup = renderToStaticMarkup(<AbilitiesTab hero={hero as any} />)
    expect(markup.includes("Perk Selections")).toBe(isOwner)
    expect(markup.includes("Training Selections")).toBe(isOwner)
  })

  test("shows the shop only to owners while keeping inventory visible", () => {
    const hero = {
      parent: { id: "hero", isOwner },
      inventory: { items: [] },
      containers: () => [],
      encumbranceInfo: () => ({}),
    }
    const markup = renderToStaticMarkup(<InventoryTab hero={hero as any} />)
    expect(markup.includes("Shop")).toBe(isOwner)
    expect(markup).toContain("Inventory")
  })
})
