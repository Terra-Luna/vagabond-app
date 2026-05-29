import lang from "../../../../public/lang/en.json"
import { fields, optionalString, requiredString, standardInteger } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import SpellDataModel from "./SpellDataModel"
import { modifierSchema } from "./traitsAndFeatures"

const perkSchema = () => {
    return {
        prerequisites: new fields.ArrayField(new fields.StringField({ ...requiredString })),
        modifiers: new fields.ArrayField(new fields.SchemaField({ ...modifierSchema() }))
    }
}

const prerequisiteSchema = () => {
    return {
        type: new fields.StringField({ choices: ['STAT', 'TRAINING', 'SPELL'] }),
        stat: new fields.StringField({ ...optionalString, options: Object.values(lang.VGLITE.Stat).map(it => it.long) }),
        value: new fields.NumberField({ ...standardInteger }),
        skillName: new fields.StringField({ ...optionalString }),
        spell: new fields.SchemaField({ ...SpellDataModel.defineSchema() })
    }
}

export type PerkSchema = ReturnType<typeof perkSchema> & BaseItemSchema

export default class PerkDataModel extends ItemDataModel<PerkSchema> {
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