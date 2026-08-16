import { AbilityChatCard } from "../chat/AbilityChatCard"
import { ComboChatCard } from "../chat/ComboChatCard"
import { DamageRollsComponent } from "../chat/component/DamageRollsComponent"
import { DiceRollComponent } from "../chat/component/DiceRollComponent"
import { DieIcon } from "../chat/component/DieIcon"
import { CountdownRollChatCard } from "../chat/CountdownChatCard"
import { DamageRollChatCard } from "../chat/DamageRollChatCard"
import { InteractiveAttackChatCard } from "../../combat/ui/InteractiveAttackChatCard"
import { ItemChatCard } from "../chat/ItemChatCard"
import { SkillCheckChatCard } from "../chat/SkillCheckChatCard"
import { SpellAttackInfoComponent } from "../../combat/ui/SpellAttackInfoComponent"
import { TrackerUpdateChatCard } from "../chat/TrackerUpdateChatCard"

export const ComponentRegistry = {
    "AbilityChatCard": AbilityChatCard,
    "ComboChatCard": ComboChatCard,
    "CountdownRollChatCard": CountdownRollChatCard,
    "DamageRollChatCard": DamageRollChatCard,
    "DamageRolls": DamageRollsComponent,
    "DiceRoll": DiceRollComponent,
    "DieIcon": DieIcon,
    "InteractiveAttackChatCard": InteractiveAttackChatCard,
    "ItemChatCard": ItemChatCard,
    "SkillCheckChatCard": SkillCheckChatCard,
    "SpellCastChatCard": SpellAttackInfoComponent,
    "TrackerUpdateChatCard": TrackerUpdateChatCard
} as const