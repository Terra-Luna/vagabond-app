import { fields, requiredInteger } from "../../common/sharedSchemas"

export const savesSchema = () => {
    return {
        // DEX + AWR
        reflex: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // MIT * 2
        endure: new fields.NumberField({ ...requiredInteger, initial: 20 }),
        // RSN + PRS
        will: new fields.NumberField({ ...requiredInteger, initial: 20 })
    }
}