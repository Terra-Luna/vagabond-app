import { useCallback, useEffect, useMemo, useState } from "react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { isEquippedWeapon, WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { CustomDropDown } from "../../../../component/Dropdown"
import { NumericCounterInput } from "../../../../component/EditableTextField"
import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntriesFromObj } from "../../../../../utils/localeUtils"
import { HeroAttack } from "../../../../../combat/engine/HeroAttack"
import { DiceInputComponent } from "../../../../../combat/ui/DiceInputComponent"
import { DiceRoll, DiceRollSchema } from "../../../../../combat/engine/DiceRoll"
import { PrimaryButton, SecondaryButton } from "../../../../component/Button"
import { TrashButton } from "../../../../component/TrashButton"
import { ShieldBan, Sword } from "lucide-react"
import { CollapsibleSection } from "../../../../component/Collapsible"
import { getTargetIds } from "../../../../../utils/modelUtil"
import { SkillCheck } from "../../../../../combat/engine/SkillCheck"
import { DamageRoll } from "../../../../../combat/engine/DamageRoll"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {

    const weapons = useMemo((): (Item & { system: WeaponDataModel })[] => {
        return actor.items.filter(i => (i.type as string) === 'weapon' && isEquippedWeapon(i.system)) as any
    }, [actor])

    const isCaster = useMemo((): boolean => {
        return actor.system.spells.length > 0
    }, [actor])

    return (
        <div className="pb-24">
            {weapons.length > 0 && <WeaponAttackMenu actor={actor} weapons={weapons} />}
            {isCaster && <ManaHUD hero={actor.system} isCastMenuOpen={true} />}
        </div>
    )
}

const WeaponAttackMenu = ({ actor, weapons }: {
    actor: Actor & { system: HeroDataModel }, weapons: (Item & { system: WeaponDataModel })[]
}) => {
    const { WeaponSelector, weapon } = useWeaponSelector(weapons)
    const { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold } = useCustomSkillCheckBuilder(actor, weapon)
    const { CustomDamageRollBuilder, damageRolls } = useCustomDamageRollBuilder(weapon)
    const { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing } = useCustomDamageModifiersBuilder()

    const attack = useCallback(() => {
        if (weapon && skill && damageRolls) {
            const skillCheck = new SkillCheck(actor.system, {
                skill: skill,
                d20Count: d20Count,
                modifier: skillCheckMod,
                critThreshold: critThreshold,
                favorHinder: favorHinder
            })

            const damageRoll = new DamageRoll({
                atkName: weapon.name,
                dice: damageRolls.map(rollSchema => new DiceRoll(rollSchema)),
                dmgType: weapon.system.damage.type,
                flatDmgBonus: flatModifier,
                perDieDmgBonus: perDieBonus,
                armorPiercing: armorPiercing
            })
            const attack = new HeroAttack(weapon.name, actor, getTargetIds(), skillCheck, damageRoll)
            attack.skipSkillCheck = skill === '-'
            attack.initiate()
        }
    }, [weapon, skill, d20Count, favorHinder, skillCheckMod, critThreshold, damageRolls, flatModifier, perDieBonus, armorPiercing])

    return (
        <CollapsibleSection title={"ATTACK"} content={
            <div className="flex flex-col gap-y-2 p-1 border-2 border-solid border-t-0 border-table-border bg-sheet-main-fill rounded-b-sm">
                {WeaponSelector}
                {CustomSkillCheckBuilder}
                {CustomDamageRollBuilder}
                {CustomDamageModifiersBuilder}
                <div className="flex items-end w-full justify-end">
                    <PrimaryButton onClick={attack} icon={<Sword size={16} className="text-btn-primary-text" />}>
                        Attack
                    </PrimaryButton>
                </div>
            </div>
        } />
    )
}

const useCustomSkillCheckBuilder = (
    actor?: Actor & { system: HeroDataModel },
    weapon?: Item & { system: WeaponDataModel }
) => {
    const { SkillSelector, skill } = useSkillSelector(actor, weapon)
    const { D20CountSelector, d20Count } = useD20CountSelector()
    const { FavorHinderSelector, favorHinder } = useFavorHinderSelector()
    const { SkillCheckModifierInput, skillCheckMod } = useSkillCheckModifierInput()
    const { SkillCheckCritThresholdInput, critThreshold } = useSkillCheckCritThreholdInput()

    const CustomSkillCheckBuilder =
        <div className="flex flex-wrap gap-x-1 items-end justify-between border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            {SkillSelector}
            {D20CountSelector}
            {FavorHinderSelector}
            {SkillCheckModifierInput}
            {SkillCheckCritThresholdInput}
        </div>

    return { CustomSkillCheckBuilder, skill, d20Count, favorHinder, skillCheckMod, critThreshold }
}

const useWeaponSelector = (weapons: (Item & { system: WeaponDataModel })[]) => {
    const [weapon, setWeapon] = useState<Item & { system: WeaponDataModel }>()

    useEffect(() => { if (weapons.length > 0) { setWeapon(weapons[0]) } }, [])

    const WeaponSelector =
        <div className="border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
        <SectionLabel text={"Weapon"} />
        <div className="flex gap-x-0.5 items-end">
            <CustomDropDown
                value={weapon?.uuid ?? ''}
                options={weapons?.map(w => ({ value: w.uuid, label: w.name }))}
                onChange={(e) => setWeapon(weapons.find(w => w.uuid === e.target.value))}
                className="text-sm"
                />
        </div>
    </div>
    return { WeaponSelector, weapon }
}

