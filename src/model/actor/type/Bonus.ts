import { fields, uncappedInteger } from "../../common/sharedSchemas"

/**
 * Keep these lists in-sync with the helper texts in VgLiteActiveEffect.
 */
export const heroBonusSchema = () => {
    return {
        /**
         * Damage bonuses...
         */
        flatAtkDmg: new fields.NumberField({ ...uncappedInteger }),
        flatSpellDmg: new fields.NumberField({ ...uncappedInteger }),
        perDieAtkDmg: new fields.NumberField({ ...uncappedInteger }),
        perDieSpellDmg: new fields.NumberField({ ...uncappedInteger }),

        /**
         * Protective bonuses...
         */
        flatAtkDmgMitigation: new fields.NumberField({ ...uncappedInteger }),
        flatSpellDmgMitigation: new fields.NumberField({ ...uncappedInteger }),
        perDieAtkDmgMitigation: new fields.NumberField({ ...uncappedInteger }),
        perDieSpellDmgMitigation: new fields.NumberField({ ...uncappedInteger }),
        reflexSave: new fields.NumberField({ ...uncappedInteger }),
        endureSave: new fields.NumberField({ ...uncappedInteger }),
        willSave: new fields.NumberField({ ...uncappedInteger }),

    }
}