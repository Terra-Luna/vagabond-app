import HeroDataModel from "../../actor/HeroDataModel"
import { fields, rangeOptions, requiredString } from "../../common/sharedSchemas"
import VgLiteError from "../../common/VgLiteError"
import EquipmentDataModel from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            oneHand: new fields.StringField({ required: false, initial: '1d4' }),
            twoHand: new fields.StringField({ required: false, initial: '1d4' })
        }),
        grip: new fields.SchemaField({
            style: new fields.StringField({
                required: false, initial: '1H', choices: ['1H', '2H', 'V', 'F']
            }),
            state: new fields.StringField({ required: true, initial: '1H', choices: ['1H', '2H', 'F'] })
        }),
        attackSkills: new fields.ArrayField(
            new fields.StringField({ initial: '', required: true }), { initial: ['melee'] }
        ),
        properties: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField({ ...requiredString }),
                description: new fields.StringField({ ...requiredString })
            }),
            { initial: [] }
        ),
        explodeData: new fields.SchemaField({
            canExplode: new fields.BooleanField({ initial: false }),
            explodesOn: new fields.ArrayField(
                new fields.NumberField({ integer: true, initial: 0, required: false }),
                { initial: [] }
            )
        }),
        isCrude: new fields.BooleanField({ initial: false })
    }
}

export type WeaponSchema = ReturnType<typeof weaponSchema> & EquipmentSchema

export default class WeaponDataModel extends EquipmentDataModel<WeaponSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...weaponSchema()
        }
    }

    override typeName: String = "Weapon"

    override onEquip(hero: HeroDataModel) {
        equipWeapon(hero, this)
    }

    override onUnEquip(hero: HeroDataModel) {
        unEquipWeapon(this)
    }

    override onUse() { }
}

export function equipWeapon(hero: HeroDataModel, weapon: WeaponDataModel) {
    const equippedWeapons = hero.inventory.container.items.filter(it => it.category === "Weapon" && it.isEquipped) as WeaponDataModel[]
    const nonFist = equippedWeapons.filter(it => it.grip.style !== 'F')
    
    if (weapon.grip.style === 'F' && equippedWeapons.filter(it => it.grip.state === 'F').length < 2) {
        weapon.isEquipped = true
        weapon.grip.state = 'F'
    }
    else if (weapon.grip.style === '2H' && nonFist.length == 0) {
        weapon.isEquipped = true
        weapon.grip.state = '2H'
    }
    else if ((weapon.grip.style === '1H' || weapon.grip.style === 'V') && nonFist.length < 2) {
        weapon.isEquipped = true
        weapon.grip.state = '1H'
    }
    else {
        throw new WeaponError({
            name: NOT_ENOUGH_HANDS_ERROR.name,
            message: NOT_ENOUGH_HANDS_ERROR.message
        })
    }
}

export function unEquipWeapon(weapon: WeaponDataModel) {
    weapon.isEquipped = false
}

export class WeaponError extends VgLiteError<string> { }
export const NOT_ENOUGH_HANDS_ERROR = { name: 'NOT_ENOUGH_HANDS_ERROR', message: 'Hands are full' }