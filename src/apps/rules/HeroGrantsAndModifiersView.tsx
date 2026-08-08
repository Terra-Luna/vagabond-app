import { HeroDataModel } from '../../model/actor/HeroDataModel'
import { HeroCreationLabel, HeroCreationSubtext } from '../hero-creator/component/HeroCreationTypography'
import { CollapsibleSection } from '../../view/component/Collapsible'
import { ActiveEffectCardRow, EffectCardContainer } from '../../rules/shared/ActiveEffectCardRow'

interface ActiveRuleDisplay {
    id: string
    key: string
    label: string
    selector?: string
    value?: number
    uuid?: string
    level: number
    pack: string
    selections: string[] | null
    sourceName: string
    sourceImg: string
}

export const HeroGrantsAndModifiersView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const currentLevel = actor.system.level.current ?? 0

    // Extract and format active rule elements along with their parent details
    const allRules: ActiveRuleDisplay[] = actor.items.contents.flatMap((item: any) => {
        const itemRules = item.system.rules || []
        return itemRules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: rule.level || 1,
            pack: rule.pack,
            selections: rule.selections,
            sourceName: item.name,
            sourceImg: item.img,
        }))
    })

    // Separate rules into Active and Upcoming (Locked) categories
    const activeRules = allRules.filter(r => r.level <= currentLevel)
    const lockedRules = allRules.filter(r => r.level > currentLevel).sort((a, b) => { return a.level - b.level })
    const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")

    return (
        <div className="flex flex-col gap-4 p-4 bg-sheet-main-fill text-text-primary max-w-2xl">

            {/* HEADER AND LEVEL PILL */}
            <div className="flex justify-between items-center">
                <HeroCreationLabel text={"GRANTS & MODIFIERS"} />
                <span className="text-sm text-text-header-tertiary bg-sheet-main-fill px-2 py-0.5 rounded-sm border border-solid border-table-border/50">
                    Level {currentLevel}
                </span>
            </div>

            {/* ACTIVE RULES LIST */}
            <CollapsibleSection title={`Active (${activeRules.length})`} settingsKey={'rules-active-features'} content={
                <EffectCardContainer>
                    {activeRules.length > 0 ?
                        activeRules.map(rule => (<ActiveEffectCardRow key={rule.id} rule={rule} />)) :
                        <HeroCreationSubtext text={"No active rules are adjusting data values."} />
                    }
                </EffectCardContainer>
            } />

            {/* LOCKED GRANTS & MODIFIERS */}
            {lockedRules.length > 0 && (
                <CollapsibleSection title={`Locked Grants & Modifiers (${lockedRules.length})`} settingsKey={'rules-locked-features'} content={
                    <EffectCardContainer>
                        {lockedRules.map(rule => (
                            <ActiveEffectCardRow key={rule.id} rule={rule} isActive={false} />
                        ))}
                    </EffectCardContainer>
                } />
            )}

            {/* STAT MODIFIER DATA */}
            {flatModifiers.length > 0 && (
                <CollapsibleSection title={`Passive Modifiers Summary`} settingsKey={'rules-data-summary'} content={
                    <EffectCardContainer>
                        <div className="grid grid-cols-2 gap-2">
                            {flatModifiers.map(mod => {
                                // Extract a clean readable path suffix (e.g., system.attributes.hp.max -> hp.max)
                                const cleanPath = mod.selector?.replace("system.", "") || "stat"
                                return (
                                    <div
                                        key={mod.id}
                                        className="flex justify-between items-center text-xs bg-sheet-main-fill border border-solid border-table-border/50 px-2 py-1.5 rounded">
                                        <span className="text-text-primary">
                                            {mod.label || "Modifier"} <span className="text-text-primary">({cleanPath})</span>
                                        </span>
                                        {/* BONUS VALUE PILL */}
                                        <span className={`
                                                text-base font-eskapade font-bold px-1.5
                                                border border-solid border-table-border/50 rounded-sm
                                                ${(mod.value ?? 0) >= 0 ?
                                                'text-text-primary bg-sheet-main-fill' :
                                                'text-destructive-action bg-destructive-action/10'}`
                                        }>
                                            {(mod.value ?? 0) >= 0 ? `+${mod.value}` : mod.value}
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