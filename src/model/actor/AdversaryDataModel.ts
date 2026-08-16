import { lang } from "../../utils/lang"
import { getName } from "../../utils/modelUtil"
import { damageTypeOptions, fields, movementTypes, optionalString, requiredString, statusEffOptions, zonePreferences } from "../common/sharedSchemas"
import { ActorDataModel, BaseActorSchema } from "./ActorDataModel"
import { adversaryActionComboSchema, adversaryActionSchema, getDamageAverage } from "./type/AdversaryAction"

const adversarySchema = () => {
    return {
        beingSize: new fields.StringField({ ...requiredString, initial: 'medium', choices: Object.keys(lang.VGLITE.Sizes) }),
        beingType: new fields.StringField({ ...requiredString, initial: 'humanlike', choices: Object.keys(lang.VGLITE.BeingTypes) }),
        beingSubtype: new fields.StringField({ ...optionalString, initial: 'none', choices: Object.keys(lang.VGLITE.BeingSubtypes) }),
        threatLevel: new fields.NumberField({ integer: false, min: 0, initial: 1.00 }),
        threatLevelOverride: new fields.NumberField({ integer: false, min: 0, initial: null }),
        description: new fields.HTMLField(),
        hitDice: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
        zone: new fields.StringField({ ...zonePreferences() }),
        movement: new fields.SchemaField({
            speed: new fields.NumberField({ integer: true, min: 0 }),
            type: new fields.StringField({ ...movementTypes() })
        }),
        morale: new fields.NumberField({ integer: true, min: 2, max: 12 }),
        numberAppearing: new fields.StringField({ initial: '1d4' }),

        dmgImmunities: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        dmgWeaknesses: new fields.ArrayField(new fields.StringField({ ...damageTypeOptions() })),
        statusImmunities: new fields.ArrayField(new fields.StringField({ ...statusEffOptions() })),

        actions: new fields.ArrayField(new fields.SchemaField({ ...adversaryActionSchema() }), { initial: [] }),
        combo: new fields.SchemaField({ ...adversaryActionComboSchema() }),
        abilities: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField({ required: true, initial: '' }),
                description: new fields.HTMLField({ required: true, initital: '' }),
            })
        )
    }
}

export type AdversarySchema = ReturnType<typeof adversarySchema> & BaseActorSchema

export class AdversaryDataModel extends ActorDataModel<AdversarySchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...adversarySchema()
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({
            'prototypeToken.name': data.name,
            'prototypeToken.sight.enabled': true,
            'prototypeToken.sight.range': 500,
            'prototypeToken.occludable.radius': 8,
            'system.health.current': 4
        })
    }

    override async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId)
        if (changed.name) {
            this.parent.update({ 'prototypeToken.name': changed.name })
        }
        if (changed?.system?.hitDice || changed?.system?.beingSize) {
            this.parent.update({
                'system.health.current': calcAdversaryMaxHP(
                    changed.system.hitDice ?? this.hitDice!,
                    changed.system.beingSize ?? this.beingSize
                )
            })
        }
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.parent.prototypeToken.name = getName(this)
        this.health.max = calcAdversaryMaxHP(this.hitDice ?? 1, this.beingSize)
        this.threatLevel = setThreatLevel(this)
    }

}

export const calcAdversaryMaxHP = (hitDice: number, size: string): number => {
    return size.toUpperCase() === "SMALL" ? hitDice ?? 1 : Math.floor(hitDice! * 4.5)
}

/**
 * Threat level formula:
 *      a = armor * 2
 *      b = HP / 10
 *      c = Mean dmg-per-round / 6
 *      TL = (a + b) / 4 + c
 */
export const setThreatLevel = (adv: AdversaryDataModel): number => {
    const a = adv.armor.rating! * 2
    const b = adv.health.max! / 10
    let c = 0

    if (adv.combo != null && adv.combo.actions != null && adv.combo.actions.length > 0) {
        adv.combo?.actions?.forEach(act => c += (getDamageAverage(act.damage.dice as any) * Number(act.comboCount)))
        adv.actions
            ?.filter(act => adv.combo.actions.findIndex(it => it.name === act.name) < 0)
            .forEach(act => c += getDamageAverage(act.damage.dice as any))
    }
    else {
        adv.actions?.forEach(act => {
            const avg = getDamageAverage(act.damage.dice as any)
            c += isNaN(avg) ? 0 : avg
        })
        c = c / (adv.actions?.length || 1)
    }

    c = c / 6

    return Number(((a + b) / 4 + (c ?? 0)).toFixed(2))
}