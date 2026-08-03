import { vgLiteLang as locale, vgLiteLang } from "../../../../../utils/lang"
import { Trash, PenSquare, Plus, Save } from "lucide-react"
import { useState, useCallback } from "react"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { updateDocumentAtPath } from "../../../../../utils/documentUtils"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { DamageRollChatCard } from "../../../../chat/DamageRollChatCard"
import { tableBorderRounded, subMenuLayout } from "../../../../common/border-styles"
import { damageRoll, glowOnHover } from "../../../../common/text-styles"
import { useContextMenu } from "../../../../component/ContextMenu"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { DestructiveButton, PrimaryButton } from "../../../../component/Button"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { onClickAction } from "./hooksAndUtils"
import { DropDown } from "../../../../component/Dropdown"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardSerializer"
import { ComboChatCard } from "../../../../chat/ComboChatCard"
import { DamageRoll, DamageRollResult } from "../../../../../combat/engine/DamageRoll"

export const ActionMenuHeader = ({ label, onClick }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex items-center gap-x-2">
            <p className="font-eskapade font-bold text-text-header-tertiary text-xl">{label}</p>
            {isEditMode && <AddNewIconButton onClick={onClick} />}
        </div>
    )
}

export const AddNewIconButton = ({ onClick }) => {
    return (
        <Plus size={18} strokeWidth={4} className={`text-text-header-tertiary ${glowOnHover}`} onClick={onClick} />
    )
}

