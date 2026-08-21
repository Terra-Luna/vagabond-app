import { MessageSquareText, Wand2 } from "lucide-react"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { spellDamageBase } from "../../../../../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { getId } from "../../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../../../chat/ChatCardSerializer"
import { useContextMenu } from "../../../../../component/ContextMenu"
import { SkillCard } from "../../../../../component/SkillCard"
import { useSpellcastingMenuContext } from "./spellcasting/SpellcastingMenuContext"

export const SpellsList = ({ hero }: { hero: HeroDataModel }) => {

    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, SpellcastingMenu } = useSpellcastingMenuContext()

    return (
        <div>
            <div className="flex flex-col gap-x-1 gap-y-0.5" title={vgLiteLang.HeroSheet.context_tooltip}>
                {
                    hero.spells.sort((a, b) => a.parent.name.localeCompare(b.parent.name)).map((sp: any, index: number) => (
                        <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: Wand2, label: vgLiteLang.HeroSheet.Magic.btnCast, action: () => {
                                    onSelectSpell(sp._sourceId)
                                    setIsSpellcastingOpen(true)
                                }
                            },
                            {
                                icon: MessageSquareText, label: vgLiteLang.ButtonActions.chat, action: () =>
                                    sendVagabondChatMessage(
                                        hero,
                                        <AbilityChatCard
                                            actorId={getId(hero)}
                                            img={sp.parent.img}
                                            title={sp.parent.name}
                                            subtitle={spellDamageBase(sp)}
                                            description={sp.description}
                                        />
                                    )
                            }
                        ])}>
                            <SkillCard
                                img={sp.parent.img}
                                dmgType={sp.damageType}
                                title={sp.parent.name}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: vgLiteLang.DamageTypes[sp.damageType] }]}
                                description={sp.description}
                            />
                        </div>
                    ))
                }
            </div>
            <ContextMenu />
        </div>
    )
}