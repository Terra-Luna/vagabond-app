import { AlchemicalItemDataModel } from "../../../../../model/item/equip/AlchemicalItemDataModel"
import { DropDown } from "../../../../component/Dropdown"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { vgLiteLang } from "../../../../../utils/lang"
import { ConsumableToggle } from "../component/ConsumableItemToggleComponent"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
import { DiceRollInputComponent } from "../../../../../combat/ui/DiceRollInputComponent"
import { useCallback } from "react"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"

export const AlchemicalSheet = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {

    const damageDice = item.system.damage.dice as DiceRoll

    const handleDiceChange = useCallback((updatedDice: Partial<DiceRoll>) => {
        const newDice = { ...damageDice, ...updatedDice }
        item.update({ 'system.damage.dice': newDice } as Record<string, any>)
    }, [item, damageDice])

    return (
        <EquipmentSheetSubtypeBody>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-start">
                <DiceRollInputComponent label={vgLiteLang.ItemSheet.damage} diceRoll={damageDice} onChange={handleDiceChange} />
                <DamageTypeSelector item={item} path={'system.damage.type'} />
                <ConsumableToggle item={item} />
                <AlechemyCategory item={item} />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}

const AlechemyCategory = ({ item }: { item: Item & { system: AlchemicalItemDataModel } }) => {
    return (
        <DropDown
            label={vgLiteLang.ItemSheet.alchCategory}
            value={item.system.alchemyCategory}
            options={createDropdownEntriesFromObj(vgLiteLang.AlchemyCategories)}
            updateMechanism={{ updatePath: ['alchemyCategory'] }}
            parent={item}
        />
    )
}