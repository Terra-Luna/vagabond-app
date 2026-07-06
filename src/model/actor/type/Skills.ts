import { fields, requiredInteger } from "../../common/sharedSchemas"

export const skillsSchema = () => {
    return {
        // Attack skills
        brawl: new fields.SchemaField({ ...skillSchema() }),
        melee: new fields.SchemaField({ ...skillSchema() }),
        finesse: new fields.SchemaField({ ...skillSchema() }),
        ranged: new fields.SchemaField({ ...skillSchema() }),
        // Other skills
        arcana: new fields.SchemaField({ ...skillSchema() }),
        craft: new fields.SchemaField({ ...skillSchema() }),
        detect: new fields.SchemaField({ ...skillSchema() }),
        influence: new fields.SchemaField({ ...skillSchema() }),
        leadership: new fields.SchemaField({ ...skillSchema() }),
        medicine: new fields.SchemaField({ ...skillSchema() }),
        mysticism: new fields.SchemaField({ ...skillSchema() }),
        performance: new fields.SchemaField({ ...skillSchema() }),
        sneak: new fields.SchemaField({ ...skillSchema() }),
        survival: new fields.SchemaField({ ...skillSchema() })
    }
}

export const skillSchema = (isTrained: boolean = false, stat: number = 2) => {
    return {
        isTrained: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ ...requiredInteger, initial: 20 - stat })
    }
}