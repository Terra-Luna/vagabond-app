import { test } from "@jest/globals"
import { describe } from "@jest/globals"
import ContainerDataModel, { addItem, NOT_ENOUGH_SPACE_ERROR as NOT_ENOUGH_SPACE_ERROR, setEmptySlots } from "../../../../src/model/item/equip/ContainerDataModel"
import { expect } from "@jest/globals"
import EquipmentDataModel, { EquipmentSchema } from "../../../../src/model/item/equip/EquipmentDataModel"

describe('test contaianer properties', () => {
    test('test empty slots calc', () => {
        //Setup
        const container = {
            size: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }],
            emptySlots: 0
        }
        //Execute
        setEmptySlots(container as unknown as ContainerDataModel)
        //Verify
        expect(container.emptySlots).toEqual(2)
    })

    test('handles negative value', () => {
        //Setup
        const container = {
            size: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }, { slots: 3}],
            emptySlots: 0
        }
        //Execute
        setEmptySlots(container as unknown as ContainerDataModel)
        // Verify
        expect(container.emptySlots).toEqual(-1)
    })

    test('add item up to max capacity', () => {
        //Setup
        const container = {
            size: 3, items: [{ slots: 1 }, { slots: 1 }],
            emptySlots: 1
        }
        const item = { slots: 1 }
        //Execute
        addItem(
            container as unknown as ContainerDataModel,
            item as unknown as EquipmentDataModel<EquipmentSchema>
        )
        //  & Verify
        expect(container.items.length).toEqual(3)
    })

    test('add item throws error if no space', () => {
        //Setup
        const container = {
            size: 10, items: [{ slots: 1 }, { slots: 3 }, { slots: 4 }, { slots: 2 }],
            emptySlots: 0
        }
        const item = { slots: 1 }
        //Execute & Verify
        expect(() => {
            addItem(
                container as unknown as ContainerDataModel,
                item as unknown as EquipmentDataModel<EquipmentSchema>
            )
        }).toThrow(NOT_ENOUGH_SPACE_ERROR.message)
    })
})