import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { fields, rangeOptions, requiredString } from "../../common/sharedSchemas"
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
        properties: new fields.ArrayField(
            new fields.StringField({
                ...requiredString, options: Object.values(lang.VGLITE.WeaponProps).map(it => it.name)
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
        material: new fields.StringField({ ...requiredString, initial: 'Standard', choices: Object.values(lang.VGLITE.Metals).map(it => it.name) }),
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

    override async prepareDerivedData() {
        super.prepareDerivedData()
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
    let openFists = 2 - fistWeapons.length
    let openHands = 2 - (heldWeapons.length === 0 ? 0 : (
        heldWeapons.length === 2 ? 2 : (
            heldWeapons[0].system.grip.state === '2H' ? 2 : 1
        )
    ))

    if (weapon.grip.style === 'F' && openFists > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'F' })
    }
    else if ((weapon.grip.style === '1H' || weapon.grip.style === 'V') && openHands > 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': '1H' })
    }
    else if (weapon.grip.style === '2H' && openHands > 1) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': '2H' })
    }
    else {
        ui.notifications?.warn("Cannot equip any more weapons!")
    }
}

/**
 * Toggles Versatile weapons between 1H and and 2H mode. If
 * the Hero doesn't have a free hand availalble, a UI warning
 * notification is shown to the user.
 * @param hero 
 * @param weapon 
 */
export async function toggleGripState(hero: HeroDataModel, weapon: WeaponDataModel) {
    if (weapon.grip.style === 'V') {
        if (weapon.grip.state === '1H') {
            const equppedWeapons = hero.parent.items.filter((it: any) => it.type === 'weapon' && it.system.isEquipped && it.system.grip.style != 'F')
            if (equppedWeapons.length > 1) {
                ui.notifications?.warn("Unequip another 1H weapon before 2-handing.")
            }
            else {
                weapon.parent.update({ 'system.grip.state': '2H' })
            }
        }
        else {
            weapon.parent.update({ 'system.grip.state': '1H' })
        }
    }
}