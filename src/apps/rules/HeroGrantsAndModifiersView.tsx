import { HeroDataModel } from '../../model/actor/HeroDataModel'
import { ActiveEffectCardRow, EffectCardContainer } from '../../rules/shared/ActiveEffectCardRow'
import { getItemRuleSources, RuleSelection } from '../../rules/util/item-rules-util'
import { tableBorder } from '../../view/common/border-styles'
import { CollapsibleSection } from '../../view/component/Collapsible'
import { HeroCreationLabel, HeroCreationSubtext } from '../hero-creator/component/HeroCreationTypography'

interface ActiveRuleDisplay {
    id: string
    key: string
    label: string
    selector?: string
    value?: number
    uuid?: string
    level: number
    pack: string
    valueMultiplier?: number
    selections: RuleSelection[] | null
    sourceName: string
    sourceImg: string
}

export const HeroGrantsAndModifiersView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const currentLevel = actor.system.level.current ?? 0

    // Extract and format active rule elements along with their parent details
    const allRules: ActiveRuleDisplay[] = actor.items.contents.flatMap((item: any) => {
        const sources = getItemRuleSources(item)
        return sources.flatMap(source => source.rules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: rule.level || 1,
            pack: rule.pack,
            selections: rule.selections,
            sourceName: source.item?.name || item.name,
            sourceImg: source.item?.img || item.img,
        })))
    })

    actor.system.perks.forEach(item => {
        const itemRules = item.rules || []
        const rules = itemRules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: rule.level || 1,
            pack: rule.pack,
            selections: rule.selections,
            sourceName: item.parent.name,
            sourceImg: item.parent.img,
        })) as ActiveRuleDisplay[]
        rules.forEach(rule => {
            allRules.push(rule)
        })
    })

    // Separate rules into Active and Upcoming (Locked) categories
    const activeRules = allRules.filter(r => r.level <= currentLevel && !r.selector?.startsWith("flags."))
    const lockedRules = allRules.filter(r => r.level > currentLevel).sort((a, b) => { return a.level - b.level })
    const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")

    return (
        <div className="flex flex-col gap-4 p-4 bg-sheet-main-fill text-text-primary max-w-2xl">

            {/* HEADER AND LEVEL PILL */}
            <div className="flex justify-between items-center">
                <HeroCreationLabel text={"GRANTS & MODIFIERS"} />
                <span className={`text-sm text-text-header-tertiary bg-sheet-main-fill px-2 py-0.5 ${tableBorder}/50 rounded-sm`}>
                    Level {currentLevel}
                </span>
            </div>

            {/* ACTIVE RULES LIST */}
            <CollapsibleSection title={`Active (${activeRules.length})`} settingsKey={'rules-active-features'} content={
                <EffectCardContainer>
                    {activeRules.length > 0
                        ? activeRules.map(rule => (<ActiveEffectCardRow key={rule.id} actor={actor} rule={rule} />))
                        : <HeroCreationSubtext text={"No active rules are adjusting data values."} />
                    }
                </EffectCardContainer>
            } />

            {/* LOCKED GRANTS & MODIFIERS */}
            {lockedRules.length > 0 && (
                <CollapsibleSection title={`Locked Grants & Modifiers (${lockedRules.length})`} settingsKey={'rules-locked-features'} content={
                    <EffectCardContainer>
                        {lockedRules.map(rule => (
                            <ActiveEffectCardRow key={rule.id} actor={actor} rule={rule} isActive={false} />
                        ))}
                    </EffectCardContainer>
                } />
            )}

            {/* STAT MODIFIER DATA */}
            {flatModifiers.length > 0 && (
                <CollapsibleSection title={`Passive Modifiers Summary`} settingsKey={'rules-data-summary'} content={
                    <EffectCardContainer>
                        <div className="flex flex-col gap-1">
                            {flatModifiers.map(mod => {
                                // Extract a clean readable path suffix (e.g., system.attributes.hp.max -> hp.max)
                                const cleanPath = mod.selector?.replace("system.", "") || "stat"
                                const modValue = String(foundry.utils.getProperty(actor, `system.${cleanPath}`)).toUpperCase()

                                return (
                                    <div
                                        key={mod.id}
                                        className={`flex justify-between items-center text-xs bg-sheet-main-fill px-2 py-1.5 ${tableBorder}/50 rounded`}>
                                        <span className="text-text-primary line-clamp-1">
                                            {mod.label || "Modifier"} <span className="text-text-primary">({cleanPath})</span>
                                        </span>
                                        {/* BONUS VALUE PILL */}
                                        <span className={`
                                            text-sm font-eskapade font-bold px-1.5
                                            ${tableBorder}/50 rounded-sm
                                            text-text-primary bg-sheet-main-fill
                                        }`}>
                                            {modValue === "0" ? "" : modValue}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </EffectCardContainer>
                } />
            )}
        </div>
    )
}