import { MessageSquareText } from "lucide-react"

import { PerkSelectionApp } from "../../../../../apps/hero-choices/perks/PerkSelectionApp"
import { TrainingSelectionApp } from "../../../../../apps/hero-choices/training/TrainingSelectionApp"
import { getShowTrainingSelectionToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { PerkDataModel, perkSpellRerequisitesAsString, perkStatPrerequisitesAsString, perkTrainingPrerequisitesAsString } from "../../../../../model/item/character/PerkDataModel"
import { ItemsCache } from "../../../../../rules/util/ItemsCache"
import { groupBy } from "../../../../../utils/collectionUtil"
import { appLang } from "../../../../../utils/lang"
import { getId, getName } from "../../../../../utils/modelUtil"
import { AbilityChatCard } from "../../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../../chat/ChatCardSerializer"
import { PrimaryButton, SecondaryButton } from "../../../../component/Button"
import { useContextMenu } from "../../../../component/ContextMenu"
import { ClearHeader } from "../../../../component/Header"
import { CardSubHeaderValues, SkillCard } from "../../../../component/SkillCard"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const beingSize = appLang.Sizes[hero.ancestry?.beingSize ?? '']
    const beingType = appLang.BeingTypes[hero.ancestry?.beingType ?? '']
    const abilitiesGrid = "grid @md:grid-cols-1 @lg:grid-cols-2 gap-x-1 gap-y-0.5"

    const groupedFeatures = groupBy('name', (hero.class?.featureIds ?? [])
        .map(featureId => ItemsCache.items.get(featureId))
        .filter(feature => feature?.type === 'feature')
        .sort((a, b) => a.system.level - b.system.level)
        .filter(feature => feature.system.level <= hero.level.current!)
        .map(feature => ({ feature, level: feature.system.level }))
        .map(({ feature, level }) => ({
            name: feature.name,
            level,
            description: feature.system.dynamicDescription(hero.level.current!),
            img: feature.img
        }))
    )

    let classFeatures: any[] = []

    if (groupedFeatures) {
        classFeatures = Object.keys(groupedFeatures)?.map(f => groupedFeatures[f]?.[0])
    }

    const showTrainingSelection = game.user?.isActiveGM || (hero.level.current! > 0 && getShowTrainingSelectionToggle())
    
    const getPerkSubheader = (perk: any) => {
        if (typeof perk.subheader === "function") return perk.subheader()
        const values: CardSubHeaderValues[] = []
        const model = perk as PerkDataModel
        if (!model.prerequisites?.length) return [{ label: "Req", value: "None" }]
        const spellReqs = perkSpellRerequisitesAsString(model)
        const statReqs = perkStatPrerequisitesAsString(model)
        const trainedReqs = perkTrainingPrerequisitesAsString(model)
        if (spellReqs) values.push({ label: "Spell", value: spellReqs })
        if (statReqs) values.push({ label: "Stat", value: statReqs })
        if (trainedReqs) values.push({ label: "Trained", value: trainedReqs })
        return values
    }

    return (
        <div className="py-1">
            <span className="font-eskapade font-bold">
                {/* ANDCESTRY TRAITS */}
                {hero.ancestry && <>
                    <ClearHeader title={appLang.HeroSheet.ancestry} />
                    <div className="mt-0.5" />
                    <SkillCard
                        title={`${hero.ancestry !== undefined ? getName(hero.ancestry) + " Traits" : ''}`}
                        subtitles={[{ label: 'Size', value: beingSize }, { label: 'Type', value: beingType }]}
                        description={hero.ancestry?.description}
                    />
                </>}

                {/* CLASS FEATURES */}
                <div className="my-2">
                    <ClearHeader title={appLang.HeroSheet.class} />
                    <div className="mt-0.5" />
                    <div className={abilitiesGrid}>
                        {
                            classFeatures.map((f, index) => (
                                <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                                    {
                                        icon: MessageSquareText,
                                        label: 'Send to chat',
                                        action: () => sendVagabondChatMessage(
                                            hero, <AbilityChatCard actorId={getId(hero)} img={f.img ?? ''} title={f.name} description={f.description} />
                                        )
                                    }
                                ])}>
                                    <SkillCard
                                        actor={hero.parent}
                                        img={f.img}
                                        title={f.name}
                                        subtitles={[{ label: getName(hero.class), value: `Level ${f.level}` }]}
                                        description={f.description}
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* PERKS */}
                <ClearHeader title={appLang.HeroSheet.perks} />
                <div className="mt-0.5" />
                <div className={abilitiesGrid}>
                    {
                        hero.perks
                            .sort((a, b) => {
                                const repeatableOrder = Number(Boolean(a.canTakeMultiple)) - Number(Boolean(b.canTakeMultiple))
                                return repeatableOrder || a.parent.name.localeCompare(b.parent.name)
                            })
                            .map((p: any, index: number) => (
                                <div key={index} onContextMenu={(e) => onCtxMenu(e, [
                                    {
                                        icon: MessageSquareText, label: 'Send to chat', action: () => sendVagabondChatMessage(hero,
                                            <AbilityChatCard
                                                actorId={getId(hero)}
                                                img={p.parent.img}
                                                title={p.parent.name}
                                                subtitle={getPerkSubheader(p)}
                                                description={p.description}
                                            />
                                        )
                                    }
                                ])}>
                                    <SkillCard
                                        actor={hero.parent}
                                        img={p.parent.img}
                                        title={p.parent.name}
                                        subtitles={getPerkSubheader(p)}
                                        description={p.description}
                                    />
                                </div>
                            ))
                    }
                </div>
            </span>

            {/* PERK SELECTIONS - Read-only due to how it uses flags to save choices. */}
            <div className={`flex mt-1 w-full mb-8 ${showTrainingSelection ? 'justify-between' : 'justify-end'}`}>
                {showTrainingSelection &&
                    <SecondaryButton onClick={() => new TrainingSelectionApp(hero.parent).render({ force: true })}>
                        Training Selections
                    </SecondaryButton>
                }
                <PrimaryButton onClick={() => new PerkSelectionApp(hero.parent).render({ force: true })}>
                    Perk Selections
                </PrimaryButton>
            </div>

            <ContextMenu />
        </div>
    )
}