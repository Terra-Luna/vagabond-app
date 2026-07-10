import { fields, requiredInteger } from "../../common/sharedSchemas"

const MAX_STAT_VALUE: number = 7 // TODO: <-- make this configurable via system settings?
const statProps = { integer: true, min: 2, max: MAX_STAT_VALUE, initial: 2 }

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