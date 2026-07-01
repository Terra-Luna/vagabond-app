import lang from "../../../../../../public/lang/en.json"
import { MessageSquareText, Sparkle, Sparkles, Trash } from "lucide-react"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { SkillCard } from "../../../../component/SkillCard"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { useCallback } from "react"
import { updateDocument } from "../../../../../utils/documentUtils"
import { getId } from "../../../../../utils/modelUtil"
import { glowOnHover } from "../../../VgLiteSheet"
import { SecondaryButton } from "../../../../component/Button"
import { useContextMenu } from "../../../../component/ContextMenu"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardManager"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"

export const MagicTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div>
            <ManaDisplay hero={hero} />
            <Spells hero={hero} />
        </div>
    )
}

const ManaDisplay = ({ hero }: { hero: HeroDataModel }) => {
    const mana = hero.mana.current
    const updateMana = useCallback((auxClick: boolean) => {
        updateDocument(hero.parent, { mana: { current: (mana ?? 0) + (auxClick ? 1 : -1) } })
    }, [mana])

    return (
        <div className="flex text-3xl font-eskapade font-bold mt-1 mb-2 justify-evenly">
            <div className="flex items-center">
                <span className="text-lg justify-bottom">Mana:&nbsp;&nbsp;</span>
                <Sparkle className={`text-mana ${glowOnHover} cursor-pointer`} size={20}
                    onClick={() => updateMana(false)}
                    onAuxClick={() => updateMana(true)}
                />
                &nbsp;
                <span className={`${glowOnHover} cursor-pointer text-mana`}>
                    <EditableTextField
                        boundValue={hero.mana.current?.toString() ?? ""}
                        updateProps={{ object: hero.parent, path: ['mana', 'current'] }}
                        placeholder="0"
                    />
                </span>
                <span className="slash">&nbsp;/&nbsp;</span>
                <span className="text-mana">{hero.mana.max}</span>
            </div>
            <div className="flex items-center text-mana">
                <span className="text-lg text-text-primary">Cast Max:&nbsp;&nbsp;</span>
                <Sparkles size={20} />
                &nbsp;
                <span>{hero.mana.maxCast}</span>
            </div>
            <div className="px-1" />
            <SecondaryButton
                children={<p className="text-lg">Cast</p>}
                icon={<DamageTypeIcon dmgType={'magical'} />}
                onClick={() => ui.notifications?.info("Feature coming soon!")}
            />
        </div>
    )
}

const Spells = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div>
            <div className="grid @sm:grid-cols-1 @lg:grid-cols-2 my-1 gap-x-1 gap-y-0.5">
                {
                    hero.spells.map((sp: any) => (
                        <div key={getId(sp)} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(
                                    hero,
                                    <AbilityChatCard
                                        actorId={getId(hero)}
                                        title={sp.parent.name}
                                        description={sp.description}
                                        tokenIds={[]}
                                        dmgType={sp.damageType}
                                    />
                                )
                            },
                            {
                                icon: Trash,
                                label: 'Remove',
                                action: () => { hero.parent.deleteEmbeddedDocuments("Item", [getId(sp)]) },
                                isDestructive: true
                            }
                        ])}>
                            <SkillCard
                                title={sp.parent.name}
                                subtitles={[['Base dmg', lang.VGLITE.DamageTypes[sp.damageType] ?? '-']]}
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