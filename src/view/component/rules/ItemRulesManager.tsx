import { useCallback } from "react"
import { BaseItemSchema, ItemDataModel } from "../../../model/item/ItemDataModel"
import { Plus, Trash } from "lucide-react"
import { PrimaryButton } from "../Button"
import { FoundryHotkeyBlocker } from "../FoundryHotkeyBlocker"
import { vgLiteLang } from "../../../utils/lang"
import { RuleElement } from "./shared/RuleElement"
import { CollapsibleSection } from "../Collapsible"
import { useEditMode } from "../../context/EditModeContext/Hooks"
import { ItemRuleSelector } from "./shared/ItemRuleInput"
import { ChoiceSetForm } from "./form/ChoiceSetForm"
import { FlatModifierForm } from "./form/FlatModifierForm"
import { GrantItemForm } from "./form/GrantItemForm"
import { ToggleRuleForm } from "./form/ToggleRuleForm"
import { HeroCreationLabel } from "../../../apps/hero-creator/component/HeroCreationTypography"

export const ItemRulesManager = ({ item }: { item: Item & { system: ItemDataModel<BaseItemSchema> } }) => {
    const { isEditMode } = useEditMode()

    const rules: RuleElement[] = item.system.rules as RuleElement[] || []

    const updateRules = useCallback(async (newRules: RuleElement[]) => {
        await item.update({ "system.rules": newRules } as Record<string, RuleElement[]>)
    }, [item])

    // Provide a starter template...
    const handleAddRule = () => {
        const defaultRule: RuleElement = {
            id: foundry.utils.randomID(),
            key: "FlatModifier", // FlatModifer, ItemGrant, ToggleRule, ChoiceSet
            type: "",
            label: "",
            level: 0,
            value: 0,
            selector: ""
        }
        updateRules([...rules, defaultRule])
    }

    // Remove an item by its array index position
    const handleRemoveRule = (indexToRemove: number) => {
        const filteredRules = rules.filter((_, idx) => idx !== indexToRemove)
        updateRules(filteredRules)
    }

    // Update a single rule element's inner properties
    const handleUpdateRuleData = (indexToUpdate: number, updatedFields: Partial<RuleElement>) => {
        const advancedRules = rules.map((rule, idx) => {
            if (idx !== indexToUpdate) return rule
            return { ...rule, ...updatedFields }
        })
        updateRules(advancedRules)
    }

    if (!isEditMode) return
    return (
        <FoundryHotkeyBlocker>
            <CollapsibleSection title={"GRANTS & MODIFIERS"} content={
                <div className="p-2 bg-context-menu-fill border border-solid border-table-border mb-24">
                    <div className="flex justify-between items-center mb-4 border-b border-solid border-table-border pb-2">
                        <HeroCreationLabel text={'Item Grants & Modifiers'} />
                        <PrimaryButton onClick={handleAddRule} icon={<Plus size={20} />}>
                            <p>{vgLiteLang.ButtonActions.add}</p>
                        </PrimaryButton>
                    </div>

                    <div className="space-y-4">
                        {rules.length === 0 ? (
                            <p className="text-text-primary text-sm italic">Click +Add to get started...</p>
                        ) : (
                            rules.map((rule, index) => (
                                <CollapsibleSection key={index} title={rule.label} content={
                                    <div className="bg-sheet-main-fill border border-solid border-table-border p-2 relative group">
                                        {/* HEADER ROW W/ +ADD BUTTON */}
                                        <div className="flex gap-4 items-center mb-2">
                                            <ItemRuleSelector
                                                label={"Type"}
                                                value={rule.key}
                                                options={<>
                                                    <option value="FlatModifier">Flat Modifier (Stats/Attributes)</option>
                                                    <option value="GrantItem">Grants (Spells, Perks, or Items)</option>
                                                    <option value="ToggleRule">Toggle Rule (Trainings, etc...)</option>
                                                    <option value="ChoiceSet">Choice Set</option>
                                                </>}
                                                onChange={(e) => {
                                                    const newType = e.target.value
                                                    let updatedBase: any
                                                    if (newType === "FlatModifier") {
                                                        updatedBase = {
                                                            key: "FlatModifier",
                                                            value: 0,
                                                            label: rule.label || "",
                                                            selector: rule.selector || ""
                                                        }
                                                    }
                                                    else if (newType === "GrantItem") {
                                                        updatedBase = {
                                                            key: "GrantItem",
                                                            uuid: "",
                                                            label: rule.label || ""
                                                        }
                                                    }
                                                    else if (newType === "ToggleRule") {
                                                        updatedBase = {
                                                            key: "ToggleRule",
                                                            value: true,
                                                            label: rule.label || "",
                                                            selector: rule.selector || ""
                                                        }
                                                    }
                                                    else if (newType === "ChoiceSet") {
                                                        updatedBase = {
                                                            key: "ChoiceSet",
                                                            label: rule.label || "",
                                                            value: 1,
                                                            maxChoices: 1,
                                                            pack: "",
                                                            flag: "",
                                                            choices: []
                                                        }
                                                    }
                                                    handleUpdateRuleData(index, updatedBase)
                                                }}
                                            />

                                            {/* DELETE BUTTON */}
                                            <Trash size={20} className="text-destructive-action/80 ml-auto -mt-2 cursor-pointer" onClick={() => handleRemoveRule(index)} />
                                        </div>

                                        {/* LIST THE GRANTS & MODIFIER SUB-CARD SETTINGS */}
                                        {rule.key === "FlatModifier" && <FlatModifierForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "GrantItem" && <GrantItemForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "ToggleRule" && <ToggleRuleForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}
                                        {rule.key === "ChoiceSet" && <ChoiceSetForm rule={rule} onChange={(data) => handleUpdateRuleData(index, data)} />}

                                    </div>
                                } />
                            ))
                        )}
                    </div>
                    <div className="flex w-full mt-2">
                        <div className="ml-auto">
                            <PrimaryButton onClick={handleAddRule} icon={<Plus size={20} />}>
                                <p>{vgLiteLang.ButtonActions.add}</p>
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            } />
        </FoundryHotkeyBlocker>
    )
}