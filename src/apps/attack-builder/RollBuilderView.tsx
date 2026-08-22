import { Dices, Save } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"

import { HeroAttack } from "../../combat/engine/HeroAttack"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { isEquippedWeapon,WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { Header } from "../../view/component/Header"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { RollPreset } from "./model/RollPreset"
import { useCustomDamageModifiersBuilder } from "./usecase/CustomDamageModsUseCase"
import { useCustomDamageRollBuilder } from "./usecase/CustomDamageRollUseCase"
import { useCustomSkillCheckBuilder } from "./usecase/CustomSkillCheckUseCase"
import { useSavePreset } from "./usecase/preset/SavePresetUseCase"
import { useWeaponSelector } from "./usecase/WeaponSelectorUseCase"

export const RollBuilderView = ({ actor, preset, showHeader = true, setClosed }: {
    actor: Actor & { system: HeroDataModel },
    preset?: RollPreset,
    showHeader?: boolean,
    setClosed?: () => void
}) => {

    const loadedPresetRef = useRef<string | null>(null)

    const weapons = useMemo((): (Item & { system: WeaponDataModel })[] => {
        return actor.items.filter(i => (i.type as string) === 'weapon' && isEquippedWeapon(i.system)) as any
    }, [actor])

    const { WeaponSelector, weapon, description, setWeapon, setDescription } = useWeaponSelector(weapons)
    const { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold, setSkill, setD20Count, setFavorHinder, setSkillCheckMod, setCritThreshold } = useCustomSkillCheckBuilder(actor, weapon)
    const { CustomDamageRollBuilder, damageRolls, setDamageRolls } = useCustomDamageRollBuilder(actor, weapon, preset)
    const { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing, setFlatModifier, setPerDieBonus, setArmorPiercing } = useCustomDamageModifiersBuilder()

    /**
     * Load initial preset values.
     */
    useEffect(() => {
        const presetSignature = preset ? `${preset.weaponId}-${preset.title}` : null

        if (preset && loadedPresetRef.current !== presetSignature) {
            loadedPresetRef.current = presetSignature
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
    }, [preset, weapons])

    /**
     * When a new weapon is selected organically, preload some defaults.
     */
    useEffect(() => {
        if (!weapon || !skill) return
        if (preset && weapon.id === preset.weaponId && skill === preset.skill) {
            return
        }

        const weaponAtk = HeroAttack.buildWeaponAttack(actor, weapon, skill)
        const skChk = weaponAtk.skillCheck
        const dmgRoll = weaponAtk.damageRoll
        if (!skChk || !dmgRoll) return

        setD20Count(skChk.d20Count)
        setFavorHinder(skChk.favorHinder)
        setSkillCheckMod(skChk.modifier)
        setCritThreshold(skChk.critThreshold)
        setDamageRolls(dmgRoll.dice.map(d => ({ ...d })))

    }, [weapon, skill, preset])

    const rollForm = useMemo((): RollPreset => {
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

    const reset = useCallback(() => {
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
    }, [])

    const { savePreset, saveCustomRoll } = useSavePreset(actor, rollForm)

    return (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            {showHeader && <Header title={"BUILD ROLL PRESET"} />}

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

                    {/* ROLL BUTTON */}
                    {!setClosed && <div className="flex gap-x-1 ml-auto">
                        <SecondaryButton onClick={reset}>{vgLiteLang.ButtonActions.reset}</SecondaryButton>

                        <PrimaryButton onClick={async () => {
                            await saveCustomRoll()
                            HeroAttack.buildCustomRoll(actor, rollForm)
                        }}
                            icon={<Dices size={16} className="text-btn-primary-text" />}>
                            {vgLiteLang.ButtonActions.roll}
                        </PrimaryButton>
                    </div>}
                </div>
            </div>
        </EditModeContextProvider>
    )

}