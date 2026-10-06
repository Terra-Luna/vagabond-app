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
            in: new fields.SchemaField({ ...damageInSchema() }),
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

        combat: new fields.SchemaField({
            constant: new fields.SchemaField({ ...combatModifiersSchema() }),
            roundOne: new fields.SchemaField({ ...combatModifiersSchema() })
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
        sumCrit: new fields.BooleanField({ initial: false }),
        extraDice: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        d4: new fields.BooleanField({ initial: false }),
        d6: new fields.BooleanField({ initial: false }),
        d8: new fields.BooleanField({ initial: false })
    }
}

const damageOutSchema = () => {
    return {
        ...baseDamageOutSchema(),
        properties: new fields.SchemaField({
            granted: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
            linked: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(appLang.WeaponProps) }))
        }),
        conditional: new fields.SchemaField({
            armored: new fields.SchemaField({ ...baseDamageOutSchema() }),
            weak: new fields.BooleanField({ initial: false })
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

const damageInSchema = () => {
    return {
        // Flat damage reduction
        flatReduction: new fields.SchemaField({ ...damageReductionByTypeSchema() }),
        // Per-die damage reduction
        perDieReduction: new fields.SchemaField({ ...damageReductionByTypeSchema() }),
        // Damage immunities
        immunities: new fields.ArrayField(
            new fields.StringField({ ...damageImmunityTypeOptions() }),
            { initial: [] }
        ),
        // Extra damage die
        weaknesses: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.DamageTypes) }),
            { initial: [] }
        ),
        // Half damage
        resistances: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.DamageTypes) }),
            { initial: [] }
        ),
        // Status effect immunities
        statusImmunities: new fields.ArrayField(
            new fields.StringField({ ...requiredString, choices: Object.keys(appLang.StatusConditions) }),
            { initial: [] }
        )
    }
}

const damageReductionByTypeSchema = () => {
    return {
        global: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        physical: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        magical: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        acid: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        cold: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        fire: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        shock: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        necrotic: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        poison: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        psychic: new fields.NumberField({ ...uncappedInteger, initial: 0 })
    }
}

const combatModifiersSchema = () => {
    return {
        speed: new fields.SchemaField({
            turn: new fields.NumberField({ ...requiredInteger, initial: 0 })
        })
    }
}