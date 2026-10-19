import { useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { RelicPowers } from "../../../../../apps/vagabond-tools/relic/RelicPowers"
import { AdversaryAttack, SavingThrowType } from "../../../../../combat/engine/AdversaryAttack"
import { AdversaryComboAttack, ComboSubAttackArgs } from "../../../../../combat/engine/AdversaryComboAttack"
import { HeroAttack } from "../../../../../combat/engine/HeroAttack"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { sendVagabondChatCard } from "../../../../chat/ChatCardSerializer"

export const useAddActionMenu = () => {
    const [isAddActionOpen, setIsAddActionOpen] = useState(false)
    const [editActionTarget, setEditActionTarget] = useState(null)
    return { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget }
}

export const onClickAction = async (
    npc: AdversaryDataModel | NpcDataModel,
    name: string,
    description?: string,
    dmgType?: string,
    dice?: DiceRollSchema,
    saveTypes?: SavingThrowType[],
    statuses?: string[]
) => {
    if (dice) {
        const attack = AdversaryAttack.build(
            npc.parent,
            { attackName: name, dmgType: dmgType ?? 'physical', dice: [new DiceRoll(dice)], saveTypes, description, statuses },
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

export const onClickActionAsWeaponAttack = async (actor: Actor & { system: HeroDataModel }, action: any, e: React.MouseEvent) => {
    const polyMods = actor.system.modifiers.polymorph
    const relicPower = polyMods.relicAttacks
        ? (polyMods.attackBonus > 0
            ? RelicPowers.bonus.find(it => it.id === `bonus-weapon-${Math.min(3, polyMods.attackBonus)}`)
            : RelicPowers.bonus.find(it => it.id === `utility-other`)
        )
        : undefined

    const weapon = {
        id: action.id,
        name: action.name,
        img: "/icons/creatures/claws/claw-straight-orange.webp",
        system: {
            damage: action.damage,
            statuses: action.statuses,
            skills: actor.system.modifiers.polymorph.useCastSkill
                ? [actor.system.class.castingSkill]
                : (action.type === 'melee' ? ['melee', 'brawl'] : ['ranged']),
            properties: ['polymorph'],
            relicPowers: relicPower ? [relicPower] : []
        }
    }
    const attack = HeroAttack.buildWeaponAttack(actor, weapon as any)
    await attack.initiate(e)
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
                statuses: act.statuses as string[]
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