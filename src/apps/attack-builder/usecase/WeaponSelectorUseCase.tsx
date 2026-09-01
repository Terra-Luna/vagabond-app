import { useEffect,useState } from "react"

import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { CustomDropDown } from "../../../view/component/Dropdown"
import { SectionLabel } from "../component/Labels"
import { TextInput } from "../component/TextInput"

export const useWeaponSelector = (weapons: (Item & { system: WeaponDataModel })[]) => {
    const [weapon, setWeapon] = useState<Item & { system: WeaponDataModel }>()
    const [description, setDescription] = useState<string>("")

    useEffect(() => { if (weapons.length > 0) { setWeapon(weapons[0]) } }, [])

    const WeaponSelector =
        <div className={`bg-context-menu-fill/40 p-1 space-y-1 overflow-hidden ${tableBorderRounded}`}>
            <SectionLabel text={"Weapon"} />

            {/* WEAPON SELECTION DROPDOWN & DESCRIPTION */}
            <div className="flex gap-x-0.5 items-end">
                <CustomDropDown
                    value={weapon?.uuid ?? ''}
                    options={[
                        { value: '', label: "-" },
                        ...weapons?.map(w => ({ value: w.uuid, label: w.name })) ?? []
                    ]}
                    onChange={(e) => setWeapon(weapons.find(w => w.uuid === e.target.value))}
                    className="text-sm"
                />
                
                <TextInput value={description} placeholder={"Description..."} onChange={setDescription} />
                
            </div>
        </div>
    
    return { WeaponSelector, weapon, description, setWeapon, setDescription }
}