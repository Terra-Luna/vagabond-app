import { ReactNode, useCallback } from "react"
import { DiceCountInput } from "../../view/sheets/actor/hero/tab/component/spellcasting/DiceCountInput"
import { DiceRoll, DiceRollSchema } from "../engine/roll/DiceRoll"
import { NumericCounterInput } from "../../view/component/EditableTextField"
import { useEditMode } from "../../view/context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "../../view/sheets/item/equip/component/ItemSheetLabelComponent"
import { vgLiteLang } from "../../utils/lang"
import { CSVTextInput } from "../../view/component/CSVTextInput"
import { Plus } from "lucide-react"
import { Checkbox } from "../../view/component/Checkbox"
import { DieSizeSelector } from "./DieSizeSelector"

export const DiceRollInputComponent = ({ label, diceRoll, onChange, wrap = false, editModeOverride = false, extendedSettings, TrashButton }: {
    label?: string,
    diceRoll: DiceRoll | DiceRollSchema,
    onChange: (updatedFields: Partial<DiceRoll>) => void,
    wrap?: boolean,
    editModeOverride?: boolean,
    extendedSettings?: boolean,
    TrashButton?: ReactNode
}) => {
    const { isEditMode } = useEditMode()

    const updateDmgDice = useCallback((input: string | null) => {
        onChange({ count: Number(input) || 0 })
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

    const handleExtraDiceOnCritChange = useCallback((value: number) => {
        onChange({ extraDiceOnCrit: value })
    }, [])

    const handleExplodeOnCritOnlyChange = useCallback((isChecked: boolean) => {
        onChange({ explodeOnCritOnly: isChecked })
    }, [])

    const explosionValues = (diceRoll.explodesOn || []).map(Number).filter(n => !isNaN(n))

    return (
        <div className="flex text-base font-eskapade font-bold">
            {(isEditMode || editModeOverride) &&
                <div>
                    {label && <ItemSheetPropLabel label={label} />}

                    <div className="flex gap-x-1 items-end">

                        {/* DICE COUNT */}
                        <div title={"Dice count"}>
                            {!label && <p className="text-sm">Roll</p>}
                            <DiceCountInput dmgDice={diceRoll.count} onUpdateDmgDice={updateDmgDice} />
                        </div>

                        {/* DIE SIZE */}
                        <DieSizeSelector value={diceRoll?.faces?.toString() ?? ''} onChange={updateFaces} />

                        {/* MODIFIER (FLAT BONUS) */}
                        <div title={"Flat modifier (can be negative)"} className="flex items-center text-xl">
                            <Plus size={16} className="text-text-secondary" />
                            <NumericCounterInput
                                value={diceRoll.modifier || 0}
                                onChange={(input) => updateModifier(input)}
                            />
                        </div>

                        {/* EXPLOSIONS CONFIG */}
                        {!wrap && <ExplosionsInput explosionValues={explosionValues} handleExplosionChange={handleExplosionChange} />}
                        <div>{TrashButton}</div>

                    </div>

                    {/* EXPLOSIONS CONFIG */}
                    {wrap && <ExplosionsInput explosionValues={explosionValues} handleExplosionChange={handleExplosionChange} />}

                    {/* ON-CRIT SETTINGS */}
                    {extendedSettings &&
                        <div className="flex gap-x-8 justify-between items-center font-normal mt-0.5 pr-6">
                            <div title={"Adds additional damage dice on crit."} className="flex gap-x-1 items-end">
                                <DiceCountInput dmgDice={diceRoll.extraDiceOnCrit || 0} onUpdateDmgDice={(input) => handleExtraDiceOnCritChange(input)} />
                                <p className="text-sm">{vgLiteLang.ItemSheet.extraDieOnCrit}</p>
                            </div>

                            {explosionValues.length > 0 && <div title={"Dice explode on crit only"} className="flex gap-x-1">
                                <Checkbox label="" checked={diceRoll.explodeOnCritOnly ?? false} onCheckedChanged={handleExplodeOnCritOnlyChange} />
                                <p>{vgLiteLang.ItemSheet.explodeOnCritOnly}</p>
                            </div>}
                        </div>
                    }

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

const ExplosionsInput = ({ explosionValues, handleExplosionChange }) => {
    return (
        <div title={"Explodes on..."} className="flex items-center mt-0.5">
            <p className="text-sm font-normal">❗</p>
            <CSVTextInput
                value={explosionValues}
                onChange={handleExplosionChange}
                placeholder={"E.g., 6, 10"}
                className="w-20"
            />
        </div>
    )
}