import lang from "../../../../public/lang/en.json"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import PerkDataModel from "./PerkDataModel"
import SpellDataModel from "./SpellDataModel"

export const classFeatureSchema = () => {
    return {
        level: new fields.NumberField({ ...requiredInteger }),
        name: new fields.StringField({ ...requiredString }),
        description: new fields.HTMLField({ ...requiredString }),
        modifiers: new fields.ArrayField(new fields.SchemaField({ ...modifierSchema() })),
        grants: new fields.ArrayField(new fields.SchemaField({ ...grantSchema() }))
    }
}

export const traitSchema = () => {
    return {
        name: new fields.StringField({ ...requiredString }),
        description: new fields.StringField({ ...requiredString }),
        modifiers: new fields.ArrayField(new fields.SchemaField({ ...modifierSchema() }))
    }
}

export const modifierSchema = () => {
    return {
        targetStat: new fields.StringField({ ...requiredString }),
        type: new fields.StringField({ ...requiredString, choices: ['BONUS', 'SET', 'FORMULA'], initial: 'BONUS'}),
        value: new fields.StringField({ ...requiredString })
    }
}

export const grantSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: ['PERK', 'SPELL', 'TRAINING'], initial: 'PERK'}),
        count: new fields.NumberField({ ...requiredInteger, initial: 1}),
        perkOptions: new fields.ArrayField(new fields.SchemaField({ ...PerkDataModel.defineSchema() })),
        spellOptions: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
        trainingOptions: new fields.ArrayField(new fields.StringField({ ...requiredString, options: Object.values(lang.VGLITE.Skills).map(it => it.name)})),
        ignorePrerequisites: new fields.BooleanField({ initial: false })
    }
}