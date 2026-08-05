import { ReactNode, useCallback, useMemo } from "react"
import { AttackPreset } from "../AttackBuilderApp"
import { DamageRoll } from "../../../combat/engine/DamageRoll"
import { DiceRoll } from "../../../combat/engine/DiceRoll"
import { HeroAttack } from "../../../combat/engine/HeroAttack"
import { SkillCheck } from "../../../combat/engine/SkillCheck"
import { getTargetIds } from "../../../utils/modelUtil"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { AttackButton } from "./AttackButton"

export const AttackPresetRow = ({ actor, preset, EditButton, TrashButton }: {
    actor: Actor & { system: HeroDataModel },
    preset: AttackPreset,
    EditButton: ReactNode,
    TrashButton: ReactNode
}) => {

    const weapon = useMemo((): Item & { system: WeaponDataModel } => {
        return actor.items.contents.find(it => it.id === preset.weaponId) as unknown as Item & { system: WeaponDataModel }
    }, [preset])

    const attack = useCallback(() => {
        if (!preset.weaponId || !preset.skill || !preset.damageRolls || !weapon) return

        const skillCheck = new SkillCheck(actor.system, {
            skill: preset.skill,
            d20Count: preset.d20Count,
            modifier: preset.skillCheckMod,
            critThreshold: preset.critThreshold,
            favorHinder: preset.favorHinder
        })

        const damageRoll = new DamageRoll({
            atkName: (weapon.name ?? '') + ": " + preset.description,
            dice: preset.damageRolls.map(rollSchema => new DiceRoll(rollSchema)),
            dmgType: weapon.system.damage.type,
            flatDmgBonus: preset.flatModifier,
            perDieDmgBonus: preset.perDieBonus,
            armorPiercing: preset.armorPiercing
        })

        const attack = new HeroAttack(weapon.name, actor, getTargetIds(), skillCheck, damageRoll)
        attack.itemId = weapon.id ?? ''
        attack.skipSkillCheck = preset.skill === '-'
        attack.initiate()

    }, [weapon, preset])

    return (
        <div className="flex px-2 py-1 border-t border-solid border-table-border">
            {/* ATTACK TITLE + DESCRIPTION */}
            <div>
                <div className="flex gap-x-1 text-base font-eskapade">
                    <p className="font-bold">{`${preset.title}${preset.description.length > 0 ? ':' : ''}`}</p>
                    {preset.description.length > 0 && <p>{preset.description}</p>}
                </div>

                {/* ATTACK METADATA GHOST TEXT */}
                <div className="flex gap-x-1 text-xs text-text-tertiary font-paradigm italic -mt-1">
                    <p>{`${vgLiteLang.Skills[preset.skill]?.name ?? vgLiteLang.Saves[preset.skill]?.name ?? ''},`}</p>
                    <p>{`${preset.d20Count}d20,`}</p>
                    <p>{`${preset.favorHinder !== 'none' ? vgLiteLang.FavorHinder[preset.favorHinder] + "," : ''}`}</p>
                    <p>{`Crit: ${preset.critThreshold},`}</p>
                    <p>{`${preset.damageRolls.map(r => new DiceRoll(r).toRollFormula()).join("+")}`}</p>
                </div>
            </div>

            {/* ATTACK | EDIT | DELETE BUTTONS */}
            <div className="flex gap-x-2 items-center content-center ml-auto">
                <div className="mr-4">
                    <AttackButton onClick={attack} />
                </div>
                {EditButton}
                {TrashButton}
            </div>
        </div>
    )
}