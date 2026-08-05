import { ReactNode, useCallback, useMemo } from "react"
import { AttackPreset } from "../AttackBuilderApp"
import { DamageRoll } from "../../../combat/engine/DamageRoll"
import { DiceRoll } from "../../../combat/engine/DiceRoll"
import { HeroAttack } from "../../../combat/engine/HeroAttack"
import { SkillCheck } from "../../../combat/engine/SkillCheck"
import { getTargetIds } from "../../../utils/modelUtil"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"

export const AttackPresetRow = ({ actor, preset, TrashButton }: {
    actor: Actor & { system: HeroDataModel }, preset: AttackPreset, TrashButton: ReactNode
}) => {

    const weapon = useMemo((): Item & { system: WeaponDataModel } => {
        return actor.items.contents.filter(it => it.id === preset.weaponId) as unknown as Item & { system: WeaponDataModel }
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
        attack.skipSkillCheck = preset.skill === '-'

        attack.initiate()
    }, [weapon, preset])

    return (
        <div className="flex gap-x-2">
            {`${preset.title}: ${preset.description}`}
            {TrashButton}
        </div>
    )
}