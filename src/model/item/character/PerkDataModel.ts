import HeroDataModel from "../../actor/HeroDataModel"
import { fields, optionalString, requiredInteger, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

export const perksSchema = () => {
    return {
        perkSlots: new fields.NumberField({ ...requiredInteger, initial: 0}),
        perks: new fields.ArrayField(new fields.SchemaField({ ...perkSchema() }), { initial: [] })
    }
}

const perkSchema = () => {
    return {
        prerequisites: new fields.ArrayField(
            new fields.SchemaField({
                type: new fields.StringField({ choices: ['stat', 'training', 'spell'] }),
                name: new fields.StringField({ ...requiredString }),
                value: new fields.StringField({ ...requiredString })
            })
        )
    }
}

export type PerkSchema = ReturnType<typeof perkSchema> & BaseItemSchema

export default class PerkDataModel<T extends PerkSchema> extends ItemDataModel<T> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...perkSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}

export function setPerkSlots(hero: HeroDataModel) {
    const level = hero.level.current || 1
    const slotBonus = hero.bonus.perkSlots || 0
    hero.perkData.perkSlots = Math.floor((level - 1) / 2) + slotBonus
}

export function addPerk(hero: HeroDataModel, perk: PerkDataModel<PerkSchema>) {
    const perks = hero.perkData.perks
    const isNotSelected = perks.find(it => (it as PerkDataModel<PerkSchema>).parent.name == perk.parent.name) == null
    if (perks.length < hero.perkData.perkSlots! && isNotSelected) {
        hero.perkData.perks.push(perk)
    }
}