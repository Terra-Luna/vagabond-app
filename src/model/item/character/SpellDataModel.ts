import { vgLiteLang } from "../../../utils/lang"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { fields, damageTypeOptions, requiredInteger, requiredString, optionalInteger } from "../../common/sharedSchemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const spellSchema = () => {
    return {
        baseManaCost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        ignoreEffectCost: new fields.BooleanField({ initial: false }),
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        appliedEffects: new fields.ArrayField(
            new fields.SchemaField({
                effect: new fields.StringField({ ...requiredString, choices: Object.keys(vgLiteLang.StatusConditions) }),
                duration: new fields.NumberField({ ...optionalInteger }),
                critDuration: new fields.NumberField({ ...optionalInteger })
            }),
            { initial: [] }
        )
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