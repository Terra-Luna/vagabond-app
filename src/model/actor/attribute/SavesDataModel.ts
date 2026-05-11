import { fields, requiredInteger } from "../../foundryHelper"

export const savesSchema = () => {
    return {
        // DEX + AWR
        reflex: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // MIT * 2
        endure: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // RSN + PRS
        will: new fields.NumberField({ ...requiredInteger, initial: 20 }),
    }
}

export type SavesSchema = ReturnType<typeof savesSchema>

export default class SavesDataModel extends foundry.abstract.TypeDataModel<SavesSchema, any> {
    static defineSchema() {
        return savesSchema()
    }
}