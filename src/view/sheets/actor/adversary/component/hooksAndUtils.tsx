import { useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { DamageRoll } from "../../../../../combat/engine/roll/DamageRoll"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../../chat/ChatCardSerializer"
import { DamageRollChatCard } from "../../../../chat/DamageRollChatCard"

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

export const onClickAction = async (npc: AdversaryDataModel | NpcDataModel, name: string, description?: string, dmgType?: string, dice?: DiceRollSchema) => {
    /**
     * TODO: create a config item to toggle between using damage rolls vs. flat damage.
     */
    if (dice) {
        const result = await new DamageRoll({
            atkName: name, dmgType: dmgType, dice: [new DiceRoll(dice)]
        }).roll()

        sendVagabondChatMessage(
            npc,
            <DamageRollChatCard
                actorId={getId(npc)}
                tokenIds={getTargetIds()}
                result={result}
            />, result.rolls
        )
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