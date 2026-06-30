import { useCallback, useState } from "react"
import lang from "../../../../../public/lang/en.json"
import AdversaryDataModel from "../../../../model/actor/AdversaryDataModel"
import { EditableNameField, EditableTextField } from "../../../component/EditableTextField"
import { Portrait } from "../hero/HeroSheet"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { getDocumentAtPath, updateDocument, updateDocumentAtPath } from "../../../../utils/documentUtils"
import { RichTextField } from "../../../component/RichTextField"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { DropDown } from "../../../component/Dropdown"
import { LockKeyhole, LockKeyholeOpen, PenSquare, Plus, Save, Shield, Trash } from "lucide-react"
import { glowOnHover } from "../../VgLiteSheet"
import { DamageTypeIconDisplay, OptionsSelectionMenu, StringOptionsDisplay } from "../../../component/OptionsSelectionMenu"
import { DestructiveButton, PrimaryButton } from "../../../component/Button"
import { useContextMenu } from "../../../component/ContextMenu"
import { DamageRollResult, rollDamage } from "../../../../combat/dice-rolls"
import { DamageTypeIcon } from "../../../component/DamageTypeIcon"
import { subMenuLayout, tableBorderRounded } from "../../../common/border-styles"
import { EnrichedContent } from "../../../component/EnrichedContent"
import { damageRoll } from "../../../common/text-styles"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardManager"
import { getId, getTargets } from "../../../../utils/modelUtil"
import ReactHtmlParser from 'react-html-parser'
import { DamageRollChatCard } from "../../../chat/DamageRollChatCard"
import { AbilityChatCard, ComboChatCard } from "../../../chat/AbilityChatCard"
import { stripHtml } from "../../../../utils/stringUtil"
import { Tooltip } from "../../../component/Tooltip"

const locale = lang.VGLITE.AdversarySheet
const statLabelStyle = `text-sm text-text-primary font-paradigm font-normal`
const statValueStyle = `text-lg text-stat-block-fill font-eskapade font-bold`

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 700
        },
        window: {
            resizable: true
        }
    }
}

const AdversarySheetReactComponent = ({ actor }: { actor: FoundryActor<AdversaryDataModel> }) => {
    const adv = actor.system
    const [isEditMode, setIsEditMode] = useState(false)
    const { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget } = useAddActionMenu()
    const { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget } = useAddAbilityMenu()
    return (
        <div className="@container flex grow overflow-y-hidden">
            <div className="flex flex-col border border-solid border-transparent border-r-table-border">
                <Portrait actor={adv} />
                <div className="flex flex-col grow p-2">
                    <HPArmorHUD adv={adv} isEditMode={isEditMode} />
                </div>
            </div>
            <div className="flex flex-col grow">
                <AdversarySheetHeader adv={adv} isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
                <div className="overflow-y-auto">
                    <Description adv={adv} isEditMode={isEditMode} />
                    <StatBlock adv={adv} isEditMode={isEditMode} />
                    <Actions adv={adv} setIsAddMenuOpen={setIsAddActionOpen} setEditTarget={setEditActionTarget} isEditMode={isEditMode} />
                    {isAddActionOpen ?
                        <NewActionWindow adv={adv} setIsAddMenuOpen={setIsAddActionOpen} editTarget={editActionTarget} setEditTarget={setEditActionTarget} /> : undefined
                    }
                    <Abilities adv={adv} setIsAddMenuOpen={setIsAddAbilityOpen} setEditTarget={setEditAbilityTarget} isEditMode={isEditMode} />
                    {isAddAbilityOpen ?
                        <NewAbilityWindow adv={adv} setIsAddMenuOpen={setIsAddAbilityOpen} editTarget={editAbilityTarget} setEditTarget={setEditAbilityTarget} /> : undefined
                    }
                </div>
            </div>
        </div>
    )
}

