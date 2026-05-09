import BaseActor from "./ActorBase.mjs"

export class AdversaryDataModel extends BaseActor {
    static defineSchema() {
        const f = foundry.data.fields
        return {
            ...super.defineSchema({}, { maxHealth: 1, startingHealth: 1 }),
            hitDice: new f.NumberField({ integer: true, min: 1, initial: 1 }),
            threatLevel: new f.NumberField({ integer: false, min: 0, initial: 0 }),
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

    override async prepareDerivedData() {
        super.prepareDerivedData()
        const { health } = this.resources
        health.max = this.size?.toUpperCase() === "SMALL" ? this.hitDice : Math.floor(this.hitDice * 4.5)
        this.threatLevel = this._calculateThreatLevel()
    }

    _calculateThreatLevel(): number {
        /**
         * Threat level formula:
         *      a = armor * 2
         *      b = HP / 10
         *      c = Mean dmg-per-round / 6
         *      TL = (a + b) / 4 + c
         */
        var a = this.
        var avgDamage = this.actions
        return 1.23
    }
}