import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const armorSchema = () => {
    return {
        type: new fields.StringField({ reuired: false, initial: 'light', choices: ['light', 'medium', 'heavy'] }),
        rating: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
        mightReq: new fields.NumberField({ ...requiredInteger, initial: 3 }),
        material: new fields.StringField({ ...requiredString, initial: 'Standard', choices: Object.values(lang.VGLITE.Metals).map(it => it.name) })
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

    /**
     * May have some issues with these derivatiosn being self-referrenctial.
     * If that's the case, re-work it and add new props such as "finalRating"
     * or something.
     */
    override async prepareDerivedData() {
        if (this.material === "Adamant") {
            this.bonus.armor! += 1
            this.bonus.slots! += 1
        }
        else if (this.material === "Mythral") {
            this.bonus.slots! -= 1
        }
        this.rating = this.rating! + this.bonus.armor!

        super.prepareDerivedData()
    }
}

export async function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.parent.items.filter((it: any) => it.type === "armor" && it.system.isEquipped)
    equippedArmor.forEach((it: any) => {
        it.update({ 'system.isEquipped': false })
    })
    armor.parent.update({ 'system.isEquipped': true })
}