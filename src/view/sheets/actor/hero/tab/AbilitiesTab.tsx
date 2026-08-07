import { MessageSquareText, Trash } from "lucide-react"
import { perkPrerequisites } from "../../../../../model/item/character/PerkDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { getId, getName } from "../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { useContextMenu } from "../../../../component/ContextMenu"
import { Header } from "../../../../component/Header"
import { SkillCard } from "../../../../component/SkillCard"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardSerializer"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const beingSize = vgLiteLang.Sizes[hero.ancestry?.beingSize ?? '']
    const beingType = vgLiteLang.BeingTypes[hero.ancestry?.beingType ?? '']
    const abilitiesGrid = "grid @md:grid-cols-1 @lg:grid-cols-2 gap-x-1 gap-y-0.5"
    
    return (
        <div className="py-1">
            {
                !hero.ancestry ? <></> : <>
                    <Header title={vgLiteLang.HeroSheet.ancestry} />
                    <div className="mt-0.5" />
                    <SkillCard
                        title={`${hero.ancestry !== undefined ? getName(hero.ancestry) + " Traits" : ''}`}
                        subtitles={[{ label: 'Size', value: beingSize }, { label: 'Type', value: beingType }]}
                        description={hero.ancestry?.description}
                    />
                </>
            }
            <div className="my-2">
                <Header title={vgLiteLang.HeroSheet.class} />
                <div className="mt-0.5" />
                <div className={abilitiesGrid}>
                    {
                        hero.class?.features?.sort((a, b) => a.level! - b.level!).filter(f =>
                            f.level! <= hero.level.current! && f.name.toUpperCase() !== 'PERK'
                        ).map(f => (
                            <div key={f.name} onContextMenu={(e) => onCtxMenu(e, [
                                {
                                    icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(hero,
                                        <AbilityChatCard actorId={getId(hero)} img={''} title={f.name} description={f.description} />
                                    )
                                }
                            ])}>
                                <SkillCard
                                    title={f.name}
                                    subtitles={[{ label: getName(hero.class), value: `Level ${f.level}` }]}
                                    description={f.description}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
            
            <Header title={vgLiteLang.HeroSheet.perks} />
            <div className="mt-0.5" />
            <div className={abilitiesGrid}>
                {
                    hero.perks.map((p: any, index: number) => (
                        <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                            {
                                icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(hero,
                                    <AbilityChatCard
                                        actorId={getId(hero)}
                                        img={p.parent.img}
                                        title={p.parent.name}
                                        subtitle={perkPrerequisites(p)}
                                        description={p.description}
                                    />
                                )
                            }
                        ])}>
                            <SkillCard
                                img={p.parent.img}
                                title={p.parent.name}
                                subtitles={perkPrerequisites(p)}
                                description={p.description}
                            />
                        </div>
                    ))
                }
            </div>

            {/* PERK SELECTIONS - Currently hidden because it's kinda buggy due to how it uses flags to save choices. */}
            {/* <div className="flex mt-1 w-full justify-end mb-12">
                <PrimaryButton onClick={() => new PerkSelectionApp(hero.parent).render({ force: true })}>
                    Select Perks
                </PrimaryButton>
            </div> */}

            <ContextMenu />
        </div>
    )
}