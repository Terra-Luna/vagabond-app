import type { ArmorDataModel } from "../../item/equip/ArmorDataModel"
import type { HeroDataModel } from "../HeroDataModel"

export const getArmor = (hero: HeroDataModel): ArmorDataModel | undefined => {
    return hero.inventory.items.find((item: any) =>
        item.parent.type === "armor" && item.isEquipped
    ) as unknown as ArmorDataModel
}
