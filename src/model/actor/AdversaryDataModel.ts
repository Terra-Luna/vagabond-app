import { fields, zonePreferences } from "../common/sharedSchemas"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { adversaryActionComboSchema, adversaryActionSchema } from "./type/AdversaryAction"

const adversarySchema = () => {
    const f = foundry.data.fields
    return {
        hitDice: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        threatLevel: new fields.NumberField({ integer: false, min: 0, initial: 1.00 }),
        zone: new fields.ArrayField(new fields.StringField({ ...zonePreferences() })),
        movement: new fields.ArrayField(
            new fields.SchemaField({
                speed: new fields.NumberField({ integer: true, min: 0 }),
                type: new fields.StringField({
                    choices: ['walk', 'fly', 'cling', 'climb', 'phase', 'swim']
                })
            })
        ),
        morale: new fields.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new fields.StringField({ initial: '1d4' }),
        actions: new fields.ArrayField(new fields.SchemaField({ ...adversaryActionSchema() })),
        combo: new fields.SchemaField({ ...adversaryActionComboSchema() }),
        abilities: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField({ required: true, initial: '' }),
                description: new fields.StringField({ required: true, initital: '' }),
            })
        )
    }
}

export type AdversarySchema = ReturnType<typeof adversarySchema> & BaseActorSchema
export type Adversary = AdversaryDataModel & AdversarySchema

export default class AdversaryDataModel extends ActorDataModel<AdversarySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...adversarySchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.health.max = this.ancestry.beingSize?.toUpperCase() === "SMALL" ? this.hitDice : Math.floor(this.hitDice! * 4.5)
        this.threatLevel = this.calculateThreatLevel()
    }

    calculateThreatLevel(): number {
        return calculateThreatLevel(this)
    }
}

/**
 * Threat level formula:
 *      a = armor * 2
 *      b = HP / 10
 *      c = Mean dmg-per-round / 6
 *      TL = (a + b) / 4 + c
 */
export const calculateThreatLevel = (adv: AdversaryDataModel): number => {
    var a = adv.armor.total! * 2
    var b = adv.health.max! / 10
    var c = 0
    if (adv?.combo?.actions?.length > 0) {
        adv.combo?.actions?.forEach(act => c += Number(act.damage.avg) || 0)
    }
    else {
        adv.actions?.forEach(act => c += Number(act.damage.avg) || 0)
        c = c / adv.actions?.length || 0
    }
    c = c / 6

    return Number(((a + b) / 4 + (c || 0)).toFixed(2))
}