import BaseActor from "./BaseActor.mjs";

const heroActorSchema = () => {
    const fields = foundry.data.fields;

    return {
        xp: new fields.SchemaField({
            level: new fields.NumberField({ integer: true, initial: 0 }),
            current: new fields.NumberField({ integer: true, initial: 0 }),
            nextLevel: new fields.NumberField({ integer: true, initial: 10 })
        }),
        stats: new fields.SchemaField({
            might: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
            dexterity: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
            awareness: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
            reason: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
            presence: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
            luck: new fields.NumberField({ integer: true, max: 7, min: 2, initial: 2 }),
        })
    };
}

type HeroActorModelSchema = ReturnType<typeof heroActorSchema>

export class HeroDataModel extends BaseActor {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema({
                mana: new fields.SchemaField({
                    max: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                    value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                    maxCast: new fields.NumberField({ integer: true })
                }),
                currentLuck: new fields.NumberField({ integer: true, initial: 2, max: 2 }),
                fatigue: new fields.NumberField({
                    choices: [0, 1, 2, 3, 4, 5],
                    initial: 0
                }),
            }),
            ...heroActorSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        const { health } = this.resources
        health.max = this.stats.might * (this.xp.level || 1)
    }
}