export const Actions = ({ adv, setIsAddMenuOpen, setEditTarget }) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div className="mx-2 mt-2">
            {/* HEADER W/ ADD BUTTON */}
            <ActionMenuHeader label={locale.AdversarySheet.actions} onClick={() => setIsAddMenuOpen(true)} />
            {/* DISPLAY COMBO FIRST */}
            <div
                className={`${glowOnHover}`}
                onClick={() => onClickActionCombo(adv)}
                onContextMenu={(e) => onCtxMenu(e, [{ icon: Trash, label: 'Delete', action: () => deleteCombo(adv), isDestructive: true }])}
            >
                {adv.combo.name !== '' &&
                    <div className={`flex w-full gap-x-2 p-2 mb-1 ${tableBorderRounded}`}>
                        <p className="font-paradigm font-bold">{locale.AdversarySheet.combo}:</p>
                        <p className="text-text-secondary">{adv.combo.name}</p>
                    </div>
                }
            </div>
            {/* DISPLAY ALL ACTIONS */}
            <div className="grid grid-cols-2 gap-1">
                {
                    adv.actions.map((act, i) => {
                        const spanCls = (i === adv.actions.length - 1) && (adv.actions.length % 2) ? 'col-span-2' : ''
                        return (
                            <div
                                key={act.name}
                                className={`p-2 ${spanCls} ${tableBorderRounded}`}
                                onContextMenu={(e) => onCtxMenu(e, [
                                    { icon: PenSquare, label: 'Edit', action: () => { setEditTarget(act); setIsAddMenuOpen(true); } },
                                    { icon: Trash, label: 'Delete', action: () => deleteAction(adv, act), isDestructive: true }
                                ])}>
                                {/* ACTION NAME */}
                                <div className={`flex justify-between gap-x-2 ${glowOnHover}`} onClick={() => onClickAction(adv, act.name, act.effect, act.damage.type, act.damage.roll, act.damage.avg)}>
                                    <p className="font-bold">{act.name}</p>
                                    <div className='w-[16px]'>
                                        <DamageTypeIcon dmgType={act.damage.type ?? ''} size={16} />
                                    </div>
                                </div>
                                {/* ACTION TRAITS... */}
                                <div className="ml-2">
                                    <EnrichedContent content={act.effect} styleClasses="text-text-secondary" />
                                    {
                                        act.damage.roll &&
                                            <div className={`flex gap-2 ${glowOnHover}`} onClick={() => onClickAction(adv, act.name, act.effect, act.damage.type, act.damage.roll, act.damage.avg)}>
                                                <p className="text-text-secondary">Dmg:</p>
                                                <p className={damageRoll}>{act.damage.roll}</p>
                                                <p>|</p>
                                                <p className={damageRoll} onClick={async () => {
                                                    const result = await new DamageRoll({ atkName: act.name, dmgType: act.damage.type, dice: [{ count: 0, faces: act.damage.avg }] }).roll()
                                                    sendVgLiteChatMessage(adv,
                                                        <DamageRollChatCard
                                                            actorId={getId(adv)}
                                                            tokenIds={getTargetIds()}
                                                            result={result} />, result.rolls)
                                                }}>
                                                    {act.damage.avg}
                                                </p>
                                            </div>
                                    }
                                    {act.recharge != null && act.recharge != '' &&
                                        <div className="flex gap-x-2 text-text-secondary">
                                            {'Recharge'}<EnrichedContent content={act.recharge} />
                                        </div>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            {isEditMode && <ContextMenu />}
        </div>
    )
}

const onClickActionCombo = async (adv: AdversaryDataModel) => {
    const rolls: DamageRollResult[] = []
    for (let action = 0; action < adv.combo.actions.length; action++) {
        const act = adv.combo.actions[action]
        for (let count = 0; count < (act.comboCount ?? 0); count++) {
            ui.notifications?.error("Terra, come fix this!")
            const result = await new DamageRoll({ atkName: act.name, dmgType: act.damage.type, dice: [] }).roll()
            rolls.push(result)
        }
    }
    sendVgLiteChatMessage(
        adv,
        <ComboChatCard
            actorId={getId(adv)}
            rolls={rolls}
            tokenIds={getTargetIds()}
        />, rolls.flatMap(r => r.rolls)
    )
}

const deleteCombo = (adv: AdversaryDataModel) => {
    updateDocumentAtPath(adv.parent, ['combo'], null)
}

const deleteAction = (adv: AdversaryDataModel, action: any) => {
    updateDocumentAtPath(adv.parent, ['actions'], adv.actions.filter(it => it != action))
}

export interface AdversaryAction {
    name: string, effect: string, damage: { roll: string, avg: number, type: string }, recharge: string, comboCount: number
}

export const NewActionWindow = ({ adv, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = adv.actions.indexOf(editTarget as any)
    const [newAction, setNewActionInternal] = editTarget == null ? useState<AdversaryAction>() : useState<AdversaryAction>(editTarget as AdversaryAction)

    const setNewAction = useCallback(async (action: any) => {
        setNewActionInternal(action)
        return true
    }, [])

    const updateName = useCallback(async (name: string | null) => {
        return setNewAction({ ...newAction, name: name })
    }, [setNewAction, newAction])

    const updateEffect = useCallback(async (eff: string | null) => {
        return setNewAction({ ...newAction, effect: eff })
    }, [setNewAction, newAction])

    const updateDamageRoll = useCallback(async (roll: string | null) => {
        return setNewAction({ ...newAction, damage: { ...newAction?.damage, roll: roll } })
    }, [setNewAction, newAction])

    const updateDamageAvg = useCallback(async (avg: string | null) => {
        return setNewAction({ ...newAction, damage: { ...newAction?.damage, avg: avg } })
    }, [setNewAction, newAction])

    const updateDamageType = useCallback(async (type: string | null) => {
        return setNewAction({ ...newAction, damage: { ...newAction?.damage, type: type } })
    }, [setNewAction, newAction])

    const updateRecharge = useCallback(async (rchg: string | null) => {
        return setNewAction({ ...newAction, recharge: rchg })
    }, [setNewAction, newAction])

    const [comboName, setComboName] = useState<string | null>(null)
    const [isCombo, setIsCombo] = useState(false)
    const [comboSelections, setComboSelections] = useState<{ action: AdversaryAction, comboCount: string | null }[]>([])

    const updateComboName = useCallback(async (name: string | null) => {
        setComboName(name)
        return true
    }, [])

    const updateComboSelections = (action: AdversaryAction) => {
        if (comboSelections.length === 0 || comboSelections.findIndex(it => it.action.name === action.name) === -1) {
            setComboSelections([...comboSelections, { action: action as AdversaryAction, comboCount: null }])
        }
        else {
            setComboSelections(comboSelections.filter(it => it.action.name !== action.name))
        }
    }

    const udpateComboCount = async (action: AdversaryAction, count: string | null) => {
        const comboAction = comboSelections.find(it => it.action.name === action.name)
        if (comboAction) {
            comboAction.comboCount = count
        }
        setComboSelections(comboSelections)
        return true
    }

    /**
     * VIEW
     */
    return (
        <div className={subMenuLayout}>
            <div>
                <p className="text-xl font-eskapade font-bold mb-1">{editTarget ? "Edit Action" : "New Action"}</p>
                {
                    editTarget == null && adv.actions.length > 0 ?
                        <div className="flex space-x-2">
                            <input
                                type="checkbox"
                                checked={isCombo}
                                onChange={() => setIsCombo(!isCombo)}
                            />
                            <p>Action Combo</p>
                        </div> : undefined
                }
            </div>

            {
                isCombo ? <div className="space-y-1">
                    <div className="flex space-x-2">
                        <p>Combo Name:</p>
                        <EditableTextField boundValue={comboName} onSave={updateComboName} placeholder='Enter name...' />
                    </div>
                    {
                        adv.actions.map((act) => (
                            <div key={act.name} className="flex content-center space-x-1">
                                <input
                                    type="checkbox"
                                    checked={comboSelections.findIndex(it => it.action.name === act.name) > -1}
                                    onChange={() => updateComboSelections(act as AdversaryAction)}
                                />
                                <div>{act.name}: x</div>
                                <EditableTextField
                                    boundValue={comboSelections.find(it => it.action.name === act.name)?.comboCount ?? null}
                                    onSave={(count) => udpateComboCount(act as AdversaryAction, count)}
                                    placeholder="#"
                                />
                            </div>
                        ))
                    }
                </div> :
                    <div className="space-y-2">
                        {/* ACTION NAME */}
                        <div className="flex">
                            <p>Name:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <EditableTextField boundValue={newAction?.name ?? null} onSave={updateName} placeholder='Claws [Melee, Near]' />
                            </div>
                        </div>

                        {/* EFFECT DESCRIPTION */}
                        <div className="flex">
                            <p>Effect:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <EditableTextField boundValue={newAction?.effect ?? null} onSave={updateEffect} placeholder='Effect description...' />
                            </div>
                        </div>

                        {/* DAMAGE ROLL */}
                        <div className="flex">
                            <p>Damage:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <EditableTextField boundValue={newAction?.damage?.roll ?? null} onSave={updateDamageRoll} placeholder='XdY+Z' />
                            </div>
                        </div>

                        {/* DAMAGE AVG */}
                        <div className="flex">
                            <p>Damage Avg:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <EditableTextField boundValue={newAction?.damage?.avg?.toString() ?? null} onSave={updateDamageAvg} placeholder='0' />
                            </div>
                        </div>

                        {/* DAMAGE TYPE */}
                        <div className="flex">
                            <p>Damage Type:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <DropDown
                                    value={newAction?.damage?.type ?? ''}
                                    options={createDropdownEntries(vgLiteLang.DamageTypes)}
                                    updateMechanism={{
                                        onChange: updateDamageType
                                    }}
                                    parent={undefined}
                                />
                            </div>
                        </div>

                        {/* RECHARGE */}
                        <div className="flex">
                            <p>Recharge:&nbsp;</p>
                            <div className={`font-eskapade font-bold ${glowOnHover}`}>
                                <EditableTextField boundValue={newAction?.recharge ?? null} onSave={updateRecharge} placeholder="CdX" />
                            </div>
                        </div>
                    </div>
            }

            {/* SAVE & CANCEL BUTTONS*/}
            <AddMenuButtons
                onSave={() => saveNewAction(adv, isCombo, comboSelections, comboName, newAction, editTarget, editTargetIndex)}
                setEditTarget={setEditTarget}
                setIsAddMenuOpen={setIsAddMenuOpen}
            />
        </div>
    )
}

export const AddMenuButtons = ({ setEditTarget, setIsAddMenuOpen, onSave }) => {
    return (
        < div className="flex w-full justify-between mt-8" >
            <DestructiveButton onClick={() => {
                setEditTarget(null)
                setIsAddMenuOpen(false)
            }}>
                Cancel
            </DestructiveButton>
            <PrimaryButton icon={<Save size={14} />} onClick={() => {
                onSave()
                setEditTarget(null)
                setIsAddMenuOpen(false)
            }}>
                Save
            </PrimaryButton>
        </div >
    )
}

const saveNewAction = (adv, isCombo, comboSelections, comboName, newAction, editTarget, editTargetIndex) => {
    if (isCombo) {
        if (comboSelections.length > 0 && comboSelections.every(it => it.comboCount)) {
            const comboActions: any[] = []
            comboSelections.forEach(cs => {
                comboActions.push({ ...adv.actions.find(it => it.name === cs.action.name), comboCount: cs.comboCount })
            })
            updateDocumentAtPath(adv.parent, ['combo'], { name: comboName, actions: comboActions })
        }
        else {
            ui.notifications?.error("Error: [Name] and [Count] are required fields and at least 1 action must be selected.")
            return
        }
    }
    else if (!newAction?.name) {
        ui.notifications?.error("Error: [Name] is a required field.")
        return
    }
    else if (editTarget == null) {
        updateDocumentAtPath(adv.parent, ['actions'], [...adv.actions, newAction])
    }
    else {
        const actions = adv.actions
        actions[editTargetIndex] = newAction
        updateDocumentAtPath(adv.parent, ['actions'], [...actions])
    }
}