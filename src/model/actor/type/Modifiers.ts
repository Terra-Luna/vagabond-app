import { appLang } from "../../../utils/lang"
import { damageImmunityTypeOptions, fields, requiredInteger, requiredString, uncappedInteger } from "../../common/sharedSchemas"

export const modifierSchema = () => {
    return {
        skillCheck: new fields.SchemaField({
            /**
             * Attack and Cast encompass all their respective skills related to attacking or casting spells.
             */
            attack: new fields.SchemaField({ ...skillModifierSchema() }),
            cast: new fields.SchemaField({ ...skillModifierSchema() }),
            /**
             * Specific skill check modifiers...
             */
            arcana: new fields.SchemaField({ ...skillModifierSchema() }),
            brawl: new fields.SchemaField({ ...skillModifierSchema() }),
            craft: new fields.SchemaField({ ...skillModifierSchema() }),
            detect: new fields.SchemaField({ ...skillModifierSchema() }),
            finesse: new fields.SchemaField({ ...skillModifierSchema() }),
            influence: new fields.SchemaField({ ...skillModifierSchema() }),
            leadership: new fields.SchemaField({ ...skillModifierSchema() }),
            medicine: new fields.SchemaField({ ...skillModifierSchema() }),
            melee: new fields.SchemaField({ ...skillModifierSchema() }),
            mysticism: new fields.SchemaField({ ...skillModifierSchema() }),
            performance: new fields.SchemaField({ ...skillModifierSchema() }),
            sneak: new fields.SchemaField({ ...skillModifierSchema() }),
            survival: new fields.SchemaField({ ...skillModifierSchema() }),
            ranged: new fields.SchemaField({ ...skillModifierSchema() }),
            /**
             * Saving throw modifiers...
             */
            reflex: new fields.SchemaField({ ...skillModifierSchema() }),
            endure: new fields.SchemaField({ ...skillModifierSchema() }),
            will: new fields.SchemaField({ ...skillModifierSchema() })
        }),

        damage: new fields.SchemaField({
            in: new fields.SchemaField({ ...damageReductionSchema() }),
            out: new fields.SchemaField({
                global: new fields.SchemaField({ ...damageOutSchema() }),
                melee: new fields.SchemaField({ ...damageOutSchema() }),
                brawl: new fields.SchemaField({ ...damageOutSchema() }),
                finesse: new fields.SchemaField({ ...damageOutSchema() }),
                ranged: new fields.SchemaField({ ...damageOutSchema() }),
                keen: new fields.SchemaField({ ...damageOutSchema() }),
                thrown: new fields.SchemaField({ ...damageOutSchema() }),
                defense: new fields.SchemaField({ ...damageOutSchema() }),
                alchemy: new fields.SchemaField({ ...damageOutSchema() }),
                spell: new fields.SchemaField({ ...damageOutSchema() })
            })
        }),

        healing: new fields.SchemaField({
            in: new fields.SchemaField({
                modifier: new fields.NumberField({ ...uncappedInteger, initial: 0 })
            }),
            out: new fields.SchemaField({
                alchemy: new fields.SchemaField({ ...damageOutSchema() }),
                spell: new fields.SchemaField({ ...damageOutSchema() })
            })
        }),

        casting: new fields.SchemaField({
            damageUpcastDiscount: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            deliveryUpcastDiscount: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            studyDiceDamage: new fields.BooleanField({ initial: false }),
            deliveryDiscounts: new fields.SchemaField({
                aura: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                cone: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                line: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                sphere: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                imbue: new fields.NumberField({ ...requiredInteger, initial: 0 })
            })
        }),

        downtime: new fields.SchemaField({
            breather: new fields.SchemaField({
                removeFatigue: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                gainLuck: new fields.NumberField({ ...requiredInteger, initial: 0 })
            }),
            rest: new fields.SchemaField({
                extraLuck: new fields.NumberField({ ...requiredInteger, initial: 0 })
            })
        })
    }
}

const skillModifierSchema = () => {
    return {
        modifier: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        critThreshold: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        extraDice: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        d4: new fields.BooleanField({ initial: false }),
        d6: new fields.BooleanField({ initial: false }),
        d8: new fields.BooleanField({ initial: false })
    }
}

// modifiers.damage.out[skill]...
const damageOutSchema = () => {
    return {
        ...baseDamageOutSchema(),
        weaponProps: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        conditional: new fields.SchemaField({
            armored: new fields.SchemaField({
                ...baseDamageOutSchema()
            })
        })
    }
}

const baseDamageOutSchema = () => {
    return {
        dice: new fields.SchemaField({
            size: new fields.SchemaField({ ...dieSizeModifierSchema() }),
            exploding: new fields.SchemaField({ ...explodingModSchema() }),
            crit: new fields.SchemaField({ ...critModSchema() }),
            reroll: new fields.SchemaField({ ...rerollModSchema() }),
            extra: new fields.SchemaField({ ...extraDiceModSchema() })
        }),
        bonus: new fields.SchemaField({
            flat: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
            perDie: new fields.NumberField({ ...uncappedInteger, initial: 0 })
        }),
        armorPiercing: new fields.SchemaField({
            flat: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            perDie: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            perExtraDie: new fields.NumberField({ ...requiredInteger, initial: 0 })
        })
    }
}

const dieSizeModifierSchema = () => {
    return {
        min: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        oneHandVersatile: new fields.BooleanField({ initial: false })
    }
}

const explodingModSchema = () => {
    return {
        min: new fields.BooleanField({ initial: false }),
        max: new fields.BooleanField({ initial: false }),
        subMax: new fields.BooleanField({ initial: false }),
        values: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
    }
}

const critModSchema = () => {
    return {
        extraDice: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        explodes: new fields.BooleanField({ initial: false })
    }
}

const rerollModSchema = () => {
    return {
        HH: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
    }
}

const extraDiceModSchema = () => {
    return {
        count: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        faces: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        explodesOn: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
    }
}

const damageReductionSchema = () => {
    return {
        flatReduction: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        perDieReduction: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        immunities: new fields.ArrayField(
            new fields.StringField({ ...damageImmunityTypeOptions() }),
            { initial: [] }
        ),
        weaknesses: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.DamageTypes) }),
            { initial: [] }
        ),
        resistances: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.DamageTypes) }),
            { initial: [] }
        ),
        statusImmunities: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.StatusConditions) }),
            { initial: [] }
        )
    }
}