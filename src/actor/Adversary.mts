import BaseActor, { BaseActorModelSchema } from "./BaseActor.mjs";

const adversarySchema = () => {
    const fields = foundry.data.fields;

    return {
        hitDice: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
        //todo: is this here or ONLY in derivedData? unsure
        threatLevel: new fields.NumberField({ integer: false, min: 0 }),
        zone: new fields.StringField({
            choices: [
                'frontline', 'midline', 'backline'
            ]
        }),
        morale: new fields.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new fields.StringField(),
        actions: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField(),
                type: new fields.StringField({ choices: ['Melee', 'Ranged', 'Cast', 'Combo'] }),
                description: new fields.StringField()
            })),
        abilities: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField(),
                description: new fields.StringField(),
            })
        )
    }
}

export class AdversaryDataModel extends BaseActor {
    static defineSchema() {
        return {
            ...super.defineSchema({}, { maxHealth: 1, startingHealth: 1 }),
            ...adversarySchema()
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
        return 1.23
    }
}