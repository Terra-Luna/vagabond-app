import lang from "../../../../../../public/lang/en.json"
import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { ancestryFullDescription } from "../../../../../model/item/character/AncestryDataModel"
import { toPascalCase } from "../../../../../utils/stringUtil"
import { Header } from "../../../../component/Header"
import { SkillCard } from "../../../../component/SkillCard"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="mt-1">
            <Header title={lang.VGLITE.HeroSheet.ancestry} />
            <SkillCard
                title={`${hero.ancestry !== undefined ? hero.ancestry?.parent?.name + " Traits": ''}`}
                subtitles={[['Type', hero.ancestry?.beingType], ['Size', hero.ancestry?.beingSize || '']]}
                description={ancestryFullDescription(hero.ancestry as any)}
            />
            
            <div className="my-2">
                <Header title={lang.VGLITE.HeroSheet.class} />
                <div className={abilitiesGrid}>
                    {
                        hero.class?.features?.filter(f =>
                            f.level! <= hero.level.current! && f.name.toUpperCase() !== 'PERK'
                        ).map(f => (
                            <SkillCard
                                key={f.name}
                                title={f.name}
                                subtitles={[[`${hero.class.parent.name}`, `Level ${f.level}`]]}
                                description={f.description}
                            />
                        ))
                    }
                </div>
            </div>
            
            <Header title={lang.VGLITE.HeroSheet.perks} />
            <div className={abilitiesGrid}>
                {
                    hero.perks.map(p => (
                        <SkillCard
                            key={p.parent.name}
                            title={p.parent.name}
                            subtitles={
                                p.prerequisites.map(pr => (
                                    [`${toPascalCase(pr.type!)}`, `${pr.type === 'SPELL' ? pr.spell : (
                                            pr.type === 'TRAINING' ? (
                                                pr.skillNames.length == 1 ? pr.skillNames[0] : `${pr.skillNames[0]} ${pr.andOr} ${pr.skillNames[1]}`
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

const abilitiesGrid = "grid @sm:grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 gap-x-1"