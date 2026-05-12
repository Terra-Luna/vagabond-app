import { fields, requiredInteger, standardInteger } from "../../../common/sharedSchemas"

export const savesSchema = () => {
    return {
        // DEX + AWR
        reflex: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        reflexBonus: new fields.NumberField({ ...standardInteger }),
        // MIT * 2
        endure: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        endureBonus: new fields.NumberField({ ...standardInteger }),
        // RSN + PRS
        will: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        willBonus: new fields.NumberField({ ...standardInteger })
    }
}

export type SavesSchema = ReturnType<typeof savesSchema>

export default class SavesDataModel extends foundry.abstract.TypeDataModel<SavesSchema, any> {
    static defineSchema() {
        return savesSchema()
    }
}