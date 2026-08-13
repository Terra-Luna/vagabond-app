import { useState, useEffect, useCallback } from "react"
import { DiceRoll, DiceRollSchema } from "../../../combat/engine/DiceRoll"
import { DiceRollInputComponent } from "../../../combat/ui/DiceRollInputComponent"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { SecondaryButton } from "../../../view/component/Button"
import { TrashButton } from "../../../view/component/TrashButton"
import { SectionLabel } from "../component/Labels"
import { RollPreset } from "../RollBuilderApp"
import { Plus } from "lucide-react"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"

export const useCustomDamageRollBuilder = (
    actor: Actor & { system: HeroDataModel },
    weapon: (Item & { system: WeaponDataModel }) | undefined,
    preset?: RollPreset
) => {

    const [damageRolls, setDamageRolls] = useState<DiceRollSchema[]>([])
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

    useEffect(() => {
        if (!weapon) return

        const schema = DiceRoll.getWeaponDamageWithHeroMods(actor.system, preset?.skill ?? '', weapon.system)

        if (damageRolls.length === 0) {
            setDamageRolls([schema])
        }
        else {
            if (preset && isInitialLoad) {
                setIsInitialLoad(false)
                return
            }
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
        <div className="flex flex-col items-start justify-between border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            <SectionLabel text={"Damage Rolls"} />
            <div className="flex items-end w-full">
                <div className="flex flex-col gap-y-2 items-end">
                    {damageRolls.length > 0 && damageRolls.map((roll, index) => (
                        < div key={index} className="flex gap-x-1 items-center" >
                            <DiceRollInputComponent
                                diceRoll={roll}
                                onChange={(updated) => handleDiceChange(updated, index)}
                                extendedSettings={true}
                                TrashButton={<TrashButton onDelete={() => removeRoll(index)} />}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex w-full justify-end">
                    <SecondaryButton onClick={addNewRoll} icon={<Plus size={16} />}>
                        {vgLiteLang.ButtonActions.add}
                    </SecondaryButton>
                </div>
            </div>
        </div>

    return { CustomDamageRollBuilder, damageRolls, setDamageRolls }
}