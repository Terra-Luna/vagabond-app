import { useCallback } from "react"

import { appLang } from "../../../../../utils/lang"
import { Checkbox } from "../../../../component/Checkbox"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetProperty } from "./ItemSheetLabelComponent"

export const Bulk = ({ item }) => {
    const { isEditMode } = useEditMode()

    const onCheckStackable = useCallback((isChecked) => {
        item.update({ 'system.bulk.isStackable': isChecked })
    }, [item.system.bulk?.isStackable])

    return (
        <div>
            <ItemSheetProperty label={appLang.ItemSheet.slots} value={
                <EditableTextField
                    boundValue={item.system.bulk?.slots}
                    updateProps={{ object: item, path: ['bulk', 'slots'] }}
                    placeholder="0"
                />
            } />

            {isEditMode &&
                <ItemSheetProperty label={appLang.ItemSheet.stackable} value={
                    <Checkbox
                        label={''}
                        onCheckedChanged={onCheckStackable}
                        checked={item.system.bulk?.isStackable}
                    />
                } />
            }

            {item.system.bulk?.isStackable && item.system.bulk?.slots === 0 &&
                <ItemSheetProperty label={appLang.ItemSheet.stackSize} value={
                    <EditableTextField
                        boundValue={item.system.bulk?.stackSize}
                        updateProps={{ object: item, path: ['bulk', 'stackSize'] }}
                        placeholder="10"
                    />
                } />
            }

            {(isEditMode || item.system.bulk?.isStackable) &&
                <ItemSheetProperty label={appLang.ItemSheet.qty} value={
                    <EditableTextField
                        boundValue={item.system.bulk?.quantity}
                        updateProps={{ object: item, path: ['bulk', 'quantity'] }}
                        placeholder="1"
                    />
                } />
            }

        </div>
    )
}