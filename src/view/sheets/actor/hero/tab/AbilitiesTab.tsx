import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { ancestryFullDescription } from "../../../../../model/item/character/AncestryDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { getName } from "../../../../../utils/modelUtil"
import { toPascalCase } from "../../../../../utils/stringUtil"
import { Header } from "../../../../component/Header"
import { SkillCard } from "../../../../component/SkillCard"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
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
                        <SkillCard
                            key={p.parent.name}
                            title={p.parent.name}
                            subtitles={
                                p.prerequisites.map(pr => (
                                    [`${toPascalCase(pr.type!)}`, `${pr.type === 'SPELL' ? pr.spell : (
                                            pr.type === 'TRAINING' ? (
                                                pr.skillNames.length == 1 ?
                                                `${vgLiteLang.Skills[pr.skillNames[0]].name}` :
                                                `${vgLiteLang.Skills[pr.skillNames[0]].name} ${pr.andOr} ${vgLiteLang.Skills[pr.skillNames[1]].name}`
                                            ) : `${pr.stat} +${pr.value}`
                                        )
                                    }`]
                                ))
                            }
                            description={p.description}
                        />
                    ))
                }
            </div>
        </div>
    )
}

const abilitiesGrid = "grid @md:grid-cols-1 @lg:grid-cols-2 gap-x-1 gap-y-0.5"