import { fields, optionalString, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const perkSchema = () => {
    return {
        prerequisites: new fields.StringField({ ...optionalString }),
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