import { MessageSquareText, Trash } from "lucide-react"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { spellDamageBase } from "../../../../../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { getId } from "../../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../../chat/AbilityChatCard"
import { sendVgLiteChatMessage } from "../../../../../chat/ChatCardSerializer"
import { useContextMenu } from "../../../../../component/ContextMenu"
import { SkillCard } from "../../../../../component/SkillCard"

export const SpellsList = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div>
            <div className="grid @sm:grid-cols-1 @lg:grid-cols-2 gap-x-1 gap-y-0.5">
                {
                    hero.spells.map((sp: any) => (
                        <div key={getId(sp)} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: MessageSquareText, label: vgLiteLang.ButtonActions.chat, action: () =>
                                    sendVgLiteChatMessage(
                                        hero,
                                        <AbilityChatCard
                                            actorId={getId(hero)}
                                            img={sp.parent.img}
                                            title={sp.parent.name}
                                            subtitle={spellDamageBase(sp)}
                                            description={sp.description}
                                        />
                                    )
                            },
                            { icon: Trash, label: vgLiteLang.ButtonActions.remove, action: () => { hero.parent.deleteEmbeddedDocuments("Item", [getId(sp)]) }, isDestructive: true }
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
            <div className="flex gap-x-1 w-fit mb-16 ml-auto text-text-primary text-xl font-eskapade font-bold">
                <p>Spell Slots: </p>
                <p>{hero.spells.length}</p>
                <p>/</p>
                <p>{hero.spellSlots}</p>
            </div>
            <ContextMenu />
        </div>
    )
}