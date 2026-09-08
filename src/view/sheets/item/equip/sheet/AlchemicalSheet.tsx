import { useCallback } from "react"

import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { DiceRollInputComponent } from "../../../../../combat/ui/DiceRollInputComponent"
import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { appLang } from "../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemToggleOption } from "../component/ItemToggleOption"

export const AlchemicalSheet = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {

    const { isEditMode } = useEditMode()
    const damageDice = item.system.damage.dice as DiceRoll

    const handleDiceChange = useCallback((updatedDice: Partial<DiceRoll>) => {
        const newDice = { ...damageDice, ...updatedDice }
        item.update({ 'system.damage.dice': newDice } as Record<string, any>)
    }, [item, damageDice])

    return (
        <EquipmentSheetSubtypeBody>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-start">
                <DiceRollInputComponent
                    label={appLang.ItemSheet.damage}
                    diceRoll={damageDice}
                    onChange={handleDiceChange}
                    wrap={true}
                />
                {isEditMode || item.system.damage.type !== "none" && <DamageTypeSelector item={item} path={'system.damage.type'} />}
                {isEditMode && <ItemToggleOption item={item} label={appLang.ItemSheet.consumable} path={"system.isConsumable"} />}
                <AlechemyCategory item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const AlechemyCategory = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    return (
        <span className="font-normal">
            <DropDown
                label={appLang.ItemSheet.alchCategory}
                value={item.system.alchemyCategory}
                options={createDropdownEntriesFromObj(appLang.AlchemyCategories)}
                updateMechanism={{ updatePath: ['alchemyCategory'] }}
                parent={item}
            />
        </span>
    )
}