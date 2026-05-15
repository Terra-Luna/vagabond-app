import HeroDataModel from "../../actor/HeroDataModel"
import { fields } from "../../common/sharedSchemas"
import EquipmentDataModel from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const armorSchema = () => {
    return {
        type: new fields.StringField({ reuired: false, initial: 'light', choices: ['light', 'medium', 'heavy'] }),
        rating: new fields.NumberField({ integer: true, min: 0, initial: 0 })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema> & EquipmentSchema

export default class ArmorDataModel extends EquipmentDataModel<ArmorSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...armorSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.rating = { 'light': 1, 'medium': 2, 'heavy': 3 }[this.type || 0]
    }

    override typeName: String = "Armor"
    override onEquip(hero: HeroDataModel) {
        equipArmor(hero, this)
    }

    override onUnEquip(hero: HeroDataModel) {
        unequipArmor(this)
    }
        
    override onUse() { }
}

export function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.inventory.container.items.filter(it => it.isEquipped && it.category === "Armor")
    equippedArmor.forEach(it => {
        it.isEquipped = false
    })
    armor.isEquipped = true
}

export function unequipArmor(armor: ArmorDataModel) {
    armor.isEquipped = false
}