const useSkillSelector = (actor, weapon) => {
    const [skill, setSkill] = useState<string>('')

    useEffect(() => {
        if (!actor || !weapon) return
        setSkill(HeroAttack.getHighestDefaultWeaponSkill(actor.system, weapon.system).skill)
    }, [weapon])

    const SkillSelector = <div>
        <SectionLabel text={"Skill Check"} />
        <div className="flex gap-x-0.5 items-end">
            <CustomDropDown
                value={skill}
                options={[
                    { value: null, label: "-" },
                    ...createDropdownEntriesFromObj(vgLiteLang.Skills),
                    ...createDropdownEntriesFromObj(vgLiteLang.Saves)
                ]}
                onChange={(e) => setSkill(e.target.value)}
                className="text-sm"
            />
            {(actor.system.skills[skill] || actor.system.saves[skill]) && <p className="text-sm italic">{`
                [${actor.system.skills[skill]?.value ?? actor.system.saves[skill] ?? 20}]
            `}</p>}
        </div>
    </div>
    return { SkillSelector, skill }
}

const useD20CountSelector = () => {
    const [d20Count, setD20Count] = useState<number>(1)
    const D20CountSelector = <div>
        <Label text={"D20"} />
        <CustomDropDown
            value={d20Count.toString()}
            options={[
                { value: '1', label: '1d20' },
                { value: '2', label: '2d20' },
                { value: '3', label: '3d20' }
            ]}
            onChange={(e) => setD20Count(Number(e.target.value))}
            className="text-sm"
        />
    </div>
    return { D20CountSelector, d20Count }
}

const useFavorHinderSelector = () => {
    const [favorHinder, setFavorHinder] = useState<'none' | 'favor' | 'hinder'>('none')
    const FavorHinderSelector = <div>
        <Label text={"Favor/Hinder"} />
        <CustomDropDown
            value={favorHinder}
            options={[
                { value: 'none', label: vgLiteLang.FavorHinder.none },
                { value: 'favor', label: vgLiteLang.FavorHinder.favor },
                { value: 'hinder', label: vgLiteLang.FavorHinder.hinder }
            ]}
            onChange={(e) => setFavorHinder(e.target.value)}
            className="text-sm"
        />
    </div>
    return { FavorHinderSelector, favorHinder }
}

const useSkillCheckModifierInput = () => {
    const [skillCheckMod, setSkillCheckMod] = useState<number>(0)
    const SkillCheckModifierInput = <div>
        <Label text={"Bonus"} />
        <span className="text-sm">
            <NumericCounterInput
                value={skillCheckMod}
                onChange={(val) => setSkillCheckMod(val)}
            />
        </span>
    </div>
    return { SkillCheckModifierInput, skillCheckMod }
}

const useSkillCheckCritThreholdInput = () => {
    const [critThreshold, setCritThreshold] = useState<number>(20)
    const SkillCheckCritThresholdInput = <div>
        <Label text={"Crit"} />
        <span className="text-sm">
            <NumericCounterInput
                value={critThreshold}
                onChange={(val) => setCritThreshold(val)}
            />
        </span>
    </div>
    return { SkillCheckCritThresholdInput, critThreshold }
}

const useCustomDamageRollBuilder = (weapon: (Item & { system: WeaponDataModel }) | undefined) => {
    const [damageRolls, setDamageRolls] = useState<DiceRollSchema[]>([])

    useEffect(() => {
        if (!weapon) return
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

    return { CustomDamageRollBuilder, damageRolls }
}

const useCustomDamageModifiersBuilder = () => {
    const [flatModifier, setFlatModifier] = useState<number>(0)
    const [perDieBonus, setPerDieBonus] = useState<number>(0)
    const [armorPiercing, setArmorPiercing] = useState<number>(0)

    const CustomDamageModifiersBuilder =
        <div className="flex flex-col gap-y-2 border border-solid border-table-border bg-context-menu-fill/40 rounded-sm p-1">
            <SectionLabel text={"Bonuses"} />
            <div className="flex gap-x-4 items-end">
                <div className="flex flex-col items-start">
                    <Label text={"Flat Modifier"} />
                    <NumericCounterInput value={flatModifier} onChange={(val) => setFlatModifier(val)} />
                </div>
                <div className="flex flex-col items-start">
                    <Label text={"Per-die Bonus"} />
                    <NumericCounterInput value={perDieBonus} onChange={(val) => setPerDieBonus(Math.max(0, val))} />
                </div>
                <div className="flex flex-col items-center" title={"Armor piercing"}>
                    <ShieldBan size={18} className="text-text-primary mb-0.5" />
                    <NumericCounterInput value={armorPiercing} onChange={(val) => setArmorPiercing(Math.max(0, val))} />
                </div>
            </div>
        </div>

    return { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing }
}

const SectionLabel = ({ text }) => {
    return (
        <div className="text-base text-text-header-tertiary font-eskapade font-bold">{text}</div>
    )
}

const Label = ({ text }) => {
    return (
        <div className="text-base text-text-primary font-eskapade font-normal">{text}</div>
    )
}