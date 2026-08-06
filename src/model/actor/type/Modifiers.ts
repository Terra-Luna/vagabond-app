import { fields, requiredInteger, uncappedInteger } from "../../common/sharedSchemas"

export const modifierSchema = () => {
    return {
        damage: new fields.SchemaField({
            all: new fields.NumberField({ ...uncappedInteger }),
            allPerDie: new fields.NumberField({ ...uncappedInteger }),
            attack: new fields.NumberField({ ...uncappedInteger }),
            attackPerDie: new fields.NumberField({ ...uncappedInteger }),
            spell: new fields.NumberField({ ...uncappedInteger }),
            spellPerDie: new fields.NumberField({ ...uncappedInteger })
        }),

        mitigation: new fields.SchemaField({
            all: new fields.NumberField({ ...uncappedInteger }),
            allPerDie: new fields.NumberField({ ...uncappedInteger }),
            attack: new fields.NumberField({ ...uncappedInteger }),
            attackPerDie: new fields.NumberField({ ...uncappedInteger }),
            spell: new fields.NumberField({ ...uncappedInteger }),
            spellPerDie: new fields.NumberField({ ...uncappedInteger })
        }),

        healing: new fields.SchemaField({
            in: new fields.NumberField({ ...uncappedInteger }),
            out: new fields.NumberField({ ...uncappedInteger })
        }),

        dice: new fields.SchemaField({
            size: new fields.SchemaField({
                melee: new fields.NumberField({ ...uncappedInteger }),
                ranged: new fields.NumberField({ ...uncappedInteger }),
                spell: new fields.NumberField({ ...uncappedInteger }),
                spellHealing: new fields.NumberField({ ...uncappedInteger })
            }),
            exploding: new fields.SchemaField({
                melee: new fields.BooleanField({ initial: false }),
                meleeCrit: new fields.BooleanField({ initial: false }),
                ranged: new fields.BooleanField({ initial: false }),
                rangedCrit: new fields.BooleanField({ initial: false }),
                spellCrit: new fields.BooleanField({ initial: false }),
                spell: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] }),
                spellHealing: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
            }),
            crit: new fields.SchemaField({
                attack: new fields.NumberField({ ...uncappedInteger })
            })
        }),

        skills: new fields.SchemaField({
            reflex: new fields.SchemaField({ ...skillModifierSchema() }),
            endure: new fields.SchemaField({ ...skillModifierSchema() }),
            will: new fields.SchemaField({ ...skillModifierSchema() }),
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
            ranged: new fields.SchemaField({ ...skillModifierSchema() })
        })
    }
}

const skillModifierSchema = () => {
    return {
        rollMod: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        critMod: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
        extraDice: new fields.NumberField({ ...uncappedInteger, initial: 0 }),
    }
}