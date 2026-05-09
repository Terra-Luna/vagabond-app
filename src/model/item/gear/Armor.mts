import { HeroDataModel } from "../../actor/Hero.mjs"
import ItemBase from "../ItemBase.mjs"
import Equipment from "./Equipment.mjs"

export class ArmorDataModel extends Equipment {
    static defineSchema() {
        const f = foundry.data.fields
        return {
            ...super.defineSchema(),
            armorType: new f.StringField({ reuired: false, initial: 'light', choices: ['light', 'medium', 'heavy'] }),
            baseArmor: new f.NumberField({ integer: true, min: 0, initial: 0 })
        }
    }

    prepareDerivedData() {
        super.prepareDerivedData()
        this.baseArmor = {'light': 1, 'medium': 2, 'heavy': 3}[this.armorType || 1]
    }

    override onEquip(hero: HeroDataModel) { }

    override onUse() { }
}