import { useState, useEffect, useCallback } from "react"
import { DiceRollSchema } from "../../../combat/engine/DiceRoll"
import { DiceInputComponent } from "../../../combat/ui/DiceInputComponent"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { SecondaryButton } from "../../../view/component/Button"
import { TrashButton } from "../../../view/component/TrashButton"
import { SectionLabel } from "../component/Labels"
import { AttackPreset } from "../AttackBuilderApp"

export const useCustomDamageRollBuilder = (weapon: (Item & { system: WeaponDataModel }) | undefined, preset?: AttackPreset) => {
    const [damageRolls, setDamageRolls] = useState<DiceRollSchema[]>([])

    useEffect(() => {
        if (!weapon || preset) return

        const schema = {
            count: weapon.system.damage.dice.count,
            faces: weapon.system.damage.dice.faces,
            modifier: weapon.system.damage.dice.modifier,
            explodesOn: weapon.system.damage.dice.explodesOn as number[]
        }

        if (damageRolls.length === 0) {
            setDamageRolls([schema])
        }
        else {
            const rolls = [...damageRolls]
            rolls[0] = schema
            setDamageRolls(rolls)
        }
    }, [weapon])

    const addNewRoll = useCallback(() => {
        const schema = { count: 1, faces: 4 }
        setDamageRolls(rolls => [...rolls, schema])
    }, [])

    const removeRoll = useCallback((index: number) => {
        setDamageRolls([...damageRolls].filter((_, rIdx) => rIdx !== index))
    }, [damageRolls])

    const handleDiceChange = useCallback((updatedDice: Partial<DiceRollSchema>, index: number) => {
        setDamageRolls(prevRolls =>
            prevRolls.map((roll, rIdx) => {
                if (rIdx === index) { return { ...roll, ...updatedDice } }
                return roll
            })
        )
    }, [])

    const CustomDamageRollBuilder =
        <div className="flex flex-col gap-2 items-start justify-between border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            <SectionLabel text={"Damage Rolls"} />
            <div className="flex items-end w-full">
                <div className="flex flex-col gap-y-2 items-end">
                    {damageRolls.length > 0 && damageRolls.map((roll, index) => (
                        <div key={index} className="flex gap-x-1 items-end">
                            <DiceInputComponent
                                diceRoll={roll}
                                onChange={(updated) => handleDiceChange(updated, index)}
                            />
                            <div className="pb-0.5">
                                <TrashButton onDelete={() => removeRoll(index)} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex w-full justify-end">
                    <SecondaryButton onClick={addNewRoll}>
                        {vgLiteLang.ButtonActions.add}
                    </SecondaryButton>
                </div>
            </div>
        </div>

    return { CustomDamageRollBuilder, damageRolls, setDamageRolls }
}