import { AbilityChatCard } from "./view/chat/AbilityChatCard"
import { ComboChatCard } from "./view/chat/ComboChatCard"
import { DamageRolls } from "./view/chat/component/DamageRolls"
import { DiceRoll } from "./view/chat/component/DiceRoll"
import { DieIcon } from "./view/chat/component/DieIcon"
import { CountdownRollChatCard } from "./view/chat/CountdownChatCard"
import { DamageRollChatCard } from "./view/chat/DamageRollChatCard"
import { ItemChatCard } from "./view/chat/ItemChatCard"
import { SkillCheckChatCard } from "./view/chat/SkillCheckChatCard"
import { SpellCastChatCard } from "./view/chat/SpellCastChatCard"
import { TrackerUpdateChatCard } from "./view/chat/TrackerUpdateChatCard"

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