import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import AdversaryActionDataModel, { AdversaryActionComboDataModel } from "./attribute/AdversaryActionDataModel"
import { zonePreferences } from "./attribute/beingTraitsSchema"

const adversarySchema = () => {
    const f = foundry.data.fields
    return {
        hitDice: new f.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        threatLevel: new f.NumberField({ integer: false, min: 0, initial: 1.00 }),
        zone: new f.StringField({ ...zonePreferences() }),
        movement: new f.ArrayField(
            new f.SchemaField({
                speed: new f.NumberField({ integer: true, min: 0 }),
                type: new f.StringField({
                    choices: ['walk', 'fly', 'cling', 'climb', 'phase', 'swim']
                })
            })
        ),
        morale: new f.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new f.StringField({ initial: '1d4' }),
        actions: new f.ArrayField(new f.SchemaField({ ...AdversaryActionDataModel.defineSchema() })),
        combo: new f.SchemaField({ ...AdversaryActionComboDataModel.defineSchema() }),
        abilities: new f.ArrayField(
            new f.SchemaField({
                name: new f.StringField({ required: true, initial: '' }),
                description: new f.StringField({ required: true, initital: '' }),
            })
        )
    }
}

export type AdversarySchema = ReturnType<typeof adversarySchema> & BaseActorSchema

export default class AdversaryDataModel extends ActorDataModel<AdversarySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...adversarySchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.health.max = this.size?.toUpperCase() === "SMALL" ? this.hitDice : Math.floor(this.hitDice! * 4.5)
        this.threatLevel = this.calculateThreatLevel()
    }

    calculateThreatLevel(): number {
        return calculateThreatLevel(this)
    }
}

export const calculateThreatLevel = (adv: AdversaryDataModel): number => {
    /**
     * Threat level formula:
     *      a = armor * 2
     *      b = HP / 10
     *      c = Mean dmg-per-round / 6
     *      TL = (a + b) / 4 + c
     */
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