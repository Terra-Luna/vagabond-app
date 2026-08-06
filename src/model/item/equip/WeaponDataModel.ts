import { DiceRoll, DiceRollSchema } from "../../../combat/engine/DiceRoll"
import { lang } from "../../../utils/lang"
import { HeroDataModel } from "../../actor/HeroDataModel"
import { damageTypeOptions, fields, rangeOptions, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            dice: new fields.SchemaField({
                count: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
                faces: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1, max: 20 }),
                modifier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                explodesOn: new fields.ArrayField(
                    new fields.NumberField({ integer: true, initial: 0, required: false }),
                    { initial: [] }
                )
            }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        grip: new fields.SchemaField({
            style: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' }),
            state: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' })
        }),
        skills: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: [...Object.keys(lang.VGLITE.WeaponSkills)]
            }),
            { initial: [] }
        ),
        properties: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponProps)
            }),
            { initial: [] }
        ),
        material: new fields.StringField({
            ...requiredString, initial: 'steel', choices: Object.keys(lang.VGLITE.Metals)
        })
    }
}

export type WeaponSchema = ReturnType<typeof weaponSchema> & EquipmentSchema

export class WeaponDataModel extends EquipmentDataModel<WeaponSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...weaponSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'weapons'
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.isConsumable = false
        this.bulk.isStackable = false
    }
}

export const isEquippedWeapon = (item: any): boolean => {
    return item.parent.type === 'weapon' && item.isEquipped
}

export const gripStateDamage = (hero: HeroDataModel, weapon: WeaponDataModel): string => {
    const roll = getWeaponDamageWithHeroMods(hero, weapon)
    if (weapon.grip.style === 'V' && weapon.grip.state === 'HH') {
        roll.faces += 2
    }
    return new DiceRoll(roll).toRollFormula()
}

export const getWeaponDamageWithHeroMods = (hero: HeroDataModel, weapon: WeaponDataModel): DiceRollSchema => {
    const isRangedWeapon = weapon.skills.includes('ranged')
    const mods = hero.modifiers
    const dieSizeMod = isRangedWeapon
        ? mods.dice.size.ranged
        : mods.dice.size.melee

    const dieSize = weapon.damage.dice.faces + (dieSizeMod ?? 0)

    const explMod = isRangedWeapon
        ? mods.dice.exploding.ranged || mods.dice.exploding.rangedCrit
        : mods.dice.exploding.melee || mods.dice.exploding.meleeCrit

    const explodesOn = explMod
        ? [...new Set([...(weapon.damage.dice.explodesOn as number[] || []), dieSize])].sort((a, b) => a - b)
        : weapon.damage.dice.explodesOn as number[]

    const critOnly = isRangedWeapon
        ? mods.dice.exploding.rangedCrit && !mods.dice.exploding.ranged
        : mods.dice.exploding.meleeCrit && !mods.dice.exploding.melee

    return {
        count: weapon.damage.dice.count,
        faces: dieSize,
        modifier: weapon.damage.dice.modifier,
        explodesOn: explodesOn,
        explodeOnCritOnly: critOnly
    }
}