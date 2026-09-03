import { useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { AdversaryAttack, SavingThrowType } from "../../../../../combat/engine/AdversaryAttack"
import { AdversaryComboAttack, ComboSubAttackArgs } from "../../../../../combat/engine/AdversaryComboAttack"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../../chat/ChatCardSerializer"

export const useAddAbilityMenu = () => {
    const [isAddAbilityOpen, setIsAddAbilityOpen] = useState(false)
    const [editAbilityTarget, setEditAbilityTarget] = useState(null)
    return { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget }
}

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
    /**
     * TODO: create a config item to toggle between using damage rolls vs. flat damage.
     */
    if (dice) {
        const attack = AdversaryAttack.build(
            npc.parent,
            { attackName: name, dmgType: dmgType ?? 'physical', dice: [new DiceRoll(dice)], saveTypes, description, statuses },
            getTargetIds()
        )
        await attack.initiate()
    }
    else {
        sendVagabondChatMessage(npc, <AbilityChatCard
            actorId={getId(npc)}
            title={name}
            description={description ?? ''}
            tokenIds={getTargetIds()}
        />)
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