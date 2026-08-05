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

    console.log(favorHinder)

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
                dice: damageRolls.map(d => d.roll),
                dmgType: weapon.system.damage.type,
                flatDmgBonus: flatModifier,
                perDieDmgBonus: perDieBonus,
                armorPiercing: armorPiercing
            })
            new HeroAttack(weapon.name, actor, getTargetIds(), skillCheck, damageRoll).initiate()
        }
    }, [weapon, skill, d20Count, favorHinder, skillCheckMod, critThreshold, damageRolls, flatModifier, perDieBonus, armorPiercing])

    return (
        <CollapsibleSection title={"WEAPON ATTACK"} content={
            <div className="flex flex-col gap-y-2 p-1 border border-solid border-t-0 border-table-border bg-context-menu-fill/33 rounded-b-sm">
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
        <div className="flex flex-wrap gap-x-2 items-start justify-between border border-solid border-table-border rounded-sm p-1">
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

    const WeaponSelector = <div>
        <Label text={"Weapon"} />
        <div className="flex gap-x-0.5 items-end">
            <CustomDropDown
                value={weapon?.uuid ?? ''}
                options={weapons?.map(w => ({ value: w.uuid, label: w.name }))}
                onChange={(e) => setWeapon(weapons.find(w => w.uuid === e.target.value))}
                className="text-sm"
            />
            <p className="text-sm italic">{`[${weapon?.system.skills.map(sk => vgLiteLang.Skills[sk].name ?? vgLiteLang.Saves[sk]).join(", ")}]`}</p>
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
        <Label text={"Skill Check"} />
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
            {actor.system.skills[skill] && <p className="text-sm italic">{`[${actor.system.skills[skill]?.value}]`}</p>}
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
                { value: Object.keys(vgLiteLang.FavorHinder)[2], label: vgLiteLang.FavorHinder.none },
                { value: Object.keys(vgLiteLang.FavorHinder)[0], label: vgLiteLang.FavorHinder.favor },
                { value: Object.keys(vgLiteLang.FavorHinder)[1], label: vgLiteLang.FavorHinder.hinder }
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
    const [damageRolls, setDamageRolls] = useState<{ schema: DiceRollSchema, roll: DiceRoll }[]>([])

    useEffect(() => {
        if (!weapon) return
        const schema = {
            count: weapon.system.damage.dice.count,
            faces: weapon.system.damage.dice.faces
        }

        if (damageRolls.length === 0) {
            setDamageRolls([{ schema: schema, roll: new DiceRoll(schema) }])
        }
        else {
            const rolls = [...damageRolls]
            rolls[0] = { schema: schema, roll: new DiceRoll(schema) }
            setDamageRolls(rolls)
        }
    }, [weapon])

    const addNewRoll = useCallback(() => {
        const schema = { count: 1, faces: 4 }
        setDamageRolls(rolls => [...rolls, { schema: schema, roll: new DiceRoll(schema) }])
    }, [])

    const removeRoll = useCallback((index: number) => {
        setDamageRolls([...damageRolls].filter((_, rIdx) => rIdx !== index))
    }, [damageRolls])

    const handleDiceChange = useCallback((updatedDice: Partial<DiceRoll>, index: number) => {
        console.log(updatedDice, index)
        setDamageRolls(prevRolls =>
            prevRolls.map((r, rIdx) => {
                if (rIdx === index) {
                    const mergedData = { ...r.roll, ...updatedDice }
                    return { ...r, roll: new DiceRoll(mergedData) }
                }
                return r
            })
        )
    }, [])

    const CustomDamageRollBuilder =
        <div className="flex flex-col gap-2 items-start justify-between border border-solid border-table-border rounded-sm p-1">
            <Label text={"Damage Rolls"} />
            <div className="flex items-end w-full">
                <div className="flex flex-col gap-y-2">
                    {damageRolls.length > 0 && damageRolls.map((roll, index) => (
                        <div className="flex gap-x-1 items-end">
                            <DiceInputComponent
                                diceRoll={roll.roll}
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
        <div className="flex flex-col gap-y-2 border border-solid border-table-border rounded-sm p-1">
            <Label text={"Bonuses"} />
            <div className="flex gap-x-4 items-start">
                <div className="flex flex-col items-start">
                    <Subtitle text={"Flat Modifier"} />
                    <NumericCounterInput value={flatModifier} onChange={(val) => setFlatModifier(val)} />
                </div>
                <div className="flex flex-col items-start">
                    <Subtitle text={"Per-die Bonus"} />
                    <NumericCounterInput value={perDieBonus} onChange={(val) => setPerDieBonus(Math.max(0, val))} />
                </div>
                <div className="flex flex-col items-center" title={"Armor piercing"}>
                    <ShieldBan size={18} className="text-text-primary" />
                    <NumericCounterInput value={armorPiercing} onChange={(val) => setArmorPiercing(Math.max(0, val))} />
                </div>
            </div>
        </div>

    return { CustomDamageModifiersBuilder, flatModifier, perDieBonus, armorPiercing }
}

const Label = ({ text }) => {
    return (
        <div className="text-base text-text-primary font-eskapade font-bold">{text}</div>
    )
}

const Subtitle = ({ text }) => {
    return <div className="text-sm text-text-primary font-eskapade font-bold">{text}</div>
}