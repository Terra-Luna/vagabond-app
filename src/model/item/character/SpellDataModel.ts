import { appLang } from "../../../utils/lang"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const spellSchema = () => {
    return {
        baseManaCost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        ignoreEffectCost: new fields.BooleanField({ initial: false }),
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        upcastableEffect: new fields.BooleanField({ initial: false }),
        appliedEffects: new fields.ArrayField(
            new fields.SchemaField({
                effect: new fields.StringField({ ...requiredString, choices: Object.keys(appLang.StatusConditions) }),
                duration: new fields.StringField({ ...optionalString }),
                critDuration: new fields.StringField({ ...optionalString })
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
    return [{ label: 'Damage Base', value: appLang.DamageTypes[spell.damageType] }]
}