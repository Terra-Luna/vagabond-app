import { fields } from "../../../../common/sharedSchemas"

export const ancestryTraitSchema = () => {
    return {
        name: new fields.StringField({ required: true }),
        description: new fields.StringField({ required: true }),
        
        /**
         * TODO: figure out how to "merge" effects of this trait
         *       into the Hero object. E.g.: extra perk or extra
         *       training, +1 stat bonus, etc...
         */
        effects: new fields.ArrayField( new fields.StringField(), { initial: [] })
    }
}

export type AncestryTraitSchema = ReturnType<typeof ancestryTraitSchema>

export default class AncestryTraitDataModel extends foundry.abstract.TypeDataModel<AncestryTraitSchema, any> {
    static defineSchema() {
        return ancestryTraitSchema()
    }
}