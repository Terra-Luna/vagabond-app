import { fields, standardInteger, uncappedInteger } from "../../common/sharedSchemas"

/**
 * Keep this list in-sync with the helper texts in VgLiteActiveEffect.
 */
export const bonusSchema = () => {
    return {
        /**
         * Stat and resource bonuses...
         */
        maxHP: new fields.NumberField({ ...uncappedInteger }),
        maxMana: new fields.NumberField({ ...uncappedInteger }),
        maxCast: new fields.NumberField({ ...uncappedInteger }),
        armor: new fields.NumberField({ ...uncappedInteger }),
        speed: new fields.NumberField({ ...uncappedInteger }),
        inventorySlots: new fields.NumberField({ ...uncappedInteger }),

        /**
         * Stat bonuses...
         */
        might: new fields.NumberField({ ...uncappedInteger }),
        dexterity: new fields.NumberField({ ...uncappedInteger }),
        awareness: new fields.NumberField({ ...uncappedInteger }),
        reason: new fields.NumberField({ ...uncappedInteger }),
        presence: new fields.NumberField({ ...uncappedInteger }),
        luck: new fields.NumberField({ ...uncappedInteger }),

        /**
         * Skill Check bonuses...
         */
        reflex: new fields.NumberField({ ...uncappedInteger }),
        endure: new fields.NumberField({ ...uncappedInteger }),
        will: new fields.NumberField({ ...uncappedInteger }),
        brawl: new fields.NumberField({ ...uncappedInteger }),
        finesse: new fields.NumberField({ ...uncappedInteger }),
        melee: new fields.NumberField({ ...uncappedInteger }),
        ranged: new fields.NumberField({ ...uncappedInteger }),
        arcana: new fields.NumberField({ ...uncappedInteger }),
        craft: new fields.NumberField({ ...uncappedInteger }),
        detect: new fields.NumberField({ ...uncappedInteger }),
        influence: new fields.NumberField({ ...uncappedInteger }),
        leadership: new fields.NumberField({ ...uncappedInteger }),
        medicine: new fields.NumberField({ ...uncappedInteger }),
        mysticism: new fields.NumberField({ ...uncappedInteger }),
        performance: new fields.NumberField({ ...uncappedInteger }),
        sneak: new fields.NumberField({ ...uncappedInteger }),
        survival: new fields.NumberField({ ...uncappedInteger }),

        /**
         * Damage bonuses...
         */
        flatAtkDmg: new fields.NumberField({ ...uncappedInteger }),
        flatSpellDmg: new fields.NumberField({ ...uncappedInteger }),
        flatDamageReduction: new fields.NumberField({ ...uncappedInteger }),

        perDieAtkDmg: new fields.NumberField({ ...uncappedInteger }),
        perDieSpellDmg: new fields.NumberField({ ...uncappedInteger }),
        perDieDmgReduction: new fields.NumberField({ ...uncappedInteger })
    }
}