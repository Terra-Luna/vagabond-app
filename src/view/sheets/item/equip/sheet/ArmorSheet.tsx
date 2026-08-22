import { Shield } from "lucide-react"
import { useCallback } from "react"

import { ArmorDataModel } from "../../../../../model/item/equip/ArmorDataModel"
import { lang as fullLang } from "../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetProperty } from "../component/ItemSheetLabelComponent"
import { MaterialSelection } from "../component/MaterialSelectionComponent"
const lang = fullLang.VGLITE

export const ArmorSheet = ({ item }: { item: Item & { system: ArmorDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="space-y-4">
                <div className="flex gap-x-8 justify-between">
                    <ArmorType item={item} />
                    <ArmorRating item={item} />
                </div>
                <div className="flex justify-between items-center">
                    <ItemSheetProperty label={lang.ItemSheet.mitReq} value={item.system.mightReq} />
                    <MaterialSelection item={item} />
                </div>
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const ArmorType = ({ item }: { item: Item & { system: ArmorDataModel } }) => {
    const onUpdateArmorType = useCallback((type: string) => {
        const armorInfo = lang.ArmorTypes[type]
        item.update({
            'system.armorType': type,
            'system.bulk.slots': armorInfo.slots,
            'system.rating': armorInfo.rating,
            'system.mightReq': armorInfo.mitReq,
            'system.value': armorInfo.value
        } as Record<string, string>)
    }, [item.system.armorType])
    return (
        <DropDown
            label={lang.ItemSheet.armorType}
            value={item.system.armorType}
            options={createDropdownEntriesFromObj(lang.ArmorTypes)}
            updateMechanism={{ onChange: onUpdateArmorType }}
            parent={item}
        />
    )
}

const ArmorRating = ({ item }: { item: Item & { system: ArmorDataModel } }) => {
    return (
        <div className="text-text-primary justify-center">
            <div className="relative w-[52px] h-[52px]">
                <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-4xl text-text-armor font-eskapade font-bold`}>
                        <EditableTextField
                            boundValue={item.system.rating?.toString() ?? "0"}
                            updateProps={{ object: item, path: ['rating'] }}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}