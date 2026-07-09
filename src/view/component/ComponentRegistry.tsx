import { AbilityChatCard } from "../chat/AbilityChatCard"
import { ComboChatCard } from "../chat/ComboChatCard"
import { DamageRolls } from "../chat/component/DamageRolls"
import { DiceRoll } from "../chat/component/DiceRoll"
import { DieIcon } from "../chat/component/DieIcon"
import { CountdownRollChatCard } from "../chat/CountdownChatCard"
import { DamageRollChatCard } from "../chat/DamageRollChatCard"
import { ItemChatCard } from "../chat/ItemChatCard"
import { SkillCheckChatCard } from "../chat/SkillCheckChatCard"
import { SpellCastChatCard } from "../chat/SpellCastChatCard"
import { TrackerUpdateChatCard } from "../chat/TrackerUpdateChatCard"

export const ComponentRegistry = {
    "AbilityChatCard": AbilityChatCard,
    "ComboChatCard": ComboChatCard,
    "CountdownRollChatCard": CountdownRollChatCard,
    "DamageRollChatCard": DamageRollChatCard,
    "DamageRolls": DamageRolls,
    "DiceRoll": DiceRoll,
    "DieIcon": DieIcon,
    "ItemChatCard": ItemChatCard,
    "SkillCheckChatCard": SkillCheckChatCard,
    "SpellCastChatCard": SpellCastChatCard,
    "TrackerUpdateChatCard": TrackerUpdateChatCard
}