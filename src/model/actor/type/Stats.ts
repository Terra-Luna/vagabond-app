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
        currentLuck: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        //This is the stat-line the player chooses at character creation.
        baseStatBlock: new fields.ArrayField(new fields.NumberField({ ...requiredInteger, max: 7 }))
    }
}

export type StatsSchema = ReturnType<typeof statsSchema>
export type Stats = foundry.abstract.TypeDataModel<StatsSchema, any>

export const baseStatBlocks: number[][] = [
    [5, 5, 5, 4, 4, 3],
    [5, 5, 5, 5, 3, 2],
    [6, 5, 4, 4, 4, 3],
    [6, 5, 5, 4, 3, 2],
    [6, 6, 4, 3, 3, 3],
    [6, 6, 4, 4, 3, 2],
    [6, 6, 5, 3, 2, 2],
    [7, 4, 4, 4, 4, 2],
    [7, 4, 4, 4, 3, 3],
    [7, 5, 5, 2, 2, 2],
    [7, 5, 5, 2, 2, 2],
    [7, 6, 4, 2, 2, 2]
]
