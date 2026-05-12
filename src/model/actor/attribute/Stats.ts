import { fields, requiredInteger } from "../../common/sharedSchemas"

const statProps = { integer: true, min: 2, max: 7, initial: 2 }

export const statsSchema = () => {
    return {
        might: new fields.NumberField({ ...statProps }),
        dexterity: new fields.NumberField({ ...statProps }),
        awareness: new fields.NumberField({ ...statProps }),
        reason: new fields.NumberField({ ...statProps }),
        presence: new fields.NumberField({ ...statProps }),
        luck: new fields.NumberField({ ...statProps }),
        currentLuck: new fields.NumberField( { ...requiredInteger, initial: 2 })
    }
}

export type StatsSchema = ReturnType<typeof statsSchema>
export type Stats = foundry.abstract.TypeDataModel<StatsSchema, any>