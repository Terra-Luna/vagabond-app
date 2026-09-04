import { appLang } from "../../utils/lang"
import { tableBorder } from "../../view/common/border-styles"
import { normalizeRuleSelections } from "../util/item-rules-util"
import { ItemsCache } from "../util/ItemsCache"

export const EffectCardContainer = ({ children }) => {
    return (
        <div className={`p-2 border-t-0 rounded-b-md ${tableBorder}`}>
            <div className="space-y-1 max-h-120 overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

export const ActiveEffectCardRow = ({ rule, isActive = true }) => {

    const items = ItemsCache.items

    const cleanSelectionName = (path?: string) => {
        if (!path) return ""
        if (path.includes("skills.")) {
            const skillKey = path.replace(".trained", "").split(".").reverse()[0]
            return appLang.Skills[skillKey]?.name ?? skillKey
        }
        else if (path.includes("stats.")) {
            const statKey = path.split(".").reverse()[0]
            return appLang.Stat[statKey]?.name ?? statKey
        }
        else {
            return items.get(path)?.name ?? path
        }
    }

    const displaySelections = normalizeRuleSelections(rule.selections)
        .flatMap(selection => [selection.value])
        .filter(Boolean)
        .map(cleanSelectionName)
        .filter(Boolean)

    return (
        <div key={rule.id} className={`
            flex items-center justify-between text-sm p-2 
            bg-sheet-main-fill ${tableBorder}/50 rounded-sm
            ${isActive ? '' : 'opacity-50 select-none'}
        `}>
            <div className="flex items-center gap-2.5">
                <img src={rule.sourceImg} className={`${tableBorder}/50 rounded-sm h-8 object-cover shrink-0`} alt="" />
                <div>
                    <div className="flex gap-x-2">
                        <div className="text-text-primary font-bold">
                            {`${rule.label || "Unnamed Feature"}`}
                        </div>
                        <div className="text-text-secondary font-normal italic">
                            {displaySelections.length > 0 ? ` (${displaySelections.join(", ")})` : ""}
                        </div>
                    </div>
                    <div className="text-xs text-text-primary">
                        Source Item: <span className="text-text-header-tertiary">{rule.sourceName}</span>
                    </div>
                </div>
            </div>
            <div className="text-right text-text-primary">
                {(rule.key === "GrantItem" || (rule.key === "ChoiceSet" && rule.channel === "spell" || rule.channel === "perk")) &&
                    <span className={`px-1.5 py-0.5 bg-sheet-main-fill text-text-header-tertiary text-xs uppercase tracking-wider ${tableBorder}/50 rounded-sm`}>
                        Item Grant
                    </span>
                }
                {rule.key === "FlatModifier" &&
                    <span className="text-xl text-text-primary font-eskapade font-bold">
                        {(rule.value ?? 0) >= 0 ? `+${rule.value}` : rule.value}
                    </span>
                }
            </div>
        </div>
    )
}