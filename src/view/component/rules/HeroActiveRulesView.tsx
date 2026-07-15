import { HeroDataModel } from '../../../model/actor/HeroDataModel'
import { HeroCreationLabel } from '../../../apps/hero-creator/component/HeroCreationTypography'
import { CollapsibleSection } from '../Collapsible'

interface ActiveRuleDisplay {
    id: string
    key: string
    label: string
    selector?: string
    value?: number
    uuid?: string
    level: number
    sourceName: string
    sourceImg: string
}

export const HeroActiveRulesView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const currentLevel = actor.system.level.current ?? 0

    // Extract and format active rule elements along with their parent details
    const allRules: ActiveRuleDisplay[] = actor.items.contents.flatMap((item: any) => {
        const itemRules = item.system.rules || []
        return itemRules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: rule.level || 1,
            sourceName: item.name,
            sourceImg: item.img
        }))
    })

    // Separate rules into Active and Upcoming (Locked) categories
    const activeRules = allRules.filter(r => currentLevel >= r.level)
    const lockedRules = allRules.filter(r => currentLevel < r.level)
    const flatModifiers = activeRules.filter(r => r.key === "FlatModifier")

    return (
        <div className="flex flex-col gap-4 p-4 bg-sheet-main-fill text-text-primary max-w-2xl">

            {/* HEADER AND LEVEL PILL */}
            <div className="flex justify-between items-center">
                <HeroCreationLabel text={"ABILITIES & EFFECTS"} />
                <span className="text-sm text-text-header-tertiary bg-sheet-main-fill px-2 py-0.5 rounded-sm border border-solid border-table-border/50">
                    Level {currentLevel}
                </span>
            </div>

            {/* ACTIVE RULES LIST */}
            <CollapsibleSection title={`Active Features & Perks (${activeRules.length})`} settingsKey={'rules-active-features'} content={
                <div className="p-1">
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {activeRules.length === 0 ? (
                            <p className="text-xs text-text-primary italic p-2 bg-sheet-main-fill border border-solid border-table-border/50 rounded-sm">
                                No active rules are adjusting data values.
                            </p>
                        ) : (
                            activeRules.map(rule => (
                                <div key={rule.id} className="flex items-center justify-between text-sm p-2 bg-sheet-main-fill border border-solid border-table-border/50 rounded-sm">
                                    <div className="flex items-center gap-2.5">
                                        <img src={rule.sourceImg} className="w-6 h-6 object-cover rounded-sm border border-solid border-table-border/50 shrink-0" alt="" />
                                        <div>
                                            <div className="text-text-primary font-bold">{rule.label || "Unnamed Feature"}</div>
                                            <div className="text-xs text-text-primary">
                                                Source Item: <span className="text-text-header-tertiary">{rule.sourceName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-text-primary">
                                        {rule.key === "GrantItem" &&
                                            <span className="px-1.5 py-0.5 bg-sheet-main-fill text-text-header-tertiary border border-solid border-table-border/50 rounded-sm text-xs uppercase tracking-wider">
                                                Item Grant
                                            </span>
                                        }
                                        {rule.key === "FlatModifier" && 
                                            <span className="text-xl text-text-primary font-eskapade font-bold">
                                                {(rule.value ?? 0) >= 0 ? `+${rule.value}` : rule.value}
                                            </span>
                                        }
                                        {rule.key === "ToggleRule" &&
                                            <span className="text-sm text-text-primary font-eskapade font-bold">
                                                {rule.value ? "✓" : "✗"}
                                            </span>
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            } />
            
            {/* LOCKED ABILITIES & EFFECTS */}
            {lockedRules.length > 0 && (
                <CollapsibleSection title={`Locked Abilities (${lockedRules.length})`} settingsKey={'rules-locked-features'} content={
                    <div className="p-1 space-y-1 opacity-50 select-none">
                        {lockedRules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-2 bg-sheet-main-fill border border-dashed border-table-border/50 rounded-sm text-xs grayscale">
                                <div className="flex items-center gap-2.5">
                                    <img src={rule.sourceImg} className="w-6 h-6 object-cover rounded-sm border border-solid border-table-border/50 shrink-0" alt="" />
                                    <div>
                                        <div className="font-semibold text-text-primary">{rule.label || "Future Trait"}</div>
                                        <div className="text-[10px] text-slate-600">Unlocks from {rule.sourceName}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-1.5 py-0.5 bg-sheet-main-fill border border-solid border-table-border/50 text-text-primary rounded-sm text-sm uppercase tracking-wider">
                                        Level {rule.level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                } />
            )}

            {/* STAT MODIFIER DATA */}
            {flatModifiers.length > 0 && (
                <CollapsibleSection title={`Active Passive Modifiers Summary`} settingsKey={'rules-data-summary'} content={
                    <div className="p-1">
                        <div className="bg-sheet-main-fill border border-solid border-table-border/50 rounded-sm p-3">
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
                        </div>
                    </div>
                } />
            )}
        </div>
    )
}