import { appLang,lang } from "../../../utils/lang"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { beingSizeOptions, beingTypeOptions, fields, requiredString } from "../../common/sharedSchemas"
import { BaseItemSchema,ItemDataModel } from "../ItemDataModel"

const ancestrySchema = () => {
    return {
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.APP.Senses) }), { initial: [] }),
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() })
    }
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export class AncestryDataModel extends ItemDataModel<AncestrySchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...ancestrySchema()
        }
    }
}

export const ancestrySizeAndType = (ancestry: AncestryDataModel): CardSubHeaderValues[] => {
    return [
        { label: appLang.HeroCreation.beingSize, value: appLang.Sizes[ancestry.beingSize ?? 'medium'] },
        { label: appLang.HeroCreation.beingType, value: appLang.BeingTypes[ancestry.beingType] }
    ]
}