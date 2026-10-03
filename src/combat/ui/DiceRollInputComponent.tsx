import { ReactNode } from "react"

import { DiceRollSchema } from "../../apps/attack-builder/model/DieRollSchema"
import { Checkbox } from "../../view/component/Checkbox"
import { CSVTextInput } from "../../view/component/CSVTextInput"
import { NumericCounterInput } from "../../view/component/EditableTextField"
import { useEditMode } from "../../view/context/EditModeContext/Hooks"
import { DiceCountInput } from "../../view/sheets/actor/hero/tab/component/spellcasting/input/DiceCountInput"
import { ItemSheetPropLabel } from "../../view/sheets/item/equip/component/ItemSheetLabelComponent"
import { DiceRoll } from "../engine/roll/DiceRoll"
import { DieSizeSelector } from "./DieSizeSelector"

export const DiceRollInputComponent = ({ label, diceRoll, onChange, extendedSettings, TrashButton }: {
    label?: string,
    diceRoll: DiceRoll | DiceRollSchema,
    onChange: (updatedFields: Partial<DiceRoll>) => void,
    extendedSettings?: boolean,
    TrashButton?: ReactNode
}) => {
    const { isEditMode } = useEditMode()

    const explosionValues = (diceRoll.explodesOn || []).map(Number).filter(n => !isNaN(n))

    return (
        <div className="flex text-base font-eskapade font-bold">
            {isEditMode && <div>
                <ItemSheetPropLabel label={label} />
                <div className="flex flex-wrap items-end gap-0.5">
                    {/* DICE COUNT */}
                    <div title={"Dice count"}>
                        {!label && <p className="text-sm">Roll</p>}
                        <DiceCountInput dmgDice={diceRoll.count} onUpdateDmgDice={(input) => onChange({ count: Number(input) || 0 })} width="max-w-[2ch]" />
                    </div>

                    {/* DIE SIZE */}
                    <DieSizeSelector value={diceRoll?.faces?.toString() ?? ''} onChange={(input) => onChange({ faces: Number(input) || 0 })} />

                    {/* MODIFIER (FLAT BONUS) */}
                    <div title={"Flat modifier (can be negative)"} className="flex items-start text-lg">
                        <p>+</p>
                        <NumericCounterInput value={diceRoll.modifier || 0} onChange={(input) => onChange({ modifier: Number(input) || 0 })} width="max-w-[2ch]" />
                    </div>

                    {/* ON-CRIT & REROLL SETTINGS */}
                    {extendedSettings && <>
                        {/* EXPLOSIONS */}
                        <span title="Exploding dice values">
                            <ExplosionsInput explosionValues={explosionValues} handleExplosionChange={(values) => onChange({ explodesOn: values })} />
                        </span>
                        <span className="text-sm font-normal max-w-[8ch] leading-3" title="Only explode on a Critical hit">
                            <Checkbox
                                label="Crit only"
                                color="text-text-primary"
                                checked={diceRoll.explodeOnCritOnly ?? false}
                                onCheckedChanged={(isChecked) => onChange({ explodeOnCritOnly: isChecked })}
                            />
                        </span>

                        {/* EXTRA DICE ON CRIT */}
                        <div className="relative flex items-end" title="Extra dice on a Critical hit">
                            <span className="font-normal pointer-events-none absolute left-1 bottom-0.5 text-sm leading-3 max-w-[4ch]">Crit dice</span>
                            <DiceCountInput
                                dmgDice={diceRoll.extraDiceOnCrit ?? 0}
                                onUpdateDmgDice={(input) => onChange({ extraDiceOnCrit: input })}
                                width="max-w-[4.5ch]"
                            />
                        </div>

                        {/* REROLLS */}
                        <div className="relative flex items-end" title="Reroll on these values">
                            <span className="font-normal pointer-events-none absolute left-1 bottom-0.5 text-sm">RR</span>
                            <CSVTextInput
                                className="w-[12ch] pl-8"
                                value={diceRoll.reroll ?? []}
                                placeholder="E.g., 1, 2"
                                onChange={(input) => onChange({ reroll: input })}
                            />
                        </div>
                    </>}

                    <div className="ml-auto">{TrashButton}</div>
                </div>
            </div>}

            {/* DISPLAY MODE */}
            {!isEditMode &&
                <div>
                    {diceRoll.count > 0 && <>
                        <ItemSheetPropLabel label={label} />
                        <div className="flex items-end text-xl text-text-primary font-eskapade font-normal">
                            <p>{diceRoll.count}</p>
                            <p>d</p>
                            <p>{diceRoll.faces}</p>
                            {(diceRoll.modifier ?? 0) > 0 &&
                                <p>+{diceRoll.modifier}</p>
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
        <div title={`Explodes on: ${explosionValues.join(', ')}`} className="relative flex items-center mt-0.5">
            <span className="pointer-events-none absolute left-1 text-sm font-bold">!</span>
            <CSVTextInput
                value={explosionValues}
                onChange={handleExplosionChange}
                placeholder="E.g., 6, 10"
                className="max-w-[10ch] pl-3"
            />
        </div>
    )
}