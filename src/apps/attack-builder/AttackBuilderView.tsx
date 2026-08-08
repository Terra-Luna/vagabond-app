import { Save, Sword } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../view/component/Button"
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
import { HeroAttack } from "../../combat/engine/HeroAttack"

export const AttackBuilderView = ({ actor, preset, showHeader = true, setClosed }: {
    actor: Actor & { system: HeroDataModel },
    preset?: AttackPreset,
    showHeader?: boolean,
    setClosed?: () => void
}) => {

    const weapons = useMemo((): (Item & { system: WeaponDataModel })[] => {
        return actor.items.filter(i => (i.type as string) === 'weapon' && isEquippedWeapon(i.system)) as any
    }, [actor])

    const { WeaponSelector, weapon, description, setWeapon, setDescription } = useWeaponSelector(weapons)
    const { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold, setSkill, setD20Count, setFavorHinder, setSkillCheckMod, setCritThreshold } = useCustomSkillCheckBuilder(actor, weapon)
    const { CustomDamageRollBuilder, damageRolls, setDamageRolls } = useCustomDamageRollBuilder(actor, weapon, preset)
    const { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing, setFlatModifier, setPerDieBonus, setArmorPiercing } = useCustomDamageModifiersBuilder()

    useEffect(() => {
        if (preset) {
            setWeapon(weapons.find(w => w.id === preset?.weaponId))
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
    }, [preset])

    const form = useMemo((): AttackPreset => {
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
        weapon, description, skill, d20Count, favorHinder, skillCheckMod,
        critThreshold, damageRolls, flatModifier, perDieBonus, armorPiercing
    ])

    useEffect(() => {
        if (!weapon) return
        const baseThreshold = 20
        const isKeen = weapon.system.properties.includes('keen')
        setCritThreshold(baseThreshold - (isKeen ? 1 : 0))
    }, [weapon])

    const reset = useCallback(() => {
        preset = undefined
        setDamageRolls([])
        setDescription('')
        setSkill("")
        setD20Count(1)
        setFavorHinder('none')
        setSkillCheckMod(0)
        setCritThreshold(20)
        setFlatModifier(0)
        setPerDieBonus(0)
        setArmorPiercing(0)
        setWeapon(undefined)
    }, [preset])

    const { savePreset, saveCustomAttack } = useSavePreset(actor, form)

    return (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            {showHeader && <Header title={"ATTACK"} />}

            <div className="flex flex-col gap-y-1 p-1 border-2 border-solid border-t-0 border-table-border bg-sheet-main-fill rounded-b-sm">
                {/* EACH ATTACK CATEGORY BY USE-CASE */}
                {WeaponSelector}
                {CustomSkillCheckBuilder}
                {CustomDamageRollBuilder}
                {CustomDamageModifiersBuilder}

                <div className="flex w-full justify-between">
                    {/* SAVE & CANCEL */}
                    {setClosed && <>
                        <DestructiveButton onClick={setClosed}>
                            {vgLiteLang.ButtonActions.cancel}
                        </DestructiveButton>

                        <div className="flex gap-x-1">
                            <SecondaryButton onClick={reset}>{vgLiteLang.ButtonActions.reset}</SecondaryButton>
                            <PrimaryButton onClick={() => savePreset(setClosed)} icon={<Save size={16} className="text-btn-primary-text" />}>
                                {vgLiteLang.ButtonActions.save}
                            </PrimaryButton>
                        </div>
                    </>}

                    {/* ATTACK BUTTON */}
                    {!setClosed && <div className="flex gap-x-1 ml-auto">
                        <SecondaryButton onClick={reset}>{vgLiteLang.ButtonActions.reset}</SecondaryButton>

                        <PrimaryButton onClick={async () => {
                            await saveCustomAttack()
                            HeroAttack.buildCustomAttack(actor, form)
                        }}
                            icon={<Sword size={16} className="text-btn-primary-text" />}>
                            {vgLiteLang.ButtonActions.attack}
                        </PrimaryButton>
                    </div>}
                </div>
            </div>
        </EditModeContextProvider>
    )

}