import { useCallback } from "react"

import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { appLang } from "../../../../../utils/lang"
import { Checkbox } from "../../../../component/Checkbox"

export const RationToggle = ({ item }: { item: Item & { system: SundryDataModel } }) => {
    const onCheckIsRation = useCallback((isChecked) => {
        item.update({ 'system.isRation': isChecked } as Record<string, boolean>)
    }, [item])
    return (
        <Checkbox
            label={appLang.ItemSheet.isRation}
            onCheckedChanged={onCheckIsRation}
            checked={item.system.isRation}
        />
    )
}