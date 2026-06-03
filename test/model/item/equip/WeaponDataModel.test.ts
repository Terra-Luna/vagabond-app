import { describe, expect, test } from "@jest/globals"
import WeaponDataModel, { equipWeapon, NOT_ENOUGH_HANDS_ERROR, unEquipWeapon } from "../../../../src/model/item/equip/WeaponDataModel"
import HeroDataModel from "../../../../src/model/actor/HeroDataModel"

describe('test weapons functions', () => {
    test('equip weapon use cases', () => {
        //Setup
        const caestusA = { category: 'Weapon', grip: { style: 'F', state: 'F' }, isEquipped: false }
        const caestusB = { category: 'Weapon', grip: { style: 'F', state: 'F' }, isEquipped: false }
        const caestusC = { category: 'Weapon', grip: { style: 'F', state: 'F' }, isEquipped: false }
        const daggerA = { category: 'Weapon', grip: { style: '1H', state: '1H' }, isEquipped: false }
        const daggerB = { category: 'Weapon', grip: { style: '1H', state: '1H' }, isEquipped: false }
        const daggerC = { category: 'Weapon', grip: { style: '1H', state: '1H' }, isEquipped: false }
        const longSwordA = { category: 'Weapon', grip: { style: 'V', state: '1H' }, isEquipped: false }
        const longSwordB = { category: 'Weapon', grip: { style: 'V', state: '1H' }, isEquipped: false }
        const greatSwordA = { category: 'Weapon', grip: { style: '2H', state: '2H' }, isEquipped: false }
        const greatSwordB = { category: 'Weapon', grip: { style: '2H', state: '2H' }, isEquipped: false }
        const hero = {
            inventory: {
                items: [caestusA, caestusB, caestusC, daggerA, daggerB, daggerC, longSwordA, longSwordB, greatSwordA, greatSwordB]
            }
        }

        //Equip dagger
        equipWeapon(hero as unknown as HeroDataModel, daggerA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(1)
        
        //Equip caestus
        equipWeapon(hero as unknown as HeroDataModel, caestusA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(2)

        //Equip greatSword (error)
        expect(() => {
            equipWeapon(hero as unknown as HeroDataModel, greatSwordA as unknown as WeaponDataModel)
        }).toThrow(NOT_ENOUGH_HANDS_ERROR.message)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(2)
        
        //Equip longsword
        equipWeapon(hero as unknown as HeroDataModel, longSwordA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(3)
        
        //Equip 2nd caestus
        equipWeapon(hero as unknown as HeroDataModel, caestusB as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(4)
        
        //Equip 3rd caestus (error)
        expect(() => {
            equipWeapon(hero as unknown as HeroDataModel, caestusC as unknown as WeaponDataModel)
        }).toThrow(NOT_ENOUGH_HANDS_ERROR.message)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(4)

        //Un-equip dagger and longsword
        unEquipWeapon(daggerA as unknown as WeaponDataModel)
        unEquipWeapon(longSwordA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(2)

        //Equip 2 'V' weapons
        equipWeapon(hero as unknown as HeroDataModel, longSwordA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(3)
        equipWeapon(hero as unknown as HeroDataModel, longSwordB as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(4)

        //Unequip swords
        unEquipWeapon(longSwordA as unknown as WeaponDataModel)
        unEquipWeapon(longSwordB as unknown as WeaponDataModel)

        //Equip greatSword
        equipWeapon(hero as unknown as HeroDataModel, greatSwordA as unknown as WeaponDataModel)
        expect(hero.inventory.items.filter(it => it.isEquipped).length).toEqual(3)
        expect(() => {
            equipWeapon(hero as unknown as HeroDataModel, greatSwordB as unknown as WeaponDataModel)
        }).toThrow(NOT_ENOUGH_HANDS_ERROR.message)

        //Unequip greatswords
        unEquipWeapon(greatSwordA as unknown as WeaponDataModel)
        unEquipWeapon(greatSwordB as unknown as WeaponDataModel)

        //Equip too many daggers
        equipWeapon(hero as unknown as HeroDataModel, daggerA as unknown as WeaponDataModel)
        equipWeapon(hero as unknown as HeroDataModel, daggerB as unknown as WeaponDataModel)
        expect(() => {
            equipWeapon(hero as unknown as HeroDataModel, daggerC as unknown as WeaponDataModel)
        }).toThrow(NOT_ENOUGH_HANDS_ERROR.message)
    })
})