import { PenSquare, Save,Trash } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { RollPreset } from "../../../../../apps/attack-builder/model/RollPreset"
import { RollBuilderView } from "../../../../../apps/attack-builder/RollBuilderView"
import { SavingThrowType } from "../../../../../combat/engine/AdversaryAttack"
import { AppliedFx } from "../../../../../combat/engine/Attack"
import { CountdownResult } from "../../../../../combat/engine/roll/CountdownResult"
import { CountdownRoll } from "../../../../../combat/engine/roll/CountdownRoll"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { AppliedEffectInput } from "../../../../../combat/ui/AppliedEffectInput"
import { DiceRollInputComponent } from "../../../../../combat/ui/DiceRollInputComponent"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getDamageAverage } from "../../../../../model/actor/type/NpcAction"
import { updateDocumentAtPath } from "../../../../../utils/documentUtils"
import { sys_id } from "../../../../../utils/foundryUtils"
import { appLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { subMenuLayout, tableBorder, tableBorderRounded } from "../../../../common/border-styles"
import { damageRoll } from "../../../../common/text-styles"
import { DestructiveButton, PrimaryButton, UtilityButton } from "../../../../component/Button"
import { Checkbox } from "../../../../component/Checkbox"
import { useContextMenu } from "../../../../component/ContextMenu"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { DiceRollButton } from "../../../../component/DiceRollButton"
import { DropDown } from "../../../../component/Dropdown"
import { EditableTextField, NumericCounterInput } from "../../../../component/EditableTextField"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { RichTextField } from "../../../../component/RichTextField"
import { Tooltip } from "../../../../component/Tooltip"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { buildPolymorphAttack, onClickAction, onClickActionAsWeaponAttack, onClickActionCombo } from "./hooksAndUtils"

const locale = appLang.NpcSheet

export const ActionMenuHeader = ({ label, onClick }: { label: string, onClick?: () => void }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex items-center gap-x-2">
            <p className="font-eskapade font-bold text-text-header-tertiary text-base">{label}</p>
            {isEditMode && onClick &&
                <AddNewIconButton onClick={onClick} />
            }
        </div>
    )
}

export const AddNewIconButton = ({ onClick }) => {
    return (
        <UtilityButton onClick={onClick}>
            {`+${appLang.ButtonActions.add}`}
        </UtilityButton>
    )
}

