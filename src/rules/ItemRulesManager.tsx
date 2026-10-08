import { Trash } from "lucide-react"
import { useCallback } from "react"

import { HeroCreationLabel } from "../apps/hero-creator/component/HeroCreationTypography"
import { BaseItemSchema, ItemDataModel } from "../model/item/ItemDataModel"
import { appLang } from "../utils/lang"
import { tableBorder } from "../view/common/border-styles"
import { UtilityButton } from "../view/component/Button"
import { CollapsibleSection } from "../view/component/Collapsible"
import { FoundryHotkeyBlocker } from "../view/component/FoundryHotkeyBlocker"
import { ItemDivider } from "../view/component/Header"
import { useEditMode } from "../view/context/EditModeContext/Hooks"
import { ChoiceSetForm } from "./form/ChoiceSetForm"
import { FlatModifierForm } from "./form/FlatModifierForm"
import { GrantItemForm } from "./form/GrantItemForm"
import { ToggleRuleForm } from "./form/ToggleRuleForm"
import { ItemRuleSelector } from "./shared/ItemRuleInput"
import { RuleElement } from "./shared/RuleElement"
import { RuleSelection } from "./util/item-rules-util"
import { getRuleSelectors } from "./util/selector-util"

export interface ChoiceRule {
    id: string
    key: "ChoiceSet",
    label: string,
    level: number,
    scale: number,
    maxChoices: number,
    channel: "path" | "item",
    sourceMode: "static" | "dynamic",
    choices: { value: string, label: string }[],
    selections: RuleSelection[]
}

export const ItemRulesManager = ({ item, name, level, scale }: {
    item: Item & { system: ItemDataModel<BaseItemSchema> }, name?: string, level?: number, scale?: number
}) => {

    const { isEditMode } = useEditMode()

    const rules: RuleElement[] = item.system.rules as RuleElement[] || []

    const updateRules = useCallback(async (newRules: RuleElement[]) => {
        await item.update({ "system.rules": newRules } as Record<string, RuleElement[]>)
    }, [item])

    // Provide a starting template...
    const handleAddRule = () => {
        const defaultRule: RuleElement = {
            id: foundry.utils.randomID(),
            key: "FlatModifier", // FlatModifer, ItemGrant, ToggleRule, ChoiceSet
            label: name ?? "",
            level: level ?? 0,
            value: 0,
            selector: []
        }
        updateRules([...rules, defaultRule])
    }

    // Remove an item by its array index position
    const handleRemoveRule = (indexToRemove: number) => {
        const filteredRules = rules.filter((_, idx) => idx !== indexToRemove)
        updateRules(filteredRules)
    }

    // Update a single rule element's inner properties
    const handleUpdateRuleData = (indexToUpdate: number, updatedFields: Partial<RuleElement>, swapRuleType: boolean = false) => {
        const advRules = rules.map((rule, idx) => {
            if (idx !== indexToUpdate) return rule
            if (swapRuleType) {
                return { ...updatedFields as RuleElement }
            }
            else {
                return { ...rule, ...updatedFields }
            }
        })
        updateRules(advRules)
    }

    if (!isEditMode) return
    else return (
        <FoundryHotkeyBlocker>
            <CollapsibleSection title={"GRANTS & MODIFIERS"} startCollapsed={true} content={
                <div className={`p-2 bg-sheet-main-fill mb-8 ${tableBorder}`}>
                    <div className="flex justify-between items-center pb-2">
                        <HeroCreationLabel text={'Item Grants & Modifiers'} />
                        <UtilityButton onClick={handleAddRule}>
                            <p>+ {appLang.ButtonActions.add}</p>
                        </UtilityButton>
                    </div>

                    <ItemDivider />

                    <div className="space-y-2 pt-2">
                        {rules.length === 0 ? (
                            <p className="text-text-primary text-sm italic">Click +Add to get started...</p>
                        ) : (
                            rules.map((rule, index) => (
                                <CollapsibleSection key={index} title={rule.label} startCollapsed={true} content={
                                    <div className={`bg-sheet-main-fill border-t-0 p-2 relative group ${tableBorder}`}>
                                        {/* HEADER ROW W/ +ADD BUTTON */}
                                        <div className="flex gap-4 items-center mb-2">
                                            <ItemRuleSelector
                                                label={"Type"}
                                                value={rule.key}
                                                options={<>
                                                    <option value="FlatModifier">Modifiers (Stats/Attributes/Flags)</option>
                                                    <option value="ToggleRule">Toggle Rule (Trainings, etc...)</option>
                                                    <option value="GrantItem">Grants (Spells, Perks, etc.)</option>
                                                    <option value="ChoiceSet">Choice Set</option>
                                                </>}
                                                onChange={(e) => {
                                                    const newType = e.target.value ?? foundry.utils.randomID()
                                                    let updatedBase: any
                                                    if (newType === "FlatModifier") {
                                                        updatedBase = {
                                                            id: (e.target.id == null || e.target.id.length === 0) ? foundry.utils.randomID() : e.target.id,
                                                            key: "FlatModifier",
                                                            label: rule.label || "",
                                                            level: level ?? 0,
                                                            scale: scale ?? 0,
                                                            value: 0,
                                                            valueMultiplier: '',
                                                            selector: getRuleSelectors(rule)
                                                        }
                                                    }
                                                    else if (newType === "ToggleRule") {
                                                        updatedBase = {
                                                            id: (e.target.id == null || e.target.id.length === 0) ? foundry.utils.randomID() : e.target.id,
                                                            key: "ToggleRule",
                                                            label: rule.label || "",
                                                            level: level ?? 0,
                                                            value: true,
                                                            selector: getRuleSelectors(rule)
                                                        }
                                                    }
                                                    else if (newType === "GrantItem") {
                                                        updatedBase = {
                                                            id: (e.target.id == null || e.target.id.length === 0) ? foundry.utils.randomID() : e.target.id,
                                                            key: "GrantItem",
                                                            label: rule.label || "",
                                                            level: level ?? 0,
                                                            uuid: ""
                                                        }
                                                    }
                                                    else if (newType === "ChoiceSet") {
                                                        updatedBase = {
                                                            id: (e.target.id == null || e.target.id.length === 0) ? foundry.utils.randomID() : e.target.id,
                                                            key: "ChoiceSet",
                                                            label: rule.label || "",
                                                            level: level ?? 0,
                                                            scale: scale ?? 0,
                                                            maxChoices: 1,
                                                            channel: "path", // "path" or "item"
                                                            sourceMode: "static", // "static" or "dynamic"
                                                            choices: [],
                                                            selections: []
                                                        }
                                                    }
                                                    // Overwrite the rule in the current index with fresh data structure.
                                                    handleUpdateRuleData(index, updatedBase, true)
                                                }}
                                            />

                                            {/* DELETE BUTTON */}
                                            <Trash size={20} className="text-destructive-action/80 ml-auto -mt-2 cursor-pointer" onClick={() => handleRemoveRule(index)} />
                                        </div>

                                        {/* LIST THE GRANTS & MODIFIER SUB-CARD SETTINGS */}
                                        {rule.key === "FlatModifier" && <FlatModifierForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "ToggleRule" && <ToggleRuleForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "GrantItem" && <GrantItemForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "ChoiceSet" && <ChoiceSetForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}

                                    </div>
                                } />
                            ))
                        )}
                    </div>
                </div>
            } />
        </FoundryHotkeyBlocker>
    )
}