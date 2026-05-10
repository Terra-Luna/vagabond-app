import ActorDataModel, { BaseActorSchema } from "./ActorDataModel.mjs"

const adversarySchema = () => {
    const f = foundry.data.fields
    return {
        hitDice: new f.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        threatLevel: new f.StringField(),
        zone: new f.StringField({
            choices: [
                'frontline', 'midline', 'backline'
            ]
        }),
        morale: new f.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new f.StringField(),
        actions: new f.ArrayField(
            new f.SchemaField({
                name: new f.StringField(),
                type: new f.StringField({ choices: ['Melee', 'Ranged', 'Cast', 'Combo'] }),
                description: new f.StringField(),
                damage: new f.StringField({ required: false, initial: '1d4' }),
                avgDamage: new f.NumberField({ required: false, integer: true, initial: 0 })
            })
        ),
        abilities: new f.ArrayField(
            new f.SchemaField({
                name: new f.StringField(),
                description: new f.StringField(),
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

    calculateThreatLevel(): string {
        return calculateThreatLevel(this)
    }
}

export const calculateThreatLevel = (adv: AdversaryDataModel): string => {
    /**
     * Threat level formula:
     *      a = armor * 2
     *      b = HP / 10
     *      c = Mean dmg-per-round / 6
     *      TL = (a + b) / 4 + c
     */
    var a = adv.armor.total! * 2
    var b = adv.health.max! / 10
    var c = ((adv.actions.map(a => a.avgDamage).reduce((sum, cur) => (sum || 0) + (cur || 0), 0) || 0) / adv.actions.entries.length) / 6
    return ((a + b) / 4 + (c || 0)).toFixed(2)
}