export const Actions = ({ npc, hero, setIsAddMenuOpen, isPolymorph }: {
    npc: AdversaryDataModel | NpcDataModel,
    hero?: Actor & { system: HeroDataModel },
    setIsAddMenuOpen?: any,
    isPolymorph?: boolean
}) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const canReorder = isEditMode && !isPolymorph
    const [editingIndices, setEditingIndices] = useState<number[]>([])
    const rechargeFlag = "rechargeCountdowns"
    const readRecharge = (): Record<string, CountdownResult> => {
        const stored = (npc.parent?.getFlag(sys_id, rechargeFlag as any) ?? []) as { action: string, result: CountdownResult }[]
        return Object.fromEntries(stored.map(it => [it.action, it.result]))
    }
    const [rechargeCountdowns, setRechargeCountdownsState] = useState<Record<string, CountdownResult>>(readRecharge)

    const setRechargeCountdowns = (update: (prev: Record<string, CountdownResult>) => Record<string, CountdownResult>) => {
        const next = update(rechargeCountdowns)
        setRechargeCountdownsState(next)
        const entries = Object.entries(next).map(([action, result]) => ({ action, result }))
        if (entries.length) npc.parent?.setFlag(sys_id, rechargeFlag as any, entries)
        else npc.parent?.unsetFlag(sys_id, rechargeFlag as any)
    }

    const startRecharge = async (idx: number, action: any, duration: number) => {
        const id = await getOrCreateActionId(idx, action)
        setRechargeCountdowns(prev => ({
            ...prev,
            [id]: { name: `${npc.parent.name}: ${action.name}`, duration }
        }))
    }

    const rollRecharge = async (actionId: string) => {
        const current = rechargeCountdowns[actionId]
        if (!current) return
        const roll = new CountdownRoll(current)
        const result = await roll.roll(true)
        setRechargeCountdowns(prev => {
            const rest = { ...prev }
            delete rest[actionId]
            return result.duration === 0 ? rest : { ...rest, [actionId]: result }
        })
    }

    const getOrCreateActionId = async (idx: number, action: any): Promise<string> => {
        if (action.id) return action.id
        const id = foundry.utils.randomID()
        const actions = [...npc.actions]
        actions[idx] = { ...actions[idx], id }
        await updateDocumentAtPath(npc.parent, ['actions'], actions)
        return id
    }

    useEffect(() => {
        if (!isEditMode) setEditingIndices([])
    }, [isEditMode])

    const openEditor = (idx: number) => setEditingIndices(prev => prev.includes(idx) ? prev : [...prev, idx])
    const closeEditor = (idx: number) => setEditingIndices(prev => prev.filter(it => it !== idx))

    const reorderAction = (from: number, to: number) => {
        if (from === to || from < 0 || to < 0 || from >= npc.actions.length || to >= npc.actions.length) return
        const actions = [...npc.actions]
        const [moved] = actions.splice(from, 1)
        actions.splice(to, 0, moved)
        const remap = (i: number) => i === from ? to : from < to && i > from && i <= to ? i - 1 : from > to && i >= to && i < from ? i + 1 : i
        setEditingIndices(prev => prev.map(remap))
        updateDocumentAtPath(npc.parent, ['actions'], actions)
    }

    const removeAction = (idx: number, action: any) => {
        if (action.id && rechargeCountdowns[action.id]) {
            setRechargeCountdowns(prev => {
                const rest = { ...prev }
                delete rest[action.id]
                return rest
            })
        }
        setEditingIndices(prev => prev.filter(it => it !== idx).map(it => it > idx ? it - 1 : it))
        deleteAction(npc, action)
    }

    return (
        <div className="mx-2 mt-2">
            {/* HEADER W/ ADD BUTTON */}
            {!isPolymorph && (isEditMode || npc.actions.length > 0) &&
                <ActionMenuHeader label={locale.actions} onClick={() => setIsAddMenuOpen?.(true)} />
            }

            {/* DISPLAY COMBO FIRST */}
            <div
                className={`${isPolymorph ? '' : 'hover-glow'}`}
                onClick={() => !isPolymorph ? onClickActionCombo(npc) : {}}
                onContextMenu={(e) => onCtxMenu(e, [{ icon: Trash, label: appLang.ButtonActions.delete, action: () => deleteCombo(npc), isDestructive: true }])}
            >
                {npc.combo.name !== '' &&
                    <div className={`flex w-full gap-x-2 p-2 mb-1 ${tableBorderRounded}`}>
                        <p className="font-paradigm font-bold">{locale.combo}:</p>
                        <div>
                            <p className="text-text-secondary">{npc.combo.name}</p>
                            <p className="text-xs text-text-secondary italic">{npc.combo.description}</p>
                        </div>
                    </div>
                }
            </div>

            {/* DISPLAY ALL ACTIONS */}
            <div className="flex flex-col gap-1">
                {
                    npc.actions.map((action, idx) => {
                        const avgDamage = getDamageAverage(action.damage.dice as DiceRollSchema)

                        const attack = async (e: React.MouseEvent, useAvgDmg?: boolean) => {
                            const roll: DiceRollSchema = useAvgDmg
                                ? { count: 0, faces: avgDamage }
                                : action.damage.dice as DiceRollSchema

                            if (isPolymorph && hero) {
                                onClickActionAsWeaponAttack(hero, action, e)
                                return
                            }

                            // The ID must exist before the attack is built and started.
                            const actionId = await getOrCreateActionId(idx, action)
                            const rechargeFaces = Number(action.recharge?.trim().match(/^cd(\d+)$/i)?.[1])
                            if (rechargeFaces && !rechargeCountdowns[actionId]) {
                                setRechargeCountdowns(prev => ({
                                    ...prev,
                                    [actionId]: { name: `${npc.parent.name}: ${action.name}`, duration: rechargeFaces }
                                }))
                            }
                            onClickAction(npc, action.name, action.description, action.damage.type, roll, action.saves as SavingThrowType[], action.appliedEffects as AppliedFx[], action.halfDamageOnSave, action.type)
                        }

                        const polyAttack = isPolymorph && hero ? buildPolymorphAttack(hero, action) : undefined
                        const polyPreset: RollPreset | undefined = polyAttack ? {
                            id: "",
                            title: action.name,
                            description: '',
                            weaponId: '',
                            skill: polyAttack.skillCheck?.skill ?? '',
                            d20Count: polyAttack.skillCheck?.d20Count ?? 1,
                            skillCheckMod: polyAttack.skillCheck?.modifier ?? 0,
                            critThreshold: polyAttack.skillCheck?.critThreshold ?? 20,
                            critSum: polyAttack.skillCheck?.critSum,
                            explodeFavor: polyAttack.skillCheck?.explodeFavor,
                            favorHinder: polyAttack.skillCheck?.favorHinder ?? 'none',
                            damageRolls: polyAttack.damageRoll?.dice ?? [],
                            flatModifier: polyAttack.damageRoll?.flatDmgBonus ?? 0,
                            perDieBonus: polyAttack.damageRoll?.perDieDmgBonus ?? 0,
                            armorPiercing: polyAttack.damageRoll?.armorPiercing ?? 0
                        } as RollPreset : undefined
                        const damageElement = (
                            <p className={`${damageRoll} leading-none cursor-pointer hover-glow`} onClick={(e) => attack(e)}>
                                {polyAttack?.damageRoll?.toString() ?? new DiceRoll(action.damage.dice as any).toRollFormula()}
                            </p>
                        )

                        return (
                            <div key={idx} className="flex flex-col gap-1">
                            <div
                                className={`flex gap-2 p-2 justify-between ${tableBorderRounded} ${canReorder ? 'cursor-grab' : ''} ${dragIndex === idx ? 'opacity-40' : ''}`}
                                draggable={canReorder}
                                onDragStart={(e) => {
                                    if (!canReorder) return
                                    e.stopPropagation()
                                    e.dataTransfer.effectAllowed = 'move'
                                    setDragIndex(idx)
                                }}
                                onDragOver={(e) => {
                                    if (dragIndex === null) return
                                    e.preventDefault()
                                    e.stopPropagation()
                                    e.dataTransfer.dropEffect = 'move'
                                }}
                                onDrop={(e) => {
                                    if (dragIndex === null) return
                                    e.preventDefault()
                                    e.stopPropagation()
                                    reorderAction(dragIndex, idx)
                                    setDragIndex(null)
                                }}
                                onDragEnd={() => setDragIndex(null)}
                                onContextMenu={(e) => onCtxMenu(e, [
                                { icon: PenSquare, label: appLang.ButtonActions.edit, action: () => openEditor(idx) },
                                { icon: Trash, label: appLang.ButtonActions.delete, action: () => removeAction(idx, action), isDestructive: true }
                            ])}>
                                <div className="flex flex-col">

                                    {/* ACTION NAME */}
                                    <p className="font-bold hover-glow cursor-pointer" onClick={(e) => attack(e)}>
                                        {action.name}
                                    </p>

                                    {/* ACTION TRAITS... */}
                                    <div>
                                        {/* ATTACK DESCRIPTION */}
                                        {action.description && action.description.length > 0 &&
                                            <EnrichedContent content={action.description} styleClasses="text-text-secondary italic" actor={npc.parent} />
                                        }

                                        {/* ATTACK DAMAGE AND COUNTDOWN INFO */}
                                        {action.damage.dice.count > 0 &&
                                            <div className="flex items-center gap-2">
                                                <p className="text-text-secondary leading-none">{appLang.AdversarySheet.damageAbbreviation}</p>
                                                {polyPreset && hero
                                                    ? <Tooltip content={<RollBuilderView actor={hero} showHeader={true} preset={polyPreset} lockWeaponSelection={true} saveOnRoll={false} baseAttack={polyAttack} />} interactive={true}>
                                                        {damageElement}
                                                    </Tooltip>
                                                    : damageElement
                                                }
                                                {!isPolymorph && <>
                                                    <p className="leading-none text-text-secondary">|</p>
                                                    <p className={`${damageRoll} leading-none cursor-pointer hover-glow`} onClick={(e) => attack(e, true)}>
                                                        {avgDamage}
                                                    </p>
                                                </>}
                                            </div>
                                        }

                                        {/* RECHARGE ROLL */}
                                            {action.recharge != null && action.recharge != '' && !rechargeCountdowns[action.id] &&
                                            <div className="flex gap-x-2 text-text-secondary">
                                                {appLang.AdversarySheet.recharge}
                                                <EnrichedContent
                                                    actor={npc.parent}
                                                    content={`[[/r ${action.recharge}#Recharge: ${action.name}]]{${action.recharge}}`}
                                                        onCountdown={(faces) => startRecharge(idx, action, faces)}
                                                />
                                            </div>
                                        }
                                    </div>
                                </div>
                                    <div className="flex items-start gap-2">
                                        {rechargeCountdowns[action.id] &&
                                            <DiceRollButton
                                                title={appLang.Overlay.countdownRollTooltip}
                                            faces={rechargeCountdowns[action.id].rollSummary?.faces ?? rechargeCountdowns[action.id].duration}
                                            result={rechargeCountdowns[action.id].rollSummary?.result ?? ''}
                                                textSize="text-3xl"
                                            onClick={() => rollRecharge(action.id)}
                                            />
                                        }
                                        <DamageTypeIcon dmgType={action.damage.type} size={24} />

                                    </div>
                            </div>
                            {isEditMode && editingIndices.includes(idx) &&
                                <NewActionWindow
                                    npc={npc}
                                    editTarget={action}
                                    editIndex={idx}
                                    setIsAddMenuOpen={(open: boolean) => { if (!open) closeEditor(idx) }}
                                />
                            }
                            </div>
                        )
                    })
                }
            </div>
            {isEditMode && <ContextMenu />}
        </div>
    )
}

