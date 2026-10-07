import { HeroDataModel } from '../../model/actor/HeroDataModel'
import { EffectCardContainer,GrantsAndModifiersCard } from '../../rules/shared/GrantsAndModifiersCard'
import { calculateRecurringRuleScale, getItemRuleSources, RuleSelection } from '../../rules/util/item-rules-util'
import { getRuleSelectors, normalizeSelector } from '../../rules/util/selector-util'
import { tableBorder } from '../../view/common/border-styles'
import { CollapsibleSection } from '../../view/component/Collapsible'
import { HeroCreationLabel, HeroCreationSubtext } from '../hero-creator/component/HeroCreationTypography'

interface ActiveRuleDisplay {
    id: string
    key: string
    label: string
    selector?: string[]
    value?: number
    uuid?: string
    level: number
    scale: number
    pack: string
    valueMultiplier?: number
    selections: RuleSelection[] | null
    sourceName: string
    sourceImg: string
    sourceKey: string
}

export const HeroGrantsAndModifiersView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const currentLevel = actor.system.level.current ?? 0

    // Extract and format active rule elements along with their parent details
    const allRules: ActiveRuleDisplay[] = actor.items.contents.flatMap((item: any) => {
        const sources = getItemRuleSources(item)
        return sources.flatMap(source => source.rules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: Number(rule.level ?? 1),
            pack: rule.pack,
            selections: rule.selections,
            sourceName: source.item?.name || item.name,
            sourceImg: source.item?.img || item.img,
            sourceKey: String(source.item?.uuid ?? source.item?.id ?? source.item?._id ?? item.uuid ?? item.id ?? item._id),
            value: getRuleSelectors(rule).some(s => s.includes("class.maxCastFormula"))
                ? actor.system.mana.maxCast
                : (Number.isNaN(Number(rule.value))
                    ? String(rule.value).toUpperCase()
                    : (Number(rule.level) > 0 && Number(rule.scale) > 0)
                        ? calculateRecurringRuleScale(currentLevel, rule.level, rule.scale ?? 0) * Number(rule.value)
                        : Number(rule.value) * Number(foundry.utils.getProperty(actor, `system.${rule.valueMultiplier}`) ?? 1)
                )
        })))
    })

    actor.system.perks.forEach(item => {
        const itemRules = item.rules || []
        const rules = itemRules.map((rule: any) => ({
            ...rule,
            id: rule.id || foundry.utils.randomID(),
            level: Number(rule.level ?? 1),
            pack: rule.pack,
            selections: rule.selections,
            sourceName: item.parent.name,
            sourceImg: item.parent.img,
            sourceKey: String(item.parent.uuid ?? item.parent.id ?? item.parent._id ?? item._sourceId ?? item.parent.name)
        })) as ActiveRuleDisplay[]

        rules.forEach(rule => { allRules.push(rule) })
    })

    // Separate rules into Active and Upcoming (Locked) categories
    const applicableRules = allRules.filter(r => r.level <= currentLevel && !getRuleSelectors(r).some(s => s.startsWith("flags.")))
    const lockedRules = allRules.filter(r => r.level > currentLevel).sort((a, b) => { return a.level - b.level })
    const flatModifiers = applicableRules.filter(r => r.key === "FlatModifier")
    const highestMinMaxValueBySourceAndPath = new Map<string, number>()

    flatModifiers.forEach(mod => {
        const value = Number(mod.value)
        if (!Number.isFinite(value)) return

        getRuleSelectors(mod)
            .map(normalizeSelector)
            .filter(path => /\.(min|max)$/.test(path))
            .forEach(path => {
                const key = JSON.stringify([mod.sourceKey, path])
                highestMinMaxValueBySourceAndPath.set(
                    key,
                    Math.max(highestMinMaxValueBySourceAndPath.get(key) ?? -Infinity, value)
                )
            })
    })

    const activeRules = applicableRules.filter(rule => {
        if (rule.key !== "FlatModifier") return true

        const selectors = getRuleSelectors(rule).map(normalizeSelector)
        const minMaxSelectors = selectors.filter(path => /\.(min|max)$/.test(path))
        if (minMaxSelectors.length === 0) return true

        const value = Number(rule.value)
        if (!Number.isFinite(value)) return true

        return selectors.some(path => {
            if (!/\.(min|max)$/.test(path)) return true
            return value === highestMinMaxValueBySourceAndPath.get(JSON.stringify([rule.sourceKey, path]))
        })
    })

    const visibleFlatModifiers = activeRules.filter(r => r.key === "FlatModifier")
    const modifierSummaryRows: { mod: ActiveRuleDisplay, path: string }[] = []
    const minMaxModifiers = new Map<string, ActiveRuleDisplay[]>()

    visibleFlatModifiers.forEach(mod => {
        const paths = getRuleSelectors(mod).map(normalizeSelector)
        const regularPaths = paths.filter(path => !/\.(min|max)$/.test(path))

        if (regularPaths.length > 0 || paths.length === 0) {
            modifierSummaryRows.push({ mod, path: regularPaths.join(", ") || "stat" })
        }

        paths.filter(path => /\.(min|max)$/.test(path)).forEach(path => {
            const key = JSON.stringify([mod.sourceKey, path])
            const modifiers = minMaxModifiers.get(key) ?? []
            modifiers.push(mod)
            minMaxModifiers.set(key, modifiers)
        })
    })

    minMaxModifiers.forEach(modifiers => {
        const path = getRuleSelectors(modifiers[0]).map(normalizeSelector).find(selector => /\.(min|max)$/.test(selector)) ?? "stat"
        const numericValues = modifiers
            .map(mod => ({ mod, value: Number(mod.value) }))
            .filter(entry => Number.isFinite(entry.value))

        if (numericValues.length === 0) {
            modifiers.forEach(mod => modifierSummaryRows.push({ mod, path }))
            return
        }

        const highestValue = Math.max(...numericValues.map(entry => entry.value))
        numericValues
            .filter(entry => entry.value === highestValue)
            .forEach(entry => modifierSummaryRows.push({ mod: entry.mod, path }))
        modifiers
            .filter(mod => !Number.isFinite(Number(mod.value)))
            .forEach(mod => modifierSummaryRows.push({ mod, path }))
    })

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
                        ? activeRules.map(rule => (<GrantsAndModifiersCard key={rule.id} rule={rule} />))
                        : <HeroCreationSubtext text={"No active rules are adjusting data values."} />
                    }
                </EffectCardContainer>
            } />

            {/* LOCKED GRANTS & MODIFIERS */}
            {lockedRules.length > 0 && (
                <CollapsibleSection title={`Locked Grants & Modifiers (${lockedRules.length})`} settingsKey={'rules-locked-features'} content={
                    <EffectCardContainer>
                        {lockedRules.map(rule => (
                            <GrantsAndModifiersCard key={rule.id} rule={rule} isActive={false} />
                        ))}
                    </EffectCardContainer>
                } />
            )}

            {/* STAT MODIFIER DATA */}
            {visibleFlatModifiers.length > 0 && (
                <CollapsibleSection title={`Passive Modifiers Summary`} settingsKey={'rules-data-summary'} content={
                    <EffectCardContainer>
                        <div className="flex flex-col gap-1">
                            {modifierSummaryRows
                                .sort((a, b) => (a.mod.label || "").localeCompare(b.mod.label || "") || a.path.localeCompare(b.path))
                                .map(({ mod, path }) => (
                                    <div
                                        key={`${mod.id}:${path}`}
                                        className={`flex justify-between items-center text-xs bg-sheet-main-fill px-2 py-1.5 ${tableBorder}/50 rounded`}>
                                        <span className="text-text-primary line-clamp-1">
                                            {mod.label || "Modifier"} <span className="text-text-primary">({path})</span>
                                        </span>
                                        {/* BONUS VALUE PILL */}
                                        <span className={`
                                            text-sm font-eskapade font-bold px-1.5
                                            ${tableBorder}/50 rounded-sm
                                            text-text-primary bg-sheet-main-fill
                                        }`}>
                                            {mod.value}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </EffectCardContainer>
                } />
            )}
        </div>
    )
}