const HPArmorHUD = ({ adv, isEditMode }: { adv: AdversaryDataModel, isEditMode: boolean }) => {
    const headerStyle = "text-xs font-paradigm"
    const hp = adv.health.current

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(adv.parent, { health: { current: (hp??0) + (auxClick ? 1 : -1) }})
    }, [hp])

    return (
        <div className="text-center space-y-4 mt-0.5">
            {/* THREAT LEVEL */}
            <div className="flex space-x-2 text-text-primary justify-center content-center w-full ml-auto mr-auto">
                <p className={`${headerStyle} content-center`}>{locale.tl}</p>
                <div className={`text-lg text-stat-block-fill font-eskapade font-bold`}>
                    <EditableTextField
                        boundValue={adv.threatLevelOverride?.toString() ?? adv.threatLevel?.toString() ?? ''}
                        updateProps={{ actor: adv.parent, propertyPath: ['threatLevelOverride'] }}
                        placeholder={adv.threatLevel?.toString() ?? '1.00'}
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>

            {/* HIT DICE */}
            <div className="text-text-primary justify-center content-center w-full ml-auto mr-auto mt-4">
                <p className={headerStyle}>{locale.hd}</p>
                <div className={`text-3xl text-stat-block-fill font-eskapade font-bold`}>
                    <EditableTextField
                        boundValue={adv.hitDice?.toString() ?? '1'}
                        updateProps={{ actor: adv.parent, propertyPath: ['hitDice'] }}
                        placeholder="1"
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>
            
            {/* HP CURRENT / MAX */}
            <div className="text-text-primary w-full">
                <p className={`${headerStyle} ${glowOnHover}`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                    {locale.hp}
                </p>
                <div className="flex font-eskapade font-bold w-full justify-center">
                    <div className={`text-text-hp-current text-3xl min-w-[3ch] ${glowOnHover}`}>
                        <EditableTextField
                            boundValue={adv.health.current?.toString() ?? ''}
                            updateProps={{ actor: adv.parent, propertyPath: ['health', 'current'] }}
                            placeholder="0"
                        />
                    </div>
                    <p className="text-text-primary text-5xl font-normal">/</p>
                    <p className={`text-text-hp-max text-xl mt-3 ${glowOnHover}`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                        {adv.health.max}
                    </p>
                </div>
            </div>

            {/* ARMOR RATING & INFO */}
            <div className="text-text-primary w-full justify-center">
                <p className={headerStyle}>{locale.armor}</p>
                <div className="relative w-[52px] h-[52px] ml-auto mr-auto">
                    <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-4xl text-text-armor font-eskapade font-bold`}>
                            <EditableTextField
                                boundValue={adv.armor.rating?.toString() ?? ''}
                                updateProps={{ actor: adv.parent, propertyPath: ['armor', 'rating'] }}
                                placeholder="0"
                                isGlobalEditMode={isEditMode}
                            />
                        </div>
                    </div>
                    <p className={`absolute bottom-0 -right-1.5 ${statLabelStyle}`}>{locale.as}</p>
                </div>
            </div>
            <div className="flex w-full justify-center -mt-4">
                <div className={`content-center`}>
                    <EditableTextField
                        boundValue={adv.armor.as ?? 'Unarmored'}
                        updateProps={{ actor: adv.parent, propertyPath: ['armor', 'as'] }}
                        placeholder="Unarmored"
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>
        </div>
    )
}

const AdversarySheetHeader = ({ adv, isEditMode, setIsEditMode }) => {
    return (
        <div className="bg-sheet-header-fill font-eskapade p-2">
            <div className="text-2xl text-text-header-primary font-bold flex">
                <EditableNameField actor={adv.parent} />
                <div className="flex text-text-header-tertiary ml-auto mr-1" onClick={() => setIsEditMode(!isEditMode)}>
                    {
                        isEditMode ?
                            <Tooltip text="Lock" children={<LockKeyholeOpen size={18} strokeWidth={2} />} /> :
                            <Tooltip text="Unlock to Edit" children={<LockKeyhole size={18} strokeWidth={2} />} />
                    }
                </div>
            </div>
            <TraitSelectors adv={adv} isEditMode={isEditMode} />
        </div>
    )
}

const TraitSelectors = ({ adv, isEditMode }) => {
    return (
        <div className="flex gap-2 text-text-header-secondary mt-1">
            {
                isEditMode ? <>
                    <DropDown label=''
                        options={createDropdownEntries(lang.VGLITE.Sizes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingSize'] }}
                        value={adv.beingSize}
                    />
                    <DropDown label=''
                        options={createDropdownEntries(lang.VGLITE.BeingTypes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingType'] }}
                        value={adv.beingType}
                    />
                    <DropDown label=''
                        options={createDropdownEntries(lang.VGLITE.BeingSubtypes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingSubtype'] }}
                        value={adv.beingSubtype}
                    />
                </> :
                    <>
                        <p>{lang.VGLITE.Sizes[adv.beingSize]}</p>
                        <p>{lang.VGLITE.BeingTypes[adv.beingType]}</p>
                        <p>{lang.VGLITE.BeingSubtypes[adv.beingSubtype]}</p>
                    </>
            }
        </div>
    )
}

const Description = ({ adv, isEditMode }) => {
    const onDescriptionChange = useCallback((descr) => {
        updateDocument(adv.parent, { 'description': descr })
    }, [adv])
    return (
        <div className="pb-1 border border-dotted border-transparent border-b-table-border">
            {
                isEditMode ?
                    <div className="h-[54px] p-0.5">
                        <RichTextField
                            height={54}
                            defaultValue={adv.description}
                            onChange={onDescriptionChange}
                        />
                    </div> :
                    <div className="px-2 text-justify font-light italic h-[54px] overflow-y-auto">
                        {stripHtml(adv.description).length > 0 ? <div>{ReactHtmlParser(adv.description)}</div> : <></>}
                    </div>
            }
        </div>)
}

const StatBlock = ({ adv, isEditMode }: { adv: AdversaryDataModel, isEditMode: boolean }) => {
    return (<>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-2 w-full px-2 mt-1 mb-1">
            {/* ZONE */}
            <StatBlockField label={locale.zone} content={<>
                {
                    isEditMode ?
                        <DropDown label=''
                            options={createDropdownEntries(lang.VGLITE.Zones)}
                            parent={adv.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={adv.zone}
                        /> :
                        <p className={statValueStyle}>{lang.VGLITE.Zones[adv.zone]}</p>
                }
            </>} />
            {/* SPEED */}
            <StatBlockField label={locale.speed} content={
                <div className="flex space-x-1">
                    <div className={`flex space-x-1 ${statValueStyle}`}>
                        <EditableTextField
                            boundValue={adv.movement?.speed?.toString() ?? '30'}
                            updateProps={{ actor: adv.parent, propertyPath: ['movement', 'speed'] }}
                            placeholder="30"
                            isGlobalEditMode={isEditMode}
                        />
                    </div>
                    <div className="text-stat-block-fill">
                        {
                            isEditMode ? <DropDown label=''
                                options={createDropdownEntries(lang.VGLITE.Movement)}
                                parent={adv.parent}
                                updateMechanism={{ updatePath: ['movement', 'type'] }}
                                value={lang.VGLITE.Movement[adv.movement.type]}
                            /> : <p>{adv.movement.type}</p>
                        }
                    </div>
                </div>
            } />
            {/* MORALE */}
            <StatBlockField label={locale.morale} content={
                <EditableTextField
                    boundValue={adv.morale?.toString() ?? '6'}
                    updateProps={{ actor: adv.parent, propertyPath: ['morale'] }}
                    placeholder="6"
                    isGlobalEditMode={isEditMode}
                />
            } />
            {/* NUBMER APPEARING */}
            <StatBlockField label={locale.appearing} content={
                <EditableTextField
                    boundValue={adv.numberAppearing?.toString() ?? '1'}
                    updateProps={{ actor: adv.parent, propertyPath: ['numberAppearing'] }}
                    placeholder="1d6"
                    isGlobalEditMode={isEditMode}
                />
            } />
            {/* SENSENS & STATUS IMMUNITIES */}
            <div className="w-full">
                <SelectableTextField adv={adv} label={locale.senses} path={['senses']} localeObj={lang.VGLITE.Senses} isEditMode={isEditMode} />
                <SelectableTextField adv={adv} label={locale.status_immunities} path={['statusImmunities']} localeObj={lang.VGLITE.StatusConditions} isEditMode={isEditMode} />
            </div>
            {/* WEAKNESS & IMMUNITY */}
            <div className="w-full">
                <DamageTypeSelector adv={adv} label={locale.weak} path={['dmgWeaknesses']} localeObj={lang.VGLITE.DamageTypes} isEditMode={isEditMode} />
                <DamageTypeSelector adv={adv} label={locale.immune} path={['dmgImmunities']} localeObj={lang.VGLITE.DamageTypes} isEditMode={isEditMode} />
            </div>
        </div>
    </>)
}

const StatBlockField = ({ label, content }) => {
    return (
        <div className="flex space-x-2">
            <p className={statLabelStyle}>{label}</p>
            <div className={statValueStyle}>{content}</div>
        </div>
    )
}

const DamageTypeSelector = ({ adv, label, path, localeObj, isEditMode }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any, isEditMode: boolean }) => {
    const field = getDocumentAtPath(adv.parent, path)
    const damageTypes = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k], isSelected: field.indexOf(k) > -1 }
    ))
    return (<>
        {
            !isEditMode && field.length === 0 ? <></> :
                <div className="flex space-x-2 mt-2">
                    {
                        isEditMode ?
                            <OptionsSelectionMenu actor={adv.parent} label={label} path={path} options={damageTypes} /> :
                            <p className={statLabelStyle}>{label}</p>
                    }
                    <DamageTypeIconDisplay dmgTypes={field} />
                </div>
        }
    </>)
}

const SelectableTextField = ({ adv, label, path, localeObj, isEditMode }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any, isEditMode: boolean }) => {
    const field = getDocumentAtPath(adv.parent, path)
    const options = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k].name, isSelected: field.indexOf(k) > -1 }
    ))
    return (<>
        {
            !isEditMode && field.length === 0 ? <></> :
                <div className="flex space-x-2 mt-2">
                    {
                        isEditMode ?
                            <OptionsSelectionMenu actor={adv.parent} label={label} path={path} options={options} /> :
                            <p className={statLabelStyle}>{label}</p>
                    }
                    <StringOptionsDisplay options={options.filter(o => o.isSelected).map(o => o.value)} />
                </div>
        }
    </>)
}

const Actions = ({ adv, setIsAddMenuOpen, setEditTarget, isEditMode }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div className="mx-2 mt-2">
            {/* HEADER W/ ADD BUTTON */}
            <ActionMenuHeader label={locale.actions} onClick={() => setIsAddMenuOpen(true)} isEditMode={isEditMode} />
            {/* DISPLAY COMBO FIRST */}
            <div
                className={`${glowOnHover} cursor-pointer`}
                onClick={() => onClickActionCombo(adv)}
                onContextMenu={(e) => onCtxMenu(e, [{ icon: Trash, label: 'Delete', action: () => deleteCombo(adv), isDestructive: true }])}
            >
                {
                    adv.combo.name !== '' ?
                        <div className={`flex w-full gap-x-2 p-2 mb-1 ${tableBorderRounded}`}>
                            <p className="font-paradigm font-bold">{lang.VGLITE.AdversarySheet.combo}:</p>
                            <p className="text-text-secondary">{adv.combo.name}</p>
                        </div> : <></>
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
                                <div className={`flex justify-between gap-x-2 ${glowOnHover} cursor-pointer`} onClick={() => onClickAction(adv, act.name, act.effect, act.damage.type, act.damage.roll, act.damage.avg)}>
                                    <p className="font-bold">{act.name}</p>
                                    <div className='w-[16px]'>
                                        <DamageTypeIcon dmgType={act.damage.type ?? ''} size={16} />
                                    </div>
                                </div>
                                {/* ACTION TRAITS... */}
                                <div className="ml-2">
                                    <EnrichedContent content={act.effect} styleClasses="text-text-secondary" />
                                    {
                                        act.damage.roll ?
                                            <div className={`flex gap-2 ${glowOnHover}`} onClick={() => onClickAction(adv, act.name, act.effect, act.damage.type, act.damage.roll, act.damage.avg)}>
                                                <p className="text-text-secondary">Dmg:</p>
                                                <p className={damageRoll}>{act.damage.roll}</p>
                                                <p>|</p>
                                                <p className={damageRoll} onClick={async () => {
                                                    const result = await rollDamage(act.name, act.damage.type, act.damage.avg ?? '')
                                                    sendVgLiteChatMessage(adv,
                                                        <DamageRollChatCard
                                                            actorId={getId(adv)}
                                                            tokenIds={getTargets()}
                                                            result={result} />, result.rolls)
                                                }}>
                                                    {act.damage.avg}
                                                </p>
                                            </div> : <></>
                                    }
                                    {
                                        act.recharge != null && act.recharge != '' ?
                                            <div className="flex gap-x-2 text-text-secondary"> {'Recharge'}<EnrichedContent content={act.recharge} /></div>
                                            : <></>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <ContextMenu />
        </div>
    )
}

const onClickActionCombo = async (adv: AdversaryDataModel) => {
    const rolls: DamageRollResult[] = []
    for (let action = 0; action < adv.combo.actions.length; action++) {
        const act = adv.combo.actions[action]
        for (let count = 0; count < (act.comboCount ?? 0); count++) {
            const result = await rollDamage(act.name, act.damage.type ?? '', act.damage.roll ?? '')
            rolls.push(result)
        }
    }
    sendVgLiteChatMessage(
        adv,
        <ComboChatCard
            actorId={getId(adv)}
            rolls={rolls}
            tokenIds={getTargets()}
        />, rolls.flatMap(r => r.rolls)
    )
}

const onClickAction = async (adv: AdversaryDataModel, name: string, description: string, dmgType: string, roll?: string, avgDmg?: string) => {
    /**
     * TODO: create a config item to toggle between using damage rolls vs. flat damage.
     */
    if (roll) {
        const result = await rollDamage(name, dmgType, roll ?? '')
        sendVgLiteChatMessage(
            adv,
            <DamageRollChatCard
                actorId={getId(adv)}
                tokenIds={getTargets()}
                result={result}
            />, result.rolls
        )
    }
    else {
        sendVgLiteChatMessage(adv, <AbilityChatCard actorId={getId(adv)} title={name} description={description} tokenIds={getTargets()} />)
    }
}

const deleteCombo = (adv: AdversaryDataModel) => {
    updateDocumentAtPath(adv.parent, ['combo'], null)
}

const deleteAction = (adv: AdversaryDataModel, action: any) => {
    updateDocumentAtPath(adv.parent, ['actions'], adv.actions.filter(it => it != action))
}

const useAddActionMenu = () => {
    const [isAddActionOpen, setIsAddActionOpen] = useState(false)
    const [editActionTarget, setEditActionTarget] = useState(null)
    return { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget }
}

export interface AdversaryAction {
    name: string, effect: string, damage: { roll: string, avg: number, type: string }, recharge: string, comboCount: number
}

const NewActionWindow = ({ adv, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = adv.actions.indexOf(editTarget as any)
    const [newAction, setNewActionInternal] = editTarget == null ? useState<AdversaryAction>() : useState<AdversaryAction>(editTarget as AdversaryAction)
    
    const setNewAction = useCallback(async (action: any) => {
        setNewActionInternal(action)
        return true
    }, [])

    const updateName = useCallback(async (name: string | null) => {
        return setNewAction({...newAction, name: name})
    }, [setNewAction, newAction])

    const updateEffect = useCallback(async (eff: string | null) => {
        return setNewAction({...newAction, effect: eff})
    }, [setNewAction, newAction])

    const updateDamageRoll = useCallback(async (roll: string | null) => {
        return setNewAction({...newAction, damage: {...newAction?.damage, roll: roll}})
    }, [setNewAction, newAction])

    const updateDamageAvg = useCallback(async (avg: string | null) => {
        return setNewAction({...newAction, damage: {...newAction?.damage, avg: avg}})
    }, [setNewAction, newAction])

    const updateDamageType = useCallback(async (type: string | null) => {
        return setNewAction({...newAction, damage: {...newAction?.damage, type: type}})
    }, [setNewAction, newAction])

    const updateRecharge = useCallback(async (rchg: string | null) => {
        return setNewAction({...newAction, recharge: rchg})
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
                            <EditableTextField boundValue={newAction?.damage?.type ?? null} onSave={updateDamageType} />
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

const Abilities = ({ adv, setIsAddMenuOpen, setEditTarget, isEditMode }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div className="m-2 space-y-1">
            <ActionMenuHeader label={locale.abilities} onClick={() => setIsAddMenuOpen(true)} isEditMode={isEditMode} />
            {
                adv.abilities.map(ability => (
                    <div
                        key={ability.name}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: PenSquare, label: 'Edit', action: () => { setEditTarget(ability); setIsAddMenuOpen(true); } },
                            { icon: Trash, label: 'Delete', action: () => deleteAbility(adv, ability), isDestructive: true }
                        ])}
                    >
                        <div className={`${tableBorderRounded} p-2`}>
                            <p className={`font-paradigm font-bold ${glowOnHover} cursor-pointer`} onClick={() => onClickAction(adv, ability.name, ability.description, '', '', '')}>
                                {ability.name}
                            </p>
                            <EnrichedContent content={ability.description} styleClasses="text-xs font-paradigm font-normal" />
                        </div>
                    </div>
                ))
            }
            <ContextMenu />
        </div>
    )
}

const NewAbilityWindow = ({ adv, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = adv.abilities.indexOf(editTarget as any)
    const [newAbility, setNewAbilityInternal] = editTarget == null ? useState<AdversaryAbility>() : useState<AdversaryAbility>(editTarget as AdversaryAbility)
    const setNewAbility = useCallback(async (ability: any) => {
        setNewAbilityInternal(ability)
        return true
    }, [])

    const updateName = useCallback(async (name: string | null) => {
        return setNewAbility({ ...newAbility, name: name })
    }, [setNewAbility, newAbility])

    const updateDescription = useCallback(async (eff: string | null) => {
        return setNewAbility({ ...newAbility, description: eff })
    }, [setNewAbility, newAbility])

    /**
     * VIEW
     */
    return (
        <div className={subMenuLayout}>
            <EditableTextField boundValue={newAbility?.name ?? ''} onSave={updateName} placeholder="New ability..." />
            <RichTextField defaultValue={newAbility?.description} onChange={updateDescription} className="text-xs font-paradigm font-normal" />
            {/* SAVE & CANCEL BUTTONS*/}
            <AddMenuButtons
                onSave={() => saveNewAbility(adv, newAbility, editTarget, editTargetIndex)}
                setEditTarget={setEditTarget}
                setIsAddMenuOpen={setIsAddMenuOpen}
            />
        </div>
    )
}

const useAddAbilityMenu = () => {
    const [isAddAbilityOpen, setIsAddAbilityOpen] = useState(false)
    const [editAbilityTarget, setEditAbilityTarget] = useState(null)
    return { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget }
}

interface AdversaryAbility {
    name: string, description: string
}

const ActionMenuHeader = ({ label, onClick, isEditMode }) => {
    return (
        <div className="flex items-center gap-x-2">
            <p className="font-eskapade font-bold text-text-primary text-xl">{label}</p>
            {
                isEditMode ? <AddNewIconButton onClick={onClick} /> : <></>
            }
        </div>
    )
}

const AddNewIconButton = ({ onClick }) => {
    return (
        <Plus size={18} strokeWidth={4} className={`text-stat-block-fill ${glowOnHover}`} onClick={onClick} />
    )
}

const AddMenuButtons = ({ setEditTarget, setIsAddMenuOpen, onSave }) => {
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
            let comboActions: any[] = []
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
        let actions = adv.actions
        actions[editTargetIndex] = newAction
        updateDocumentAtPath(adv.parent, ['actions'], [...actions])
    }
}

const saveNewAbility = (adv, newAbility, editTarget, editTargetIndex) => {
    if (!newAbility?.name) {
        ui.notifications?.error("Error: [Name] is a required field.")
        return
    }
    else if (editTarget == null) {
        updateDocumentAtPath(adv.parent, ['abilities'], [...adv.abilities, newAbility])
    }
    else {
        let abilities = adv.abilities
        abilities[editTargetIndex] = newAbility
        updateDocumentAtPath(adv.parent, ['abilities'], [...abilities])
    }
}

const deleteAbility = (adv: AdversaryDataModel, ability: any) => {
    updateDocumentAtPath(adv.parent, ['abilities'], adv.abilities.filter(it => it != ability))
}