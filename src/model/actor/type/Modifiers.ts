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
            attack: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] }),
            spellDamage: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] }),
            spellHealing: new fields.ArrayField(new fields.NumberField({ ...requiredInteger }), { initial: [] })
        }),

        saves: new fields.SchemaField({
            reflex: new fields.NumberField({ ...uncappedInteger }),
            endure: new fields.NumberField({ ...uncappedInteger }),
            will: new fields.NumberField({ ...uncappedInteger })
        })
    }
}