import { vgLiteLang } from "../../../../utils/lang"

export const ActiveEffectCardRow = ({ rule }) => {

    const cleanSelectionName = (path: string) => {
        if (path.includes("skills.")) {
            return vgLiteLang.Skills[path.replace(".isTrained", "").split(".").reverse()[0]].name
        }
        else if (path.includes("stats.")) { 
            return vgLiteLang.Stat[path.split(".").reverse()[0]].name
        }
    }

    return (
        <div key={rule.id} className="flex items-center justify-between text-sm p-2 bg-sheet-main-fill border border-solid border-table-border/50 rounded-sm">
            <div className="flex items-center gap-2.5">
                <img src={rule.sourceImg} className="w-6 h-6 object-cover rounded-sm border border-solid border-table-border/50 shrink-0" alt="" />
                <div>
                    <div className="flex gap-x-2">
                        <div className="text-text-primary font-bold">
                            {`${rule.label || "Unnamed Feature"}`}
                        </div>
                        <div className="text-text-secondary font-normal italic">
                            {`${rule.selections?.length > 0 ? ` (${rule.selections?.map(s => cleanSelectionName(s))?.join(", ")})` : ""}`}
                        </div>
                    </div>
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
                {(rule.key === "ToggleRule" || rule.key === "ChoiceSet") &&
                    <span className="text-sm text-text-primary font-eskapade font-bold">
                        {rule.value ? "✓" : "✗"}
                    </span>
                }
            </div>
        </div>
    )
}