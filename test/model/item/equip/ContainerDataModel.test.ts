import { test } from "@jest/globals"
import { describe } from "@jest/globals"
import ContainerDataModel, { addItem, CONTAINER_NESTING_ERROR, NOT_ENOUGH_SPACE_ERROR as NOT_ENOUGH_SPACE_ERROR, setEmptySlots } from "../../../../src/model/item/equip/ContainerDataModel"
import { expect } from "@jest/globals"
import ArmorDataModel from "../../../../src/model/item/equip/ArmorDataModel"
import WeaponDataModel from "../../../../src/model/item/equip/WeaponDataModel"

describe('test contaianer properties', () => {
    test('test empty slots calc', () => {
        //Setup
        const container = {
            capacity: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }], emptySlots: 0
        }
        //Execute
        setEmptySlots(container as unknown as ContainerDataModel)
        //Verify
        expect(container.emptySlots).toEqual(2)
    })

    test('handles negative value', () => {
        //Setup
        const container = {
            capacity: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }, { slots: 3}], emptySlots: 0
        }
        //Execute
        setEmptySlots(container as unknown as ContainerDataModel)
        //Verify
        expect(container.emptySlots).toEqual(-1)
    })

    test('add item up to max capacity', () => {
        //Setup
        const container = {
            capacity: 3, items: [{ slots: 1 }, { slots: 1 }], emptySlots: 1
        }
        const item = { slots: 1 }
        //Execute
        addItem(
            container as unknown as ContainerDataModel,
            item as unknown as WeaponDataModel
        )
        //Verify
        expect(container.items.length).toEqual(3)
    })

    test('add item throws error if no space', () => {
        //Setup
        const container = {
            capacity: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }, { slots: 2 }], emptySlots: 0
        }
        const item = { slots: 1 }
        //Execute & Verify
        expect(() => {
            addItem(
                container as unknown as ContainerDataModel,
                item as unknown as ArmorDataModel
            )
        }).toThrow(NOT_ENOUGH_SPACE_ERROR.message)
    })

    test('container nesting not allowed', () => {
        //Setup
        const containerA = {
            capacity: 10, items: [{ slots: 1 }], emptySlots: 9
        }
        const containerB = {
            slots: 1, capacity: 10, items: [{ slots: 1 }], emptySlots: 9, typeName: "Container"
        }
        //Execute & Verify
        expect(() => {
            addItem(
                containerA as unknown as ContainerDataModel,
                containerB as unknown as ContainerDataModel
            )
        }).toThrow(CONTAINER_NESTING_ERROR.message)
    })

    test('container nesting override', () => {
        //Setup
        const containerA = {
            slots: 2, capacity: 2, items: [{ slots: 1 }], emptySlots: 1
        }
        const containerB = {
            slots: 1, capacity: 1, items: [{ slots: 1 }], emptySlots: 1, typeName: "Container"
        }
        //Execute
        addItem(
            containerA as unknown as ContainerDataModel,
            containerB as unknown as ContainerDataModel,
            true
        )
        expect(containerA.items.length).toEqual(2)
    })

})