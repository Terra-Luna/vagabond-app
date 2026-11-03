import type { ArmorDataModel } from "../../item/equip/ArmorDataModel"
import type { HeroDataModel } from "../HeroDataModel"

export const getArmor = (hero: HeroDataModel): ArmorDataModel | undefined => {
    const armor = hero.inventory.items.find((item: any) =>
        item.parent.type === "armor" && item.isEquipped
    ) as unknown as ArmorDataModel
    return armor && armor.isBoundRelic() && !armor.isBound ? undefined : armor
}