const deleteCombo = (npc: AdversaryDataModel | NpcDataModel) => {
    updateDocumentAtPath(npc.parent, ['combo'], null)
}

const deleteAction = (npc: AdversaryDataModel | NpcDataModel, action: any) => {
    updateDocumentAtPath(npc.parent, ['actions'], npc.actions.filter(it => it != action))
}

export interface NpcAction {
    name: string,
    description: string,
    type: string,
    damage: { dice: DiceRollSchema, type: string },
    range: string,
    saves: string[],
    halfDamageOnSave: boolean,
    appliedEffects: { effect: string, duration: string | null }[]
    statuses: string[],
    recharge: string,
    comboCount: number
}

export const NewActionWindow = ({ npc, setIsAddMenuOpen, editTarget = null, editIndex }: {
    npc: any, setIsAddMenuOpen: (open: boolean) => void, editTarget?: any, editIndex?: number
}) => {
    const editTargetIndex = editIndex ?? npc.actions.indexOf(editTarget as any)
    const [newAction, setNewAction] = useState<Partial<NpcAction>>(editTarget ?? {
        name: "",
        description: "",
        type: "",
        damage: { dice: { count: 1, faces: 4 }, type: "physical" },
        range: "close",
        saves: ['reflex'],
        halfDamageOnSave: false,
        appliedEffects: [],
        statuses: [],
        recharge: "",
        comboCount: 0
    })

    const updateAction = useCallback(async (patch: Partial<NpcAction>) => {
        setNewAction(prev => ({ ...prev, ...patch }))
        return true
    }, [])

    const updateDamage = useCallback(async (patch: Partial<NpcAction["damage"]>) => {
        setNewAction(prev => ({
            ...prev,
            damage: {
                ...prev.damage,
                ...patch
            } as NpcAction["damage"]
        }))
        return true
    }, [])

    const toggleSave = useCallback((save: SavingThrowType) => {
        setNewAction(prev => {
            const saves = prev.saves ?? []
            return {
                ...prev,
                saves: saves.includes(save)
                    ? saves.filter(it => it !== save)
                    : [...saves, save]
            }
        })
    }, [])

    const [comboName, setComboName] = useState<string | null>(null)
    const [comboDescr, setComboDescr] = useState<string | null>(null)
    const [isCombo, setIsCombo] = useState(false)
    const [comboSelections, setComboSelections] = useState<{ action: NpcAction, comboCount: number }[]>([])

    const toggleComboSelection = (action: NpcAction) => {
        setComboSelections(prev =>
            prev.some(it => it.action.name === action.name)
                ? prev.filter(it => it.action.name !== action.name)
                : [...prev, { action, comboCount: 0 }]
        )
    }

    const updateComboCount = (action: NpcAction, comboCount: number) => {
        setComboSelections(prev => prev.map(it => it.action.name === action.name ? { ...it, comboCount } : it))
    }

    useEffect(() => {
        if (isCombo) {
            const name = comboSelections.map(it => {
                if (it.comboCount > 0) {
                    return it.comboCount + "x " + it.action.name
                }
            })
            setComboName(name.join(", "))
        }
    }, [isCombo, comboSelections])

    /**
     * VIEW
     */
    return (
        <div className={subMenuLayout}>
            <div>
                <p className="text-xl font-eskapade font-bold mb-1">{editTarget ? "Edit Action" : "New Action"}</p>
                {editTarget == null && npc.actions.length > 0 &&
                    <div className="flex space-x-2">
                        <input type="checkbox" checked={isCombo} onChange={() => setIsCombo(!isCombo)} />
                        <p>{appLang.AdversarySheet.actionCombo}</p>
                    </div>
                }
            </div>

            {isCombo
                ? <div className="space-y-1">
                    <div className="flex space-x-2">
                        <p>{appLang.AdversarySheet.comboName}</p>
                        <EditableTextField boundValue={comboName} onSave={async (name) => { setComboName(name); return true }} placeholder={appLang.AdversarySheet.comboNamePlaceholder} />
                    </div>
                    <div className="flex space-x-2">
                        <p>{appLang.AdversarySheet.notes}</p>
                        <EditableTextField boundValue={comboDescr} onSave={async (descr) => { setComboDescr(descr); return true }} placeholder={appLang.AdversarySheet.descriptionPlaceholder} />
                    </div>
                    {
                        npc.actions.map((act) => {
                            const selection = comboSelections.find(it => it.action.name === act.name)
                            return (
                                <div key={act.name} className="flex content-center space-x-1">
                                    <input
                                        type="checkbox"
                                        checked={selection != null}
                                        onChange={() => toggleComboSelection(act as NpcAction)}
                                    />
                                    <div>{act.name}: x</div>
                                    <NumericCounterInput
                                        value={selection?.comboCount ?? 0}
                                        onChange={(count) => updateComboCount(act as NpcAction, count)}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
                : <div className="space-y-2">
                    {/* ACTION NAME */}
                    <div className="flex items-end">
                        <p>{appLang.AdversarySheet.name}&nbsp;</p>
                        <div className={`font-eskapade font-bold hover-glow`}>
                            <EditableTextField
                                boundValue={newAction?.name ?? null}
                                onSave={(name) => updateAction({ name: name ?? '' })}
                                placeholder={appLang.AdversarySheet.actionNamePlaceholder}
                            />
                        </div>
                    </div>

                    {/* EFFECT DESCRIPTION */}
                    <div className="flex flex-col items-start">
                        <p>{appLang.AdversarySheet.effect}&nbsp;</p>
                        <div className={`w-full font-eskapade font-bold hover-glow`}>
                            <RichTextField
                                defaultValue={newAction?.description ?? ''}
                                onChange={(description) => updateAction({ description })}
                                className="text-xs font-paradigm font-normal"
                            />
                        </div>
                    </div>

                    {/* ATTACK TYPE SELECTOR */}
                    <div className="flex items-end gap-x-1">
                        <p>{appLang.ItemSheet.type}:</p>
                        <div className={`font-eskapade font-bold hover-glow`}>
                            <DropDown
                                value={newAction?.type ?? ''}
                                options={createDropdownEntries(locale.actionTypes)}
                                updateMechanism={{
                                    onChange: (attackType) => updateAction({ type: attackType ?? '' })
                                }}
                                parent={undefined}
                            />
                        </div>
                        <DropDown
                            value={newAction?.range ?? ''}
                            options={createDropdownEntries(appLang.Ranges)}
                            updateMechanism={{
                                onChange: (range) => updateAction({ range: range ?? '' })
                            }}
                            parent={undefined}
                        />
                    </div>

                    {/* DAMAGE ROLL */}
                    <div className="flex items-end">
                        <DiceRollInputComponent
                            diceRoll={newAction?.damage?.dice ?? { count: 1, faces: 4 }}
                            onChange={(dice) => updateDamage({ dice: { ...newAction?.damage?.dice, ...dice } as DiceRollSchema })}
                            extendedSettings={true}
                            hideCritFields={true}
                        />
                    </div>

                    {/* DAMAGE TYPE */}
                    <div className="flex items-end gap-x-1">
                        <p>{appLang.AdversarySheet.damageType}:</p>
                        <div className={`font-eskapade font-bold hover-glow`}>
                            <DropDown
                                value={newAction?.damage?.type ?? ''}
                                options={createDropdownEntries(appLang.DamageTypes, true)}
                                updateMechanism={{
                                    onChange: (type) => updateDamage({ type: type ?? '' })
                                }}
                                parent={undefined}
                            />
                        </div>
                    </div>

                    {/* SAVING THROWS */}
                    <div className="flex items-end gap-x-2">
                        <p>{appLang.AdversarySheet.saves}:</p>
                        <div className={`flex gap-x-2 ${tableBorder} px-2`}>
                            {Object.entries(appLang.Saves).map(([key, save]) =>
                                key !== "defend"
                                    ? <div key={key} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={(newAction?.saves ?? []).includes(key)}
                                            onChange={() => toggleSave(key as SavingThrowType)}
                                        />
                                        <p>{(save as { name: string }).name}</p>
                                    </div>
                                    : null
                            )}
                        </div>  
                    </div>

                    {/* HALF DAMAGE ON SAVE SUCCESS */}
                    <Checkbox
                        label={appLang.AdversarySheet.halfDamageOnSave}
                        color="text-text-primary"
                        checked={newAction?.halfDamageOnSave ?? false}
                        onCheckedChanged={(isChecked) => updateAction({ halfDamageOnSave: isChecked })}
                    />

                    {/* STATUS EFFECTS */}
                    <div className="flex items-end gap-x-1">
                        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                            <AppliedEffectInput
                                effects={newAction?.appliedEffects as any}
                                onChange={(appliedEffects) => updateAction({ appliedEffects: appliedEffects as NpcAction["appliedEffects"] })}
                                hideCritDuration={true}
                            />
                        </EditModeContextProvider>
                    </div>

                    {/* RECHARGE */}
                    <div className="flex items-end gap-x-1">
                        <p>{appLang.AdversarySheet.recharge}:</p>
                        <div className={`font-eskapade font-bold hover-glow`}>
                            <EditableTextField
                                boundValue={newAction?.recharge ?? null}
                                onSave={(recharge) => updateAction({ recharge: recharge ?? '' })}
                                placeholder={appLang.AdversarySheet.rechargePlaceholder}
                            />
                        </div>
                    </div>

                </div>
            }

            {/* SAVE & CANCEL BUTTONS*/}
            <AddMenuButtons
                onSave={() => saveNewAction(npc, isCombo, comboSelections, comboName, comboDescr, newAction, editTarget, editTargetIndex)}
                setIsAddMenuOpen={setIsAddMenuOpen}
            />
        </div>
    )
}

export const AddMenuButtons = ({ setIsAddMenuOpen, onSave }) => {
    return (
        <div className="flex w-full justify-between mt-8" >
            <DestructiveButton onClick={() => {
                setIsAddMenuOpen(false)
            }}>
                Cancel
            </DestructiveButton>
            <PrimaryButton icon={<Save size={14} />} onClick={() => {
                if (onSave()) {
                    setIsAddMenuOpen(false)
                }
            }}>
                Save
            </PrimaryButton>
        </div>
    )
}

const saveNewAction = (npc, isCombo, comboSelections, comboName, comboDescription, newAction, editTarget, editTargetIndex): boolean => {
    if (isCombo) {
        if (comboName && comboSelections.length > 0 && comboSelections.every(it => it.comboCount > 0)) {
            const comboActions = comboSelections.map(cs => ({
                ...npc.actions.find(it => it.name === cs.action.name), comboCount: cs.comboCount
            }))
            updateDocumentAtPath(npc.parent, ['combo'], { name: comboName, description: comboDescription, actions: comboActions })
            return true
        }
        else {
            ui.notifications?.error(appLang.Notifications.actionComboRequiredFields)
            return false
        }
    }
    else if (!newAction?.name) {
        ui.notifications?.error(appLang.Notifications.actionNameRequired)
        return false
    }
    else if (editTarget == null) {
        updateDocumentAtPath(npc.parent, ['actions'], [...npc.actions, { ...newAction, id: newAction.id || foundry.utils.randomID() }])
        return true
    }
    else {
        const actions = npc.actions
        actions[editTargetIndex] = newAction
        updateDocumentAtPath(npc.parent, ['actions'], [...actions])
        return true
    }
}