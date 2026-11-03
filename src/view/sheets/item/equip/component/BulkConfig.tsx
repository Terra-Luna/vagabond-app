import { useCallback } from "react"

import { appLang } from "../../../../../util/lang"
import { Checkbox } from "../../../../component/Checkbox"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { EditModeContextProvider } from "../../../../wrappers/EditModeContextProvider"
import { ItemSheetProperty } from "./ItemSheetLabelComponent"

export const Bulk = ({ item }) => {
  const { isEditMode } = useEditMode()

  const onCheckStackable = useCallback(
    (isChecked) => {
      item.update({ "system.bulk.isStackable": isChecked })
    },
    [item.system.bulk?.isStackable],
  )

  return (
    <div>
      <ItemSheetProperty
        label={appLang.ItemSheet.slots}
        value={
          <EditableTextField
            boundValue={item.system.bulk?.slots}
            updateProps={{ object: item, path: ["bulk", "slots"] }}
            placeholder="0"
          />
        }
      />

      {isEditMode && !item.system.lightSourceData?.isLightSource && (
        <ItemSheetProperty
          label={appLang.ItemSheet.stackable}
          value={
            <Checkbox
              label={""}
              onCheckedChanged={onCheckStackable}
              checked={item.system.bulk?.isStackable}
            />
          }
        />
      )}

      {(isEditMode || item.system.bulk?.isStackable) &&
        !item.system.lightSourceData?.isLightSource && (
          <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <ItemSheetProperty
              label={appLang.ItemSheet.qty}
              value={
                <EditableTextField
                  boundValue={item.system.bulk?.quantity}
                  updateProps={{ object: item, path: ["bulk", "quantity"] }}
                  placeholder="1"
                />
              }
            />
          </EditModeContextProvider>
        )}

      {item.system.bulk?.isStackable && item.system.bulk?.slots === 0 && (
        <ItemSheetProperty
          label={appLang.ItemSheet.stackSize}
          value={
            <EditableTextField
              boundValue={item.system.bulk?.stackSize}
              updateProps={{ object: item, path: ["bulk", "stackSize"] }}
              placeholder="10"
            />
          }
        />
      )}
    </div>
  )
}
