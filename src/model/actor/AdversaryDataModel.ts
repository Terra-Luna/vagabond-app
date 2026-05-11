import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"

const adversarySchema = () => {
    const f = foundry.data.fields
    return {
        hitDice: new f.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        threatLevel: new f.NumberField({ integer: false, min: 0, initial: 1.00 }),
        zone: new f.StringField({
            choices: [
                'frontline', 'midline', 'backline'
            ]
        }),
        movement: new f.ArrayField(
            new f.SchemaField({
                speed: new f.NumberField({ integer: true, min: 0 }),
                type: new f.StringField({
                    choices: ['walk', 'fly', 'cling', 'climb', 'phase', 'swim']
                })
            })
        ),
        morale: new f.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new f.StringField({}),
        actions: new f.ArrayField(
            new f.SchemaField({
                name: new f.StringField({}),
                type: new f.StringField({ choices: ['Melee', 'Ranged', 'Cast', 'Combo'] }),
                description: new f.StringField({}),
                damage: new f.StringField({ required: false, initial: '1d4' }),
                avgDamage: new f.NumberField({ required: false, integer: true, initial: 0 })
            })
        ),
        abilities: new f.ArrayField(
            new f.SchemaField({
                name: new f.StringField({}),
                description: new f.StringField({}),
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
    var actionDmgSum = Number(adv.actions.reduce((n, { avgDamage }) => n + (avgDamage || 0), 0).toFixed(2))
    var c = (actionDmgSum / adv.actions.length) / 6
    return Number(((a + b) / 4 + (c || 0)).toFixed(2))
}