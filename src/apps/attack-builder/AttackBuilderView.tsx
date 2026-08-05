import { Save } from "lucide-react"
import { useEffect, useMemo } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
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
import { vgLiteLang } from "../../utils/lang"

export const AttackBuilderView = ({ actor, preset, setClosed }: { actor: Actor & { system: HeroDataModel }, preset?: AttackPreset, setClosed: () => void }) => {

    const weapons = useMemo((): (Item & { system: WeaponDataModel })[] => {
        return actor.items.filter(i => (i.type as string) === 'weapon' && isEquippedWeapon(i.system)) as any
    }, [actor])

    const { WeaponSelector, weapon, description, setWeapon, setDescription } = useWeaponSelector(weapons)

    const {
        CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold,
        setSkill, setD20Count, setFavorHinder, setSkillCheckMod, setCritThreshold
    } = useCustomSkillCheckBuilder(actor, weapon)

    const { CustomDamageRollBuilder, damageRolls, setDamageRolls } = useCustomDamageRollBuilder(weapon, preset)

    const {
        CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing,
        setFlatModifier, setPerDieBonus, setArmorPiercing
    } = useCustomDamageModifiersBuilder()

    useEffect(() => {
        if (preset) {
            setWeapon(weapons.find(w => w.id === preset.weaponId))
            setDescription(preset.description)
            setSkill(preset.skill)
            setD20Count(preset.d20Count)
            setFavorHinder(preset.favorHinder)
            setSkillCheckMod(preset.skillCheckMod)
            setCritThreshold(preset.critThreshold)
            setDamageRolls(preset.damageRolls)
            setFlatModifier(preset.flatModifier)
            setPerDieBonus(preset.perDieBonus)
            setArmorPiercing(preset.armorPiercing)
        }
    }, [])

    const newPreset = useMemo((): AttackPreset => {
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

    const { savePreset } = useSavePreset(actor, newPreset)

    return (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <Header title={"ATTACK"} />
            <div className="flex flex-col gap-y-2 p-1 border-2 border-solid border-t-0 border-table-border bg-sheet-main-fill rounded-b-sm">

                {/* EACH ATTACK CATEGORY BY USE-CASE */}
                {WeaponSelector}
                {CustomSkillCheckBuilder}
                {CustomDamageRollBuilder}
                {CustomDamageModifiersBuilder}

                {/* SAVE & CANCEL */}
                <div className="flex w-full justify-between">
                    <DestructiveButton onClick={setClosed}>
                        {vgLiteLang.ButtonActions.cancel}
                    </DestructiveButton>
                    <PrimaryButton onClick={() => savePreset(setClosed)} icon={<Save size={16} className="text-btn-primary-text" />}>
                        {vgLiteLang.ButtonActions.save}
                    </PrimaryButton>
                </div>
            </div>
        </EditModeContextProvider>
    )

}