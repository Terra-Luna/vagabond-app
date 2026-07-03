import { lang } from "../../../utils/lang"
import HeroDataModel from "../../actor/HeroDataModel"
import { damageTypeOptions, fields, rangeOptions, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const weaponSchema = () => {
    return {
        range: new fields.StringField({ ...rangeOptions(), required: false }),
        damage: new fields.SchemaField({
            oneHand: new fields.StringField({ required: false, initial: '1d4' }),
            twoHand: new fields.StringField({ required: false, initial: '1d4' }),
            type: new fields.StringField({ ...damageTypeOptions() })
        }),
        grip: new fields.SchemaField({
            style: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' }),
            state: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Grips), initial: 'H' })
        }),
        properties: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, choices: Object.keys(lang.VGLITE.WeaponProps)
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
        material: new fields.StringField({
            ...requiredString, initial: 'standard', choices: Object.keys(lang.VGLITE.Metals)
        })
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

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'weapons'
        })
    }

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.isConsumable = false
        this.bulk.isStackable = false
    }
}

/**
 * Shows a UI warning notification if the Hero doesn't have enough
 * free hands available to equip the given weapon.
 * @param hero
 * @param weapon 
 */
export async function equipWeapon(hero: HeroDataModel, weapon: WeaponDataModel) {
    const equippedWeapons = hero.parent.items.filter((it: any) => it.type === "weapon" && it.system.isEquipped)
    const fistWeapons = equippedWeapons.filter((it: any) => it.system.grip.style === 'F')
    const heldWeapons = equippedWeapons.filter((it: any) => it.system.grip.style !== 'F')
    const openFists = 2 - fistWeapons.length
    const openHands = 2 - (heldWeapons.length === 0 ? 0 : (
        heldWeapons.length === 2 ? 2 : (
            heldWeapons[0].system.grip.state === 'HH' ? 2 : 1
        )
    ))

    if (weapon.grip.style === 'F' && openFists > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'F' })
    }
    else if ((weapon.grip.style === 'H' || weapon.grip.style === 'V') && openHands > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'H' })
    }
    else if (weapon.grip.style === 'HH' && openHands > 1) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'HH' })
    }
    else {
        ui.notifications?.warn("Cannot equip any more weapons!")
    }
}

/**
 * Toggles Versatile weapons between H and and HH mode. If
 * the Hero doesn't have a free hand availalble, a UI warning
 * notification is shown to the user.
 * @param hero
 * @param weapon
 */
export async function toggleGripState(hero: HeroDataModel, weapon: WeaponDataModel) {
    if (weapon.grip.style === 'V') {
        if (weapon.grip.state === 'H') {
            const equppedWeapons = hero.parent.items.filter((it) =>
                it.type === 'weapon' && it.system.isEquipped && it.system.grip.style != 'F'
            )
            if (equppedWeapons.length > 1) {
                ui.notifications?.warn("Unequip another 1H weapon before 2-handing.")
            }
            else {
                weapon.parent.update({ 'system.grip.state': 'HH' })
            }
        }
        else {
            weapon.parent.update({ 'system.grip.state': 'H' })
        }
    }
}

export const gripStateDamage = (w: WeaponDataModel): string => {
    return w.grip.state === 'HH' ? w.damage.twoHand : w.damage.oneHand
}

export const isEquippedWWeapon = (item: any): boolean => {
    return item.parent.type === 'weapon' && item.isEquipped
}