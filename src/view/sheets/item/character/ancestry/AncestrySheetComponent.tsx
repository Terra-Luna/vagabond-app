import { AncestryDataModel } from "../../../../../model/item/character/AncestryDataModel"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { normalizeRuleSelections, randomId } from "../../../../../rules/util/item-rules-util"
import { appLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { useContextMenu } from "../../../../component/ContextMenu"
import { DropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { Description } from "../../../shared/Description"
import { useImageEdit } from "../../../shared/ImageEditUseCase"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { ItemSheetBanner } from "../../shared/ItemSheetBanner"

export const AncestrySheetComponent = ({ item }: { item: Item & { system: AncestryDataModel } | null }) => {
    if (!item) return
    const { isEditMode } = useEditMode()
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    const ancestry = item.system

    const choiceRules = (ancestry.rules as any[] | undefined)?.filter(r =>
        r.key === "ChoiceSet" &&
        r.channel === "path" &&
        (r.choices as any[])?.some(choice => !choice.value.includes("skills.")) &&
        (r.choices as any[])?.some(choice => !choice.value.includes("stats."))
    ) ?? []

    const onSelectChoice = (ruleId: string, value: string) => {
        const rules = foundry.utils.deepClone(ancestry.rules as any[])
        const rule = rules.find(r => r.id === ruleId)
        if (!rule) return
        const existing = normalizeRuleSelections(rule.selections)[0]
        rule.selections = value ? [{ id: existing?.id ?? randomId(), value, subselect: "" }] : []
        item.update({ "system.rules": rules } as Record<string, any>)
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* STORYBOOK IMAGE */}
            <div className="w-1/3 sticky top-0 flex justify-start items-start bg-sheet-header-fill" onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
                <img src={item.img ?? ''} className="w-full object-contain" />
                <ContextMenu />
            </div>

            {/* ITEM SHEET - SCROLLABLE */}
            <div className="w-2/3 h-full min-h-0 flex flex-col overflow-hidden">
                <BaseItemSheetComponent
                    bodyClassName="mt-2 mx-2 pb-10"
                    banner={<ItemSheetBanner item={item} hideImage={true} />}
                    description={<Description item={item} showFullView={true} italic={false} editHeight={300} />}
                    body={
                        <>
                            {isEditMode && (
                                <div className="text-header-text-secondary flex gap-2 mb-2">
                                    <DropDown
                                        label={appLang.ItemSheet.size}
                                        variant="alternate"
                                        options={createDropdownEntries(appLang.Sizes)}
                                        parent={ancestry.parent}
                                        updateMechanism={{ updatePath: ['beingSize'] }}
                                        value={ancestry.beingSize ?? ''}
                                    />
                                    <DropDown
                                        label={appLang.ItemSheet.type}
                                        variant="alternate"
                                        options={createDropdownEntries(appLang.BeingTypes, true)}
                                        parent={ancestry.parent}
                                        updateMechanism={{ updatePath: ['beingType'] }}
                                        value={ancestry.beingType}
                                    />
                                    <DropDown
                                        label={appLang.ItemSheet.subtype}
                                        variant="alternate"
                                        options={createDropdownEntries(appLang.BeingSubtypes, true)}
                                        parent={ancestry.parent}
                                        updateMechanism={{ updatePath: ['beingSubType'] }}
                                        value={ancestry.beingSubType}
                                    />
                                </div>
                            )}

                            {isEditMode && item.parent && item.isOwner && choiceRules.length > 0 && (
                                <div className="text-header-text-secondary flex gap-2 mb-2">
                                    {choiceRules.map(rule => (
                                        <DropDown
                                            key={rule.id}
                                            label={rule.label}
                                            variant="alternate"
                                            options={[{ value: '', label: '-' }, ...rule.choices.map((c: any) => ({ value: c.value, label: c.label }))]}
                                            updateMechanism={{ onChange: (val: string) => onSelectChoice(rule.id, val) }}
                                            value={normalizeRuleSelections(rule.selections)[0]?.value ?? ''}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isEditMode && item.parent && choiceRules.some(rule => normalizeRuleSelections(rule.selections)[0]) && (
                                <div className="flex flex-wrap gap-x-4 mb-2 text-text-primary font-eskapade">
                                    {choiceRules.map(rule => {
                                        const selected = normalizeRuleSelections(rule.selections)[0]?.value
                                        const choice = rule.choices.find((c: any) => c.value === selected)
                                        if (!selected) return null
                                        return (
                                            <div key={rule.id}>
                                                <span className="font-bold">{rule.label}:</span> {choice?.label ?? selected}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <ItemRulesManager item={item} />
                        </>
                    }
                />
            </div>
        </div>
    )
}