import { fields, requiredInteger, uncappedInteger } from "../../common/sharedSchemas"

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
            will: new fields.SchemaField({ ...skillModifierSchema() }),
        }),

        dice: new fields.SchemaField({
            size: new fields.SchemaField({
                melee: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                finesse: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                brawl: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                ranged: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                thrown: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                defense: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                spell: new fields.SchemaField({ ...dieSizeModifierSchema() }),
                spellHealing: new fields.SchemaField({ ...dieSizeModifierSchema() })
            }),
            exploding: new fields.SchemaField({
                melee: new fields.SchemaField({ ...explodingModSchema() }),
                finesse: new fields.SchemaField({ ...explodingModSchema() }),
                brawl: new fields.SchemaField({ ...explodingModSchema() }),
                ranged: new fields.SchemaField({ ...explodingModSchema() }),
                thrown: new fields.SchemaField({ ...explodingModSchema() }),
                defense: new fields.SchemaField({ ...explodingModSchema() }),
                spell: new fields.SchemaField({ ...explodingModSchema() }),
                spellHealing: new fields.SchemaField({ ...explodingModSchema() })
            }),
            crit: new fields.SchemaField({
                melee: new fields.SchemaField({ ...critModSchema() }),
                finesse: new fields.SchemaField({ ...critModSchema() }),
                brawl: new fields.SchemaField({ ...critModSchema() }),
                ranged: new fields.SchemaField({ ...critModSchema() }),
                thrown: new fields.SchemaField({ ...critModSchema() }),
                defense: new fields.SchemaField({ ...critModSchema() }),
                spell: new fields.SchemaField({ ...critModSchema() })
            })
        }),

        damage: new fields.SchemaField({
            in: new fields.SchemaField({ ...damageModifierSchema() }),
            out: new fields.SchemaField({ ...damageModifierSchema() })
        }),

        healing: new fields.SchemaField({
            in: new fields.NumberField({ ...uncappedInteger }),
            out: new fields.NumberField({ ...uncappedInteger })
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
        })
    }
}

const skillModifierSchema = () => {
    return {
        modifier: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        critThreshold: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        extraDice: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

const dieSizeModifierSchema = () => {
    return {
        minimum: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

const explodingModSchema = () => {
    return {
        max: new fields.BooleanField({ initial: false }),
        values: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
    }
}

const critModSchema = () => {
    return {
        extraDice: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        explodes: new fields.BooleanField({ initial: false })
    }
}

const damageModifierSchema = () => {
    return {
        all: new fields.NumberField({ ...uncappedInteger }),
        allPerDie: new fields.NumberField({ ...uncappedInteger }),
        attack: new fields.NumberField({ ...uncappedInteger }),
        attackPerDie: new fields.NumberField({ ...uncappedInteger }),
        spell: new fields.NumberField({ ...uncappedInteger }),
        spellPerDie: new fields.NumberField({ ...uncappedInteger })
    }
}