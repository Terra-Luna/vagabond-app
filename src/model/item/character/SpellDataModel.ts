import { vgLiteLang } from "../../../utils/lang"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { fields, damageTypeOptions, optionalString } from "../../common/sharedSchemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const spellSchema = () => {
    return {
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        appliesBurn: new fields.BooleanField({ initial: false }),
        burnCountdown: new fields.StringField({ ...optionalString, initial: 'Cd4' }),
    }
}

export type SpellSchema = ReturnType<typeof spellSchema> & BaseItemSchema

export class SpellDataModel extends ItemDataModel<SpellSchema> {
    public _sourceId?: string
    public isRuleSelection?: boolean

    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...spellSchema()
        }
    }
}

export const spellDamageBase = (spell: SpellDataModel): CardSubHeaderValues[] => {
    return [{ label: 'Damage Base', value: vgLiteLang.DamageTypes[spell.damageType] }]
}