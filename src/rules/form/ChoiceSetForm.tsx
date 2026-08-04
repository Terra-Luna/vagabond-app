import React, { useState } from "react"
import { Plus, Trash } from "lucide-react"
import { ChoiceOption } from "../shared/ChoiceOption"
import { FormProps } from "../shared/FormProps"
import { ItemRuleInput, ItemRuleSelector } from "../shared/ItemRuleInput"
import { ItemRulesLabel } from "../shared/ItemRulesTypography"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { createDropdownEntriesFromObj } from "../../utils/localeUtils"
import { vgLiteLang } from "../../utils/lang"

export const ChoiceSetForm = ({ rule, onChange }: FormProps) => {
    // Read the options list array, defaulting to an empty array if uninitialized
    const choices: ChoiceOption[] = rule.choices || []
    const [activeDragIdx, setActiveDragIdx] = useState<number | null>(null)

    // Update specific keys inside an individual option index row using idx
    const handleUpdateOption = async (indexToUpdate: number, fields: Partial<ChoiceOption>) => {
        const updatedChoices = choices.map((choice, idx) => {
            if (idx !== indexToUpdate) return choice
            return { ...choice, ...fields }
        })
        onChange({
            ...rule,
            choices: updatedChoices
        })
    }

    // Add a blank template selection choice row slot to the array
    const handleAddOption = () => {
        onChange({
            ...rule,
            choices: [...choices, { value: "", label: "New Option" }]
        })
    }

    // Remove a specific target selection choice row from the array using oIdx
    const handleRemoveOption = (indexToRemove: number) => {
        onChange({
            ...rule,
            choices: choices.filter((_, idx) => idx !== indexToRemove)
        })
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (rule.channel === "spell" || rule.channel === "perk" || rule.channel === "item") {
            setActiveDragIdx(index)
        }
    }

    const handleDrop = async (e: React.DragEvent, index: number) => {
        e.preventDefault()
        setActiveDragIdx(null)

        if (rule.channel !== "item" && rule.channel !== "perk" && rule.channel !== "spell") return

        const rawData = e.dataTransfer.getData("text/plain")
        if (!rawData) return
        const dropData = JSON.parse(rawData)
        if (dropData.type === "Item" && dropData.uuid) {
            const droppedItem = await fromUuid(dropData.uuid)
            handleUpdateOption(index, {
                value: dropData.uuid,
                label: (droppedItem ? droppedItem.name : choices[index].label) ?? ''
            })
        }
    }

    return (
        <div className="flex flex-col gap-3 text-text-primary bg-sheet-main-fill border border-solid border-table-border p-2">

            {/* CHOICE CONFIGURATION SETTINGS */}
            <div className="grid grid-cols-2 gap-2 items-start">
                <ItemRuleInput
                    label="Name"
                    value={rule.label || ""}
                    placeholder="e.g., Training Choices"
                    onChange={(e) => onChange({ label: e.target.value })}
                    type="text"
                />
                <ItemRuleInput
                    label="Level Req."
                    value={rule.level || 0}
                    placeholder="0"
                    onChange={(e) => onChange({ level: e.target.value })}
                    type="number"
                />
                <ItemRuleInput
                    label="# Choices"
                    value={rule.maxChoices ?? 1}
                    onChange={(e) => onChange({ maxChoices: Math.max(1, Number(e.target.value)) })}
                    type="number"
                />

                {/* CHANNEL SELECT */}
                <ItemRuleSelector
                    label={"Channel"}
                    value={rule.channel ?? ''}
                    options={<>
                        <option value="path">Stat/Attribute Modifier</option>
                        <option value="item">Spells/Perks</option>
                    </>}
                    onChange={(e) => {
                        const val = e.target.value
                        if (val === "path") {
                            onChange({ channel: val, sourceMode: "static", pack: '', choices: [], filters: [] })
                        }
                        else {
                            onChange({ channel: val, pack: 'perk', choices: [], filters: [] })
                        }
                    }}
                />

                {/* SELECT CHOICE SET TYPE: DYNAMIC / STATIC */}
                {(rule.channel === "item" || rule.channel === "perk" || rule.channel === "spell") && <ItemRuleSelector
                    label="Choices Source"
                    value={rule.sourceMode}
                    options={<>
                        <option value="static">Static Manual List</option>
                        <option value="dynamic">Dynamic Item Pack</option>
                    </>}
                    onChange={(e) => {
                        onChange({ sourceMode: e.target.value, filters: [] })
                    }}
                />}

                {/* Conditionally show input field if rule.pack contains a valid string */}
                {rule.sourceMode === "dynamic" && <ItemRuleSelector
                        label="Item Pack Type"
                        value={rule.pack}
                        options={<>
                            <option value="perk">Perks</option>
                            <option value="spell">Spells</option>
                        </>}
                    onChange={(e) => {
                        onChange({ pack: e.target.value, filters: [] })
                    }}
                />}

                {/* Perk Prerequisites Filter Options */}
                {rule.sourceMode === "dynamic" && rule.pack === "perk" && (
                    <div>
                        <div className="flex gap-x-1 items-center">
                            <ItemRulesLabel text={"Prerequisite Filters"} />
                            <IconOnlyButton
                                Icon={Plus}
                                colorClassName="text-text-header-tertiary"
                                onClick={() => {
                                    const currentFilters = rule.filters ? [...rule.filters] : []
                                    const updatedFilters = [...currentFilters, { type: 'training', value: 'melee' }]
                                    onChange({ ...rule, filters: updatedFilters })
                                }}
                            />
                        </div>
                        {
                            rule.filters?.map((filter, index) => (
                                <div key={`${index}-${filter.type}`} className="flex gap-x-1 items-center">
                                    <Trash
                                        size={16}
                                        className="text-destructive-action cursor-pointer"
                                        onClick={() => {
                                            const updatedFilters = rule.filters.filter((_, i) => i !== index);
                                            onChange({ ...rule, filters: updatedFilters })
                                        }}
                                    />
                                    <ItemRuleSelector
                                        label="Filter Type"
                                        value={filter.type}
                                        options={<>
                                            <option value="training">Training</option>
                                            {/* <option value="spell">Spell</option> */}
                                        </>}
                                        onChange={(e) => {
                                            const updatedFilters = [...rule.filters]
                                            updatedFilters[index] = {
                                                ...updatedFilters[index],
                                                type: e.target.value
                                            }
                                            onChange({ ...rule, filters: updatedFilters })
                                        }}
                                    />
                                    <ItemRuleSelector
                                        label="Skill"
                                        value={filter.value}
                                        options={createDropdownEntriesFromObj(vgLiteLang.Skills).map(it => (
                                            <option value={it.value}>{it.label}</option>
                                        ))}
                                        onChange={(e) => {
                                            const updatedFilters = [...rule.filters]
                                            updatedFilters[index] = {
                                                ...updatedFilters[index],
                                                value: e.target.value
                                            }
                                            onChange({ ...rule, filters: updatedFilters })
                                        }}
                                    />
                                </div>
                            ))
                        }
                    </div>
                )}

            </div>

            {/* Sub Options Mapping List (Only renders if source mode is manual/static) */}
            {rule.sourceMode === "static" && (
                <div className="border-t border-solid border-table-border/40 pt-2 mt-1">
                    <div className="flex justify-between items-center mb-2">
                        <ItemRulesLabel text={'CHOICES'} />
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="flex items-center gap-1 border border-solid border-table-border bg-sheet-main-fill text-text-primary px-2 py-0.5 hover:bg-table-border/10 transition-colors"
                        >
                            <Plus size={14} /> Add Option
                        </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {choices.length === 0 ? (
                            <p className="text-text-primary/50 text-xs italic p-1">Click +Add Option to get started...</p>
                        ) : (
                            choices.map((choice, oIdx) => (
                                <div key={oIdx} className="flex gap-2 items-end group/row">
                                    <div className="w-1/2">
                                        <ItemRuleInput
                                            label="Name"
                                            value={choice.label}
                                            placeholder="e.g. Might or Apoplex"
                                            onChange={(e) => handleUpdateOption(oIdx, { label: e.target.value })}
                                            type="text"
                                        />
                                    </div>

                                    <div
                                        className={`w-1/2 p-1 transition-colors duration-100 
                                            ${activeDragIdx === oIdx && (rule.channel === "item" || rule.channel === "perk" || rule.channel === "spell")
                                                ? "bg-context-menu-fill shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                                : "border-table-border/50"
                                            }`
                                        }
                                        onDragOver={(e) => handleDragOver(e, oIdx)}
                                        onDragLeave={() => setActiveDragIdx(null)}
                                        onDrop={(e) => handleDrop(e, oIdx)}
                                    >
                                        <ItemRuleInput
                                            label={(rule.channel === "item" || rule.channel === "perk" || rule.channel === "spell") ? "Item UUID (Drag & Drop Spells/Perks)" : "Path"}
                                            value={choice.value}
                                            placeholder={(rule.channel === "item" || rule.channel === "perk" || rule.channel === "spell") ? "Drop item here to capture UUID..." : "stats.might"}
                                            onChange={(e) => handleUpdateOption(oIdx, { value: e.target.value })}
                                            type="text"
                                        />
                                    </div>

                                    {/* Delete Row Button Wrapper */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(oIdx)}
                                        className="p-1 mb-1 border border-solid border-transparent hover:border-table-border hover:bg-sheet-main-fill text-text-primary/60 hover:text-destructive-action transition-all shrink-0"
                                        title="Delete Option"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}