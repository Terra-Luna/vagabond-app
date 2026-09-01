import { PenSquare, Save,Trash } from "lucide-react"
import { useCallback,useState } from "react"

import { DiceRollSchema } from "../../../../../apps/attack-builder/model/DieRollSchema"
import { DamageRoll, DamageRollResult } from "../../../../../combat/engine/roll/DamageRoll"
import { DiceRoll } from "../../../../../combat/engine/roll/DiceRoll"
import { DiceRollInputComponent } from "../../../../../combat/ui/DiceRollInputComponent"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getDamageAverage } from "../../../../../model/actor/type/NpcAction"
import { updateDocumentAtPath } from "../../../../../utils/documentUtils"
import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { getId, getTargetIds } from "../../../../../utils/modelUtil"
import { sendVagabondChatMessage } from "../../../../chat/ChatCardSerializer"
import { ComboChatCard } from "../../../../chat/ComboChatCard"
import { DamageRollChatCard } from "../../../../chat/DamageRollChatCard"
import { subMenuLayout,tableBorderRounded } from "../../../../common/border-styles"
import { damageRoll } from "../../../../common/text-styles"
import { DestructiveButton, PrimaryButton, UtilityButton } from "../../../../component/Button"
import { useContextMenu } from "../../../../component/ContextMenu"
import { DamageTypeIcon } from "../../../../component/DamageTypeIcon"
import { DropDown } from "../../../../component/Dropdown"
import { EditableTextField, NumericCounterInput } from "../../../../component/EditableTextField"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { RichTextField } from "../../../../component/RichTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { onClickAction } from "./hooksAndUtils"

const locale = vgLiteLang.NpcSheet

export const ActionMenuHeader = ({ label, onClick }: { label: string, onClick?: () => void }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex items-center gap-x-2">
            <p className="font-eskapade font-bold text-text-header-tertiary text-xl">{label}</p>
            {isEditMode && onClick &&
                <AddNewIconButton onClick={onClick} />
            }
        </div>
    )
}

export const AddNewIconButton = ({ onClick }) => {
    return (
        <UtilityButton onClick={onClick}>
            {`+${vgLiteLang.ButtonActions.add}`}
        </UtilityButton>
    )
}

