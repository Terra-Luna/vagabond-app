import { MessageSquareText, Trash } from "lucide-react"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { ancestryFullDescription } from "../../../../../model/item/character/AncestryDataModel"
import PerkDataModel, { perkStatPrerequisitesAsString, perkTrainingPrerequisitesAsString } from "../../../../../model/item/character/PerkDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { getId, getName } from "../../../../../utils/modelUtil"
import { toPascalCase } from "../../../../../utils/stringUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardManager"
import { useContextMenu } from "../../../../component/ContextMenu"
import { Header } from "../../../../component/Header"
import { SkillCard } from "../../../../component/SkillCard"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const beingSize = vgLiteLang.Sizes[hero.ancestry?.beingSize ?? '']
    const beingType = vgLiteLang.BeingTypes[hero.ancestry?.beingType ?? '']
    
    return (
        <div className="py-1">
            <Header title={vgLiteLang.HeroSheet.ancestry} />
            <div className="mt-0.5" />
            <SkillCard
                title={`${hero.ancestry !== undefined ? getName(hero.ancestry) + " Traits": ''}`}
                subtitles={[['Size', beingSize ?? ''], ['Type', beingType ?? '']]}
                description={ancestryFullDescription(hero.ancestry as any)}
            />
            
            <div className="my-2">
                <Header title={vgLiteLang.HeroSheet.class} />
                <div className="mt-0.5" />
                <div className={abilitiesGrid}>
                    {
                        hero.class?.features?.filter(f =>
                            f.level! <= hero.level.current! && f.name.toUpperCase() !== 'PERK'
                        ).map(f => (
                            <SkillCard
                                key={f.name}
                                title={f.name}
                                subtitles={[[`${getName(hero.class)}`, `Level ${f.level}`]]}
                                description={f.description}
                            />
                        ))
                    }
                </div>
            </div>
            
            <Header title={vgLiteLang.HeroSheet.perks} />
            <div className="mt-0.5" />
            <div className={abilitiesGrid}>
                {
                    hero.perks.map((p: any) => (
                        <div key={p.parent.id} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(hero,
                                    <AbilityChatCard actorId={getId(hero)} title={p.parent.name} description={p.description} />
                                )
                            },
                            { icon: Trash, label: 'Remove', action: () => { hero.parent.deleteEmbeddedDocuments("Item", [getId(p)]) }, isDestructive: true }
                        ])}>
                            <SkillCard
                                title={p.parent.name}
                                subtitles={
                                    p.prerequisites.map(prereq => (
                                        [
                                            `${vgLiteLang.PrerequisiteTypes[prereq.type]}`,
                                            `${prereq.type === 'spell' ?
                                                toPascalCase(prereq.spell) : (
                                                    prereq.type === 'stat' ?
                                                        perkStatPrerequisitesAsString(p) :
                                                        perkTrainingPrerequisitesAsString(p)

                                                )
                                            }`
                                        ]
                                    ))
                                }
                                description={p.description}
                            />
                        </div>
                    ))
                }
            </div>
            <ContextMenu />
        </div>
    )
}

const abilitiesGrid = "grid @md:grid-cols-1 @lg:grid-cols-2 gap-x-1 gap-y-0.5"