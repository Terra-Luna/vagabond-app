import { Save, Sword } from "lucide-react"
import { useCallback, useMemo } from "react"
import { DamageRoll } from "../../combat/engine/DamageRoll"
import { DiceRoll } from "../../combat/engine/DiceRoll"
import { HeroAttack } from "../../combat/engine/HeroAttack"
import { SkillCheck } from "../../combat/engine/SkillCheck"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { getTargetIds } from "../../utils/modelUtil"
import { PrimaryButton } from "../../view/component/Button"
import { Header } from "../../view/component/Header"
import { useWeaponSelector } from "./usecase/WeaponSelectorUseCase"
import { useCustomSkillCheckBuilder } from "./usecase/CustomSkillCheckUseCase"
import { WeaponDataModel, isEquippedWeapon } from "../../model/item/equip/WeaponDataModel"
import { useCustomDamageRollBuilder } from "./usecase/CustomDamageRollUseCase"
import { useCustomDamageModifiersBuilder } from "./usecase/CustomDamageModsUseCase"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { useSavePreset } from "./usecase/preset/SavePresetUseCase"
import { AttackPreset } from "./AttackBuilderApp"

export const AttackBuilderView = ({ actor, setClosed }: { actor: Actor & { system: HeroDataModel }, setClosed: () => void }) => {

    const weapons = useMemo((): (Item & { system: WeaponDataModel })[] => {
        return actor.items.filter(i => (i.type as string) === 'weapon' && isEquippedWeapon(i.system)) as any
    }, [actor])

    const { WeaponSelector, weapon, description } = useWeaponSelector(weapons)
    const { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold } = useCustomSkillCheckBuilder(actor, weapon)
    const { CustomDamageRollBuilder, damageRolls } = useCustomDamageRollBuilder(weapon)
    const { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing } = useCustomDamageModifiersBuilder()

    const preset = useMemo((): AttackPreset => {
        return {
            title: weapon?.name ?? '',
            description: description,
            weaponId: weapon?.id ?? '',
            skill: skill,
            armorPiercing: armorPiercing,
            critThreshold: critThreshold,
            d20Count: d20Count,
            damageRolls: damageRolls,
            favorHinder: favorHinder,
            flatModifier: flatModifier,
            perDieBonus: perDieBonus,
            skillCheckMod: skillCheckMod,
        }
    }, [
        weapon, description, skill, d20Count, favorHinder, skillCheckMod, critThreshold,
        damageRolls, flatModifier, perDieBonus, armorPiercing
    ])

    const { savePreset } = useSavePreset(actor, preset)

    return (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <Header title={"ATTACK"} />
                <div className="flex flex-col gap-y-2 p-1 border-2 border-solid border-t-0 border-table-border bg-sheet-main-fill rounded-b-sm">
                    {WeaponSelector}
                    {CustomSkillCheckBuilder}
                    {CustomDamageRollBuilder}
                    {CustomDamageModifiersBuilder}
                    <div className="flex items-end w-full justify-end">
                    <PrimaryButton onClick={() => savePreset(setClosed)} icon={<Save size={16} className="text-btn-primary-text" />}>
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </EditModeContextProvider>
    )

}