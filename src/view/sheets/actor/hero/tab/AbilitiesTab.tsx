import { MessageSquareText } from "lucide-react"

import { PerkSelectionApp } from "../../../../../apps/hero-choices/perks/PerkSelectionApp"
import { TrainingSelectionApp } from "../../../../../apps/hero-choices/training/TrainingSelectionApp"
import { getMiniCardsPref, getShowTrainingSelectionToggle } from "../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
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
import { DynamicGrid } from "../../../../component/DynamicGrid"
import { ClearHeader } from "../../../../component/Header"
import { CardSubHeaderValues, ItemRuleToggleSwitch, SkillCard, SkillCardTitle } from "../../../../component/SkillCard"

export const AbilitiesTab = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const beingSize = appLang.Sizes[hero.ancestry?.beingSize ?? '']
    const beingType = appLang.BeingTypes[hero.ancestry?.beingType ?? '']
    const useMiniCards = getMiniCardsPref(hero.parent.id)

    const groupedFeatures = groupBy('name', (hero.class?.featureIds ?? [])
        .map(featureId => ItemsCache.items.get(featureId))
        .filter(feature => feature?.type === 'feature')
        .sort((a, b) => a.system.level - b.system.level)
        .filter(feature => feature.system.level <= hero.level.current!)
        .map(feature => ({ feature, level: feature.system.level }))
        .map(({ feature, level }) => ({
            id: getId(feature),
            level,
            name: feature.name,
            subheader: feature.system.subheader((hero.class as any)?.parent?.name ?? ""),
            description: feature.system.dynamicDescription(hero.level.current!),
            rules: [...feature.system.rules],
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
        <div className="@container py-1">
            <span className="font-eskapade font-bold">

                {/* CLASS FEATURES */}
                {hero.class && <div className="mb-2">
                    <ClearHeader title={appLang.HeroSheet.class} />
                    <div className="mt-0.5" />
                    <DynamicGrid wideMode={!useMiniCards}>
                        {classFeatures.map((f, index) => (
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
                                    title={
                                        <SkillCardTitle text={f.name}>
                                            {f.rules?.some((rule: any) => rule.toggleableEffect) && <ItemRuleToggleSwitch actor={hero} item={f} />}
                                        </SkillCardTitle>
                                    }
                                    subtitles={f.subheader}
                                    description={f.description}
                                    mini={useMiniCards}
                                />

                            </div>
                        ))}
                    </DynamicGrid>
                </div>}

                {/* PERKS */}
                {hero.perks && hero.perks.length > 0 && <>
                    <ClearHeader title={appLang.HeroSheet.perks} />
                    <div className="mt-0.5" />
                    <DynamicGrid wideMode={!useMiniCards}>
                        {hero.perks.sort((a, b) => {
                                const repeatableOrder = Number(Boolean(a.canTakeMultiple)) - Number(Boolean(b.canTakeMultiple))
                                return repeatableOrder || a.parent.name.localeCompare(b.parent.name)
                        }).map((p: any, index: number) => (
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
                                    title={
                                        <SkillCardTitle text={p.parent.name}>
                                            {p.rules?.some((rule: any) => rule.toggleableEffect) &&
                                                <ItemRuleToggleSwitch actor={hero} item={p} />
                                            }
                                        </SkillCardTitle>
                                    }
                                    subtitles={getPerkSubheader(p)}
                                    description={p.description}
                                    mini={useMiniCards}
                                />
                            </div>
                        ))}
                    </DynamicGrid>
                </>}

                {/* ANDCESTRY TRAITS */}
                {hero.ancestry &&
                    <div className="mt-2">
                        <ClearHeader title={appLang.HeroSheet.ancestry} />
                        <div className="mt-0.5" />
                        <SkillCard
                            title={`${hero.ancestry !== undefined ? getName(hero.ancestry) + " Traits" : ''}`}
                            subtitles={[{ label: 'Size', value: beingSize }, { label: 'Type', value: beingType }]}
                            description={hero.ancestry?.description}
                        />
                    </div>}
            </span>

            {/* PERK AND TRAINING SELECTION BUTTONS */}
            {hero.class && <>
                <div className={`flex gap-x-1 mt-2 w-full mb-8 justify-end`}>
                    {showTrainingSelection &&
                        <SecondaryButton onClick={() => new TrainingSelectionApp(hero.parent).render({ force: true })}>
                            Training Selections
                        </SecondaryButton>
                    }
                    <PrimaryButton onClick={() => new PerkSelectionApp(hero.parent).render({ force: true })}>
                        Perk Selections
                    </PrimaryButton>
                </div>
            </>}

            <ContextMenu />
        </div>
    )
}