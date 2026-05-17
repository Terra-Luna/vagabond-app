import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

export const classFeatureSchema = () => {
    return {
        /**
         * This can just be a name and desription til we figure out how to add
         * bonuses like stat increases or extra trainings.
         */
    }
}

export type ClassFeatureSchema = ReturnType<typeof classFeatureSchema> & BaseItemSchema

export default class ClassFeatureDataModel extends ItemDataModel<ClassFeatureSchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...classFeatureSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}