import CurrencyDataModel from "../item/CurrencyDataModel.mjs"
import EquipmentDataModel from "../item/gear/EquipmentDataModel.mjs"
import ActorBase, { BaseActorSchema } from "./ActorBase.mjs"

const heroSchema = () => {
    const f = foundry.data.fields
    const schema = {
        mana: new f.SchemaField({
            max: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            value: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            maxCast: new f.NumberField({ integer: true })
        }),
        currentLuck: new f.NumberField({ integer: true, initial: 2, max: 2 }),
        fatigue: new f.NumberField({
            choices: [0, 1, 2, 3, 4, 5],
            initial: 0
        }),
        level: new f.SchemaField({
            current: new f.NumberField({ integer: true, min: 0, max: 10, initial: 0 }),
            xp: new f.NumberField({ integer: true, initial: 0 }),
            xpToLevel: new f.NumberField({ integer: true, initial: 10 })
        }),
        stats: new f.SchemaField({
            might: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
            dexterity: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
            awareness: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
            reason: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
            presence: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
            luck: new f.NumberField({ integer: true, min: 2, max: 7, initial: 2 }),
        }),
        boundRelicLimit: new f.NumberField({ integer: true, initial: 3 }),
        inventory: new f.SchemaField({
            wealth: new f.SchemaField({
                ...CurrencyDataModel.defineSchema
            }),
            maxSlots: new f.NumberField({ integer: true, min: 8, initial: 8 }),
            slotBonus: new f.NumberField({ integer: true, min: 0, initial: 0 }),
            equipped: new f.ArrayField(
                new f.TypedSchemaField({ ...EquipmentDataModel.defineSchema })
            )
        })
    }
    return schema
}

export type HeroDataModelSchema = ReturnType<typeof heroSchema> & BaseActorSchema

export class HeroDataModel extends ActorBase<HeroDataModelSchema> {
    static defineSchema() {
        const f = foundry.data.fields
        return {
            ...super.defineSchema(),
            ...heroSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.health.max = this.stats.might! * (this.level.current || 1)
    }
}
