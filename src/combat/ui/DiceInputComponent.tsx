import { useCallback } from "react"
import { DiceCountInput } from "../../view/sheets/actor/hero/tab/component/spellcasting/DiceCountInput"
import { DiceRoll } from "../engine/DiceRoll"
import { CustomDropDown } from "../../view/component/Dropdown"
import { NumericCounterInput } from "../../view/component/EditableTextField"
import { useEditMode } from "../../view/context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "../../view/sheets/item/equip/component/ItemSheetLabelComponent"
import { vgLiteLang } from "../../utils/lang"
import { CSVTextInput } from "../../view/component/CSVTextInput"
import { Plus } from "lucide-react"

export const DiceInputComponent = ({ label, diceRoll, onChange, editModeOverride = false }: {
    label: string, diceRoll: DiceRoll, onChange: (updatedFields: Partial<DiceRoll>) => void, editModeOverride?: boolean
}) => {
    const { isEditMode } = useEditMode()

    const updateDmgDice = useCallback((input: string | null) => {
        onChange({ count: Number(input) || 1 })
    }, [onChange])

    const updateFaces = useCallback((input: string) => {
        onChange({ faces: Number(input) || 0 })
    }, [onChange])

    const updateModifier = useCallback((input: string | null) => {
        onChange({ modifier: Number(input) || 0 })
    }, [onChange])

    const handleExplosionChange = useCallback((numbers: number[]) => {
        onChange({ explodesOn: numbers })
    }, [])

    const explosionValues = (diceRoll.explodesOn || []).map(Number).filter(n => !isNaN(n))

    return (
        <div className="flex text-base font-eskapade font-bold">
            {(isEditMode || editModeOverride) &&
                <div>
                    <ItemSheetPropLabel label={label} />
                    <div className="flex gap-x-1 items-end">

                        {/* DICE COUNT */}
                        <DiceCountInput dmgDice={diceRoll.count} onUpdateDmgDice={updateDmgDice} />

                        {/* DIE SIZE */}
                        <div>
                            <CustomDropDown
                                value={diceRoll.faces.toString()}
                                options={[
                                    { value: "1", label: "d1" },
                                    { value: "4", label: "d4" },
                                    { value: "6", label: "d6" },
                                    { value: "8", label: "d8" },
                                    { value: "10", label: "d10" },
                                    { value: "12", label: "d12" },
                                    { value: "20", label: "d20" },
                                ]}
                                onChange={(e) => updateFaces(e.target.value)}
                                className="pt-1"
                            />
                        </div>

                        {/* MODIFIER (FLAT BONUS) */}
                        <div className="flex items-center">
                            <Plus size={16} className="text-text-secondary" />
                            <NumericCounterInput
                                value={diceRoll.modifier || 0}
                                onChange={(input) => updateModifier(input)}
                            />
                        </div>
                    </div>

                    {/* EXPLOSIONS CONFIG */}
                    <div className="items-end">
                        <ItemSheetPropLabel label={vgLiteLang.ItemSheet.explodesOn + ":"} />
                        <CSVTextInput
                            value={explosionValues}
                            onChange={handleExplosionChange}
                            placeholder={"E.g., 6, 10"}
                            className="w-24"
                        />
                    </div>
                </div>
            }

            {/* DISPLAY MODE */}
            {!isEditMode && !editModeOverride &&
                <div>
                    {diceRoll.count > 0 && <>
                        <ItemSheetPropLabel label={label} />
                        <div className="flex items-end text-xl text-text-primary font-eskapade font-normal">
                            <p>{diceRoll.count}</p>
                            <p>d</p>
                            <p>{diceRoll.faces}</p>
                            {(diceRoll.modifier ?? 0) > 0 &&
                                <p> +{diceRoll.modifier}</p>
                            }
                            {diceRoll.explodesOn && diceRoll.explodesOn.length > 0 &&
                                <p className="ml-1">![{diceRoll.explodesOn.sort((a, b) => a - b).join(',')}]</p>
                            }
                        </div>
                    </>}
                </div>
            }
        </div>
            
    )
}