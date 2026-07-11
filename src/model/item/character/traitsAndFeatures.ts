import { vgLiteLang } from "../../../utils/lang"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { SpellDataModel } from "./SpellDataModel"

export type ClassFeature = ReturnType<typeof classFeatureSchema>
export const classFeatureSchema = () => {
    return {
        level: new fields.NumberField({ ...requiredInteger }),
        name: new fields.StringField({ ...requiredString }),
        description: new fields.HTMLField({ ...requiredString }),
        grants: new fields.ArrayField(new fields.SchemaField({ ...grantSchema() }), { initial: [] }),
        modifiers: new fields.ArrayField(new fields.SchemaField({ ...modifierSchema() }), { initial: [] })
    }
}

export type Trait = ReturnType<typeof traitSchema>
export const traitSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        description: new fields.StringField({ ...requiredString }),
        modifiers: new fields.ArrayField(new fields.SchemaField({ ...modifierSchema() }), { initial: [] }),
        grants: new fields.ArrayField(new fields.SchemaField({ ...grantSchema() }), { initial: [] }),
    }
}

export type Modifier = ReturnType<typeof modifierSchema>
export const modifierSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: ['BONUS', 'SET', 'FORMULA'], initial: 'BONUS' }),
        value: new fields.StringField({ ...requiredString }),
        targetStat: new fields.StringField({ ...requiredString })
    }
}
export interface ModifierModel {
    type: string, value: string, targetStat: string
}

export type Grant = ReturnType<typeof grantSchema>
export const grantSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: ['PERK', 'SPELL', 'TRAINING'], initial: 'PERK' }),
        specific: new fields.BooleanField({ required: true, initial: true }),
        count: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        selectedPerks: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        spellOptions: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
        trainingOptions: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(vgLiteLang.Skills) })),
        ignorePrerequisites: new fields.BooleanField({ initial: false })
    }
}
export interface GrantModel {
    type: string,
    specific: boolean,
    count: number,
    selectedPerks: string[],
    spellOptions: string[],
    trainingOptions: string[],
    ignorePrerequisites: boolean
}