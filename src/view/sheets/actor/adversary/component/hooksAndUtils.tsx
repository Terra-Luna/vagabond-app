import { useState } from "react"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { rollDamage } from "../../../../../combat/dice-rolls"
import { getId, getTargets } from "../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { DamageRollChatCard } from "../../../../chat/DamageRollChatCard"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardSerializer"

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

export const onClickAction = async (adv: AdversaryDataModel, name: string, description: string, dmgType: string, roll?: string, avgDmg?: string) => {
    /**
     * TODO: create a config item to toggle between using damage rolls vs. flat damage.
     */
    if (roll) {
        const result = await rollDamage(name, dmgType, roll ?? '')
        sendVgLiteChatMessage(
            adv,
            <DamageRollChatCard
                actorId={getId(adv)}
                tokenIds={getTargets()}
                result={result}
            />, result.rolls
        )
    }
    else {
        sendVgLiteChatMessage(adv, <AbilityChatCard
            actorId={getId(adv)}
            title={name}
            description={description}
            tokenIds={getTargets()}
        />)
    }
}