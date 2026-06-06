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

    /**
     * May have some issues with these derivatiosn being self-referrenctial.
     * If that's the case, re-work it and add new props such as "finalSlots"
     * or something.
     */
    override async prepareDerivedData() {
        if (this.material === 'Adamant') {
            this.bonus.flatAtkDmg! += 1
            this.bonus.slots! += 1
        }
        else if (this.material === "Mythral") {
            this.bonus.slots! -= 1
        }

        super.prepareDerivedData()
    }
}

export async function equipWeapon(hero: HeroDataModel, weapon: WeaponDataModel) {
    const equippedWeapons = hero.parent.items.filter((it: any) =>
        it.type === "weapon" && it.system.isEquipped
    )
    const nonFist = equippedWeapons.filter((it: any) => it.system.grip.style !== 'F')

    if (weapon.grip.style === 'F' && equippedWeapons.filter((it: any) => it.system.grip.state === 'F').length < 2) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': 'F' })
    }
    else if (weapon.grip.style === '2H' && nonFist.length == 0) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': '2H' })
    }
    else if ((weapon.grip.style === '1H' || weapon.grip.style === 'V') && nonFist.length < 2) {
        weapon.parent.update({ 'system.isEquipped': true })
        weapon.parent.update({ 'system.grip.state': '1H' })
    }
    else {
        ui.notifications?.warn("Cannot equip any more weapons!")
    }
}

export async function toggleGripState(hero: HeroDataModel, weapon: WeaponDataModel) {
    if (weapon.grip.style === 'V') {
        weapon.parent.update({ 'system.grip.state': weapon.grip.state === '1H' ? '2H' : '1H' })
    }
}