import { useEffect } from "react"
import { VGLITE as lang } from "../../../../../../public/lang/en.json"
import ArmorDataModel from "../../../../../model/item/equip/ArmorDataModel"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { EquipmentSheetSubtypeBody, ItemSheetProperty, Material } from "../EquipmentSheet"
import { Shield } from "lucide-react"
import { EditableTextField } from "../../../../component/EditableTextField"

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
                    <Material item={item} />
                </div>
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const ArmorType = ({ item }: { item: Item & { system: ArmorDataModel } }) => {
    useEffect(() => {
        const armorInfo = lang.ArmorTypes[item.system.armorType]
        item.update({
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
            updateMechanism={{ updatePath: ['armorType'] }}
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