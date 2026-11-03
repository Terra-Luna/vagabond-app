import { useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { AdversaryAttack, SavingThrowType } from "../../../../../combat/engine/AdversaryAttack"
import { AdversaryComboAttack, ComboSubAttackArgs } from "../../../../../combat/engine/AdversaryComboAttack"
import { AppliedFx } from "../../../../../combat/engine/Attack"
import { HeroAttack } from "../../../../../combat/engine/HeroAttack"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { collectAppliedFx } from "../../../../../combat/engine/util/active-effect-fx"
import { applyAdversaryDamageMods } from "../../../../../combat/engine/util/adversary-damage-mods"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import type { FollowerContext } from "../../../../../model/actor/util/NpcDataModelUtil"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { sendVagabondChatCard } from "../../../../chat/ChatCardSerializer"

export const useAddActionMenu = () => {
    const [isAddActionOpen, setIsAddActionOpen] = useState(false)
    return { isAddActionOpen, setIsAddActionOpen }
}

export const onClickAction = async (
    npc: AdversaryDataModel | NpcDataModel,
    name: string,
    description?: string,
    dmgType?: string,
    dice?: DiceRollSchema,
    saveTypes?: SavingThrowType[],
    appliedEffects?: AppliedFx[],
    halfDamageOnSave?: boolean,
    type?: string
) => {
    if (dice) {
        const attack = AdversaryAttack.build(
            npc.parent,
            { attackName: name, dmgType: dmgType ?? 'physical', dice: [new DiceRoll(dice)], saveTypes, description, appliedEffects, halfDamageOnSave, isSpellAttack: type === 'cast' },
            getTargetIds()
        )
        await attack.initiate()
    }
    else {
        sendVagabondChatCard(npc, "AbilityChatCard", {
            actorId: getId(npc),
            title: name,
            description: description ?? '',
            tokenIds: getTargetIds()
        })
    }
}

export const buildPolymorphAttack = (actor: Actor & { system: HeroDataModel }, action: any): HeroAttack | undefined => {
    const polyMods = actor.system.modifiers.polymorph
    const virtualRelic = polyMods.relicAttacks
        ? { id: `physical_lt${Math.max(0, polyMods.damageBonus ?? 0)}`, category: { value: 'bonus', label: 'Bonus' }, power: { value: 'virtual', label: 'Relic' }, types: ['weapon'], goldValue: 0 }
        : undefined

    /**
     * Translate the Npc Action into the general shape of a Weapon so it can be used for a Hero Attack.
     */
    const weapon = {
        id: action.id,
        name: action.name,
        img: "/icons/creatures/claws/claw-straight-orange.webp",
        system: {
            damage: action.damage,
            appliedEffects: action.appliedEffects ?? [],
            relicPowers: virtualRelic ? [virtualRelic] : [],
            properties: [],
            skills: actor.system.modifiers.polymorph.useCastSkill
                ? [actor.system.class.castingSkill]
                : (action.type === 'melee'
                    ? ['melee', 'brawl']
                    : (action.type === 'ranged'
                        ? ['ranged']
                        : [actor.system.class.castingSkill ?? ""]
                    )
                )
        }
    }

    return weapon.system.skills.length > 0
        ? HeroAttack.buildWeaponAttack(actor, weapon as any)
        : undefined
}

export const onClickActionAsWeaponAttack = async (actor: Actor & { system: HeroDataModel }, action: any, e: React.MouseEvent) => {
    const attack = buildPolymorphAttack(actor, action)
    if (attack) {
        await attack.initiate(e)
    }
    else {
        ui.notifications?.warn("No valid skills available for this polymorph attack.")
    }
}

export const buildFollowerAttack = (follower: FollowerContext, action: any): HeroAttack => {
    const weapon = {
        id: action.id,
        name: action.name,
        img: "/icons/creatures/claws/claw-straight-orange.webp",
        system: {
            damage: action.damage,
            appliedEffects: action.appliedEffects ?? [],
            relicPowers: [],
            properties: [],
            skills: [follower.skill]
        }
    }
    const attack = HeroAttack.buildWeaponAttack(follower.hero, weapon as any, follower.skill)
    attack.portraitActorId = follower.npcId

    // The skill check uses the Hero's skill, but damage uses only the follower's own modifiers.
    // Use the actual (possibly unlinked token) actor, since status effects live on it rather than the base actor.
    const npc = follower.npc
    const damageRoll = attack.damageRoll
    if (npc && damageRoll) {
        const dice = new DiceRoll(action.damage.dice)
        damageRoll.dice = [dice]
        damageRoll.weaknessDie = { faces: dice.faces, count: 1 }
        damageRoll.baneTypes = undefined
        damageRoll.hdMultiplier = 0
        damageRoll.relicLevel = -1
        damageRoll.flatDmgBonus = 0
        damageRoll.perDieDmgBonus = 0
        damageRoll.armorPiercing = 0
        damageRoll.armorPiercingPerDie = 0
        damageRoll.armorPiercingPerExtraDie = 0
        applyAdversaryDamageMods(npc, damageRoll, action.type === 'cast')
    }
    return attack
}

/**
 * An NPC following a Hero attacks as that Hero's weapon attack (like a polymorph), rolling the
 * NPC's chosen follower skill.
 */
export const onClickActionAsFollowerAttack = async (follower: FollowerContext, action: any, e: React.MouseEvent) => {
    await buildFollowerAttack(follower, action).initiate(e)
}

/**
 * Converts each step of the combo into its own Hero attack (follower or polymorph) so each gets a skill check.
 */
export const onClickComboAsHeroAttacks = async (
    npc: AdversaryDataModel | NpcDataModel,
    build: (action: any) => HeroAttack | undefined,
    e: React.MouseEvent
) => {
    for (const comboAct of npc.combo.actions) {
        const act = npc.actions.find(it => it.name === comboAct.name) ?? comboAct
        const repeatCount = comboAct.comboCount ?? 0

        for (let i = 0; i < repeatCount; i++) {
            const attack = build({ ...act, name: repeatCount > 1 ? `${act.name} (${i + 1})` : act.name })
            if (attack) await attack.initiate(e)
        }
    }
}

export const onClickActionCombo = async (npc: AdversaryDataModel | NpcDataModel) => {
    const subAttacks: ComboSubAttackArgs[] = []

    for (const comboAct of npc.combo.actions) {
        const act = npc.actions.find(it => it.name === comboAct.name) ?? comboAct
        const repeatCount = comboAct.comboCount ?? 0

        for (let i = 0; i < repeatCount; i++) {
            subAttacks.push({
                name: repeatCount > 1 ? `${act.name} (${i + 1})` : act.name,
                dmgType: act.damage.type,
                dice: [new DiceRoll(act.damage.dice as any)],
                saveTypes: act.saves as SavingThrowType[],
                halfDamageOnSave: act.halfDamageOnSave,
                isSpellAttack: (act as any).type === 'cast',
                appliedEffects: collectAppliedFx(act as any)
            })
        }
    }

    if (subAttacks.length === 0) return

    const attack = AdversaryComboAttack.build(
        npc.parent,
        { comboName: npc.combo.name, subAttacks },
        getTargetIds()
    )

    await attack.initiate()
}