export const Actions = ({ npc, setIsAddMenuOpen, setEditTarget }: { npc: AdversaryDataModel | NpcDataModel, setIsAddMenuOpen: any, setEditTarget: any }) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()

    return (
        <div className="mx-2 mt-2">
            {/* HEADER W/ ADD BUTTON */}
            <ActionMenuHeader label={locale.actions} onClick={() => setIsAddMenuOpen(true)} />

            {/* DISPLAY COMBO FIRST */}
            <div
                className={`hover-glow`}
                onClick={() => onClickActionCombo(npc)}
                onContextMenu={(e) => onCtxMenu(e, [{ icon: Trash, label: 'Delete', action: () => deleteCombo(npc), isDestructive: true }])}
            >
                {npc.combo.name !== '' &&
                    <div className={`flex w-full gap-x-2 p-2 mb-1 ${tableBorderRounded}`}>
                        <p className="font-paradigm font-bold">{locale.combo}:</p>
                        <p className="text-text-secondary">{npc.combo.name}</p>
                    </div>
                }
            </div>

            {/* DISPLAY ALL ACTIONS */}
            <div className="flex flex-col gap-1">
                {
                    npc.actions.map((act, i) => {
                        return (
                            <div key={i} className={`flex gap-2 p-2 justify-between ${tableBorderRounded}`} onContextMenu={(e) => onCtxMenu(e, [
                                { icon: PenSquare, label: 'Edit', action: () => { setEditTarget(act); setIsAddMenuOpen(true); } },
                                { icon: Trash, label: 'Delete', action: () => deleteAction(npc, act), isDestructive: true }
                            ])}>
                                <div className="flex flex-col">

                                    {/* ACTION NAME */}
                                    <p className="font-bold">{act.name}</p>

                                    {/* ACTION TRAITS... */}
                                    <div>
                                        {/* ATTACK DESCRIPTION */}
                                        <EnrichedContent content={act.effect} styleClasses="text-text-secondary italic" actor={npc.parent} />
                                        {/* ATTACK DAMAGE AND COUNTDOWN INFO */}
                                        {act.damage.dice.count > 0 &&
                                            <div className="flex items-center gap-2 hover-glow" onClick={() => onClickAction(npc, act.name, act.effect, act.damage.type, act.damage.dice as DiceRollSchema)}>
                                                <p className="text-text-secondary leading-none">Dmg:</p>
                                                <p className={`${damageRoll} leading-none`}>{new DiceRoll(act.damage.dice as any).toRollFormula()}</p>
                                                <p className="leading-none text-text-secondary">|</p>
                                                <span className={`${damageRoll} leading-none cursor-pointer`} onClick={async (e) => {
                                                    e.stopPropagation()
                                                    const avgDamage = getDamageAverage(act.damage.dice as DiceRollSchema)
                                                    const result = await new DamageRoll({
                                                        atkName: act.name,
                                                        dice: [new DiceRoll({ count: avgDamage, faces: 1 })],
                                                        dmgType: act.damage.type
                                                    }).roll()
                                                    sendVagabondChatMessage(
                                                        npc,
                                                        <DamageRollChatCard
                                                            actorId={getId(npc)}
                                                            tokenIds={getTargetIds()}
                                                            result={result}
                                                        />, result.rolls
                                                    )
                                                }}>
                                                    {getDamageAverage(act.damage.dice as DiceRollSchema)}
                                                </span>
                                            </div>
                                        }
                                        {/* RECHARGE ROLL */}
                                        {act.recharge != null && act.recharge != '' &&
                                            <div className="flex gap-x-2 text-text-secondary">
                                                {'Recharge:'}<EnrichedContent content={`[[/r ${act.recharge}#Recharge: ${act.name}]]{${act.recharge}}`} actor={npc.parent} />
                                            </div>
                                        }
                                    </div>
                                </div>
                                <DamageTypeIcon dmgType={act.damage.type} size={24} />
                            </div>
                        )
                    })
                }
            </div>
            {isEditMode && <ContextMenu />}
        </div>
    )
}

const onClickActionCombo = async (npc: AdversaryDataModel | NpcDataModel) => {
    const rolls: DamageRollResult[] = []
    for (let action = 0; action < npc.combo.actions.length; action++) {
        const act = npc.combo.actions[action]
        for (let count = 0; count < (act.comboCount ?? 0); count++) {
            const result = await new DamageRoll({
                atkName: act.name,
                dmgType: act.damage.type,
                dice: [new DiceRoll(act.damage.dice as any)]
            }).roll()
            rolls.push(result)
        }
    }
    sendVagabondChatMessage(
        npc,
        <ComboChatCard
            actorId={getId(npc)}
            rolls={rolls}
            tokenIds={getTargetIds()}
        />, rolls.flatMap(r => r.rolls)
    )
}

const deleteCombo = (npc: AdversaryDataModel | NpcDataModel) => {
    updateDocumentAtPath(npc.parent, ['combo'], null)
}

const deleteAction = (npc: AdversaryDataModel | NpcDataModel, action: any) => {
    updateDocumentAtPath(npc.parent, ['actions'], npc.actions.filter(it => it != action))
}

export interface NpcAction {
    name: string, effect: string, damage: { dice: DiceRollSchema, type: string }, recharge: string, comboCount: number
}

export const NewActionWindow = ({ npc, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = npc.actions.indexOf(editTarget as any)
    const [newAction, setNewAction] = useState<Partial<NpcAction>>(editTarget ?? {})

    const updateAction = useCallback(async (patch: Partial<NpcAction>) => {
        setNewAction(prev => ({ ...prev, ...patch }))
        return true
    }, [])

    const updateDamage = useCallback(async (patch: Partial<NpcAction["damage"]>) => {
        setNewAction(prev => ({ ...prev, damage: { ...prev.damage, ...patch } as NpcAction["damage"] }))
        return true
    }, [])

    const [comboName, setComboName] = useState<string | null>(null)
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

    /**
     * VIEW
     */
    return (
        <div className={subMenuLayout}>
            <div>
                <p className="text-xl font-eskapade font-bold mb-1">{editTarget ? "Edit Action" : "New Action"}</p>
                {editTarget == null && npc.actions.length > 0 &&
                    <div className="flex space-x-2">
                        <input
                            type="checkbox"
                            checked={isCombo}
                            onChange={() => setIsCombo(!isCombo)}
                        />
                        <p>Action Combo</p>
                    </div>
                }
            </div>

            {
                isCombo ? <div className="space-y-1">
                    <div className="flex space-x-2">
                        <p>Combo Name:</p>
                        <EditableTextField boundValue={comboName} onSave={async (name) => { setComboName(name); return true }} placeholder='Enter name...' />
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
                </div> :
                    <div className="space-y-2">
                        {/* ACTION NAME */}
                        <div className="flex items-end">
                            <p>Name:&nbsp;</p>
                            <div className={`font-eskapade font-bold hover-glow`}>
                                <EditableTextField boundValue={newAction?.name ?? null} onSave={(name) => updateAction({ name: name ?? '' })} placeholder='Claws [Melee, Near]' />
                            </div>
                        </div>

                        {/* EFFECT DESCRIPTION */}
                        <div className="flex items-end">
                            <p>Effect:&nbsp;</p>
                            <div className={`font-eskapade font-bold hover-glow`}>
                                <RichTextField defaultValue={newAction?.effect ?? ''} onChange={(effect) => updateAction({ effect })} className="text-xs font-paradigm font-normal" />
                            </div>
                        </div>

                        {/* DAMAGE ROLL */}
                        <div className="flex items-end">
                            <DiceRollInputComponent
                                diceRoll={newAction?.damage?.dice ?? { count: 1, faces: 4 }}
                                onChange={(dice) => updateDamage({ dice: { ...newAction?.damage?.dice, ...dice } as DiceRollSchema })}
                            />
                        </div>

                        {/* DAMAGE TYPE */}
                        <div className="flex items-end">
                            <p>Damage Type:&nbsp;</p>
                            <div className={`font-eskapade font-bold hover-glow`}>
                                <DropDown
                                    value={newAction?.damage?.type ?? ''}
                                    options={createDropdownEntries(vgLiteLang.DamageTypes)}
                                    updateMechanism={{
                                        onChange: (type) => updateDamage({ type: type ?? '' })
                                    }}
                                    parent={undefined}
                                />
                            </div>
                        </div>

                        {/* RECHARGE */}
                        <div className="flex items-end">
                            <p>Recharge:&nbsp;</p>
                            <div className={`font-eskapade font-bold hover-glow`}>
                                <EditableTextField
                                    boundValue={newAction?.recharge ?? null}
                                    onSave={(recharge) => updateAction({ recharge: recharge ?? '' })}
                                    placeholder="CdX"
                                />
                            </div>
                        </div>
                    </div>
            }

            {/* SAVE & CANCEL BUTTONS*/}
            <AddMenuButtons
                onSave={() => saveNewAction(npc, isCombo, comboSelections, comboName, newAction, editTarget, editTargetIndex)}
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

const saveNewAction = (npc, isCombo, comboSelections, comboName, newAction, editTarget, editTargetIndex) => {
    if (isCombo) {
        if (comboName && comboSelections.length > 0 && comboSelections.every(it => it.comboCount > 0)) {
            const comboActions = comboSelections.map(cs => ({
                ...npc.actions.find(it => it.name === cs.action.name), comboCount: cs.comboCount
            }))
            updateDocumentAtPath(npc.parent, ['combo'], { name: comboName, actions: comboActions })
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
        updateDocumentAtPath(npc.parent, ['actions'], [...npc.actions, newAction])
    }
    else {
        const actions = npc.actions
        actions[editTargetIndex] = newAction
        updateDocumentAtPath(npc.parent, ['actions'], [...actions])
    }
}