import { fields } from "../../../common/sharedSchemas"

export const levelSchema = () => {
    return {
        current: new fields.NumberField({ integer: true, min: 0, max: 10, initial: 0 }),
        xp: new fields.NumberField({ integer: true, initial: 0 }),
        xpToLevel: new fields.NumberField({ integer: true, initial: 10 })
    }
}

export type LevelSchema = ReturnType<typeof levelSchema>

export default class LevelDataModel extends foundry.abstract.TypeDataModel<LevelSchema, any> {
    static defineSchema() {
        return levelSchema()
    }
}