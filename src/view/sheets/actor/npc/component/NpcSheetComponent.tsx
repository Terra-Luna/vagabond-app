import { ChevronLeft, ChevronRight, Heart, Plus, Shield } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { ActiveEffectsView } from "../../../../../apps/active-effects/ActiveEffectsView"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getDocumentAtPath, updateDocument } from "../../../../../utils/documentUtils"
import { sys_id } from "../../../../../utils/foundryUtils"
import { appLang } from "../../../../../utils/lang"
import { createDropdownEntries, damageTypesWithPhysicalThresholds, localizeString } from "../../../../../utils/localeUtils"
import { formatSpeeds } from "../../../../../utils/speedUtils"
import { tableBorder } from "../../../../common/border-styles"
import { CardSubHeader } from "../../../../component/CardSubHeader"
import { DropDown } from "../../../../component/Dropdown"
import { EditableNameField, EditableTextField, NumericCounterInput } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { IconOnlyButton } from "../../../../component/IconOnlyButton"
import { DamageTypeIconDisplay, OptionsSelectionMenu } from "../../../../component/OptionsSelectionMenu"
import { Tooltip } from "../../../../component/Tooltip"
import { TrashButton } from "../../../../component/TrashButton"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { useFoundryHook } from "../../../../wrappers/hooks"
import { Description } from "../../../shared/Description"
import { SelectableTextOptions } from "../../../shared/SelectableTextOptions"
import { ActorPortrait } from "../../component/ActorPortrait"
import { Abilities } from "./Abilities"
import { Actions, NewActionWindow } from "./Actions"
import { useAddActionMenu } from "./hooksAndUtils"

const locale = appLang.NpcSheet

/**
 * Persists the portrait's collapsed/expanded state as a flag on the actor's token, so it's
 * per-token rather than a transient client-side value.
 */
const usePortraitOpenFlag = (actor: Actor) => {

    const token = actor.isToken ? actor.token : actor.getActiveTokens?.()[0]?.document

    const [isPortraitOpen, setIsPortraitOpenState] = useState<boolean>(
        (token?.getFlag(sys_id, "portraitOpen" as any) as boolean | undefined) ?? true
    )

    useFoundryHook("updateToken" as any, (doc: any, changes: any) => {
        if (!token || doc.id !== token.id) return
        const flagChange = foundry.utils.getProperty(changes, `flags.${sys_id}.portraitOpen`) as boolean | undefined
        if (flagChange !== undefined) setIsPortraitOpenState(flagChange ?? true)
    })

    const setIsPortraitOpen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        setIsPortraitOpenState(prev => {
            const next = typeof value === 'function' ? (value as (prev: boolean) => boolean)(prev) : value
            token?.setFlag(sys_id, "portraitOpen" as any, next)
            return next
        })
    }, [token])

    return { isPortraitOpen, setIsPortraitOpen }
}

export const NpcSheetComponent = ({ actor, hidePortrait }: { actor: Actor & { system: AdversaryDataModel | NpcDataModel }, hidePortrait?: boolean }) => {
    const npc = actor.system
    const { isEditMode } = useEditMode()
    const { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget } = useAddActionMenu()
    const { isPortraitOpen: storedPortraitOpen, setIsPortraitOpen: setStoredPortraitOpen } = usePortraitOpenFlag(actor)

    const isPortraitOpen = !hidePortrait && storedPortraitOpen
    const setIsPortraitOpen = hidePortrait ? () => { } : setStoredPortraitOpen

    useEffect(() => {
        if (!isEditMode) {
            setIsAddActionOpen(false)
        }
    }, [isEditMode, setIsAddActionOpen])

    return (
        <div className="@container flex grow overflow-y-hidden font-paradigm font-normal text-base text-text-primary">
            <div className="absolute left-0 flex items-start">
                <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    bg-sheet-header-fill/66 border-solid border-sheet-header-fill
                    ${isPortraitOpen ? 'border-2 rounded-l-md' : 'border'}
                    ${isPortraitOpen ? 'w-[100px] -ml-[100px]' : 'w-0 ml-0'}`}
                >
                    {!hidePortrait && <ActorPortrait actor={npc} />}
                </div>
            </div>

            <div className="flex flex-col grow">
                <NpcSheetHeader npc={npc} isPortraitOpen={isPortraitOpen} setIsPortraitOpen={setIsPortraitOpen} hidePortrait={hidePortrait} />
                <div className="overflow-y-auto">
                    <Description item={npc.parent} showFullView={true} />
                    <StatBlock npc={npc} />

                    <Actions npc={npc} setIsAddMenuOpen={setIsAddActionOpen} setEditTarget={setEditActionTarget} />

                    {isAddActionOpen &&
                        <NewActionWindow npc={npc} setIsAddMenuOpen={setIsAddActionOpen} editTarget={editActionTarget} setEditTarget={setEditActionTarget} />
                    }

                    <Abilities actor={actor} />

                    <div className="px-2">
                        <ActiveEffectsView initialDocument={actor} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const NpcSheetHeader = ({ npc, isPortraitOpen, setIsPortraitOpen, hidePortrait }: { npc: any, isPortraitOpen: boolean, setIsPortraitOpen: any, hidePortrait?: boolean }) => {
    const { editModeToggleBtn } = useEditMode()
    return (
        <div>
            <div className="flex text-2xl text-text-header-primary font-bold bg-sheet-header-fill font-eskapade pl-2 py-1 items-center gap-x-1">
                {/* NPC NAME */}
                <EditableNameField actor={npc.parent} />

                <Divider />

                {/* THREAT LEVEL DISPLAY (ADVERSARY ONLY) */}
                <div className="flex gap-x-1 ml-auto self-center">
                    {npc instanceof AdversaryDataModel &&
                        <span className="flex gap-x-1 text-text-header-primary font-eskapade font-normal text-base mr-1">
                            <p>{appLang.NpcSheet.tl}:</p>
                            <EditableTextField
                                boundValue={((npc.threatLevelOverride ?? 0) > 0 && npc.threatLevelOverride !== null
                                    ? Number(npc.threatLevelOverride).toFixed(1)
                                    : undefined) ?? Number(npc.threatLevel)?.toFixed(1)?.toString() ?? ''}
                                updateProps={{ object: npc.parent, path: ['threatLevelOverride'] }}
                                placeholder={npc.threatLevel?.toString() ?? '1.0'}
                            />
                        </span>
                    }
                    {editModeToggleBtn}
                </div>
            </div>
            <TraitSelectors npc={npc} isPortraitOpen={isPortraitOpen} setIsPortraitOpen={setIsPortraitOpen} hidePortrait={hidePortrait} />
        </div>
    )
}

const TraitSelectors = ({ npc, isPortraitOpen, setIsPortraitOpen, hidePortrait }: { npc: any, isPortraitOpen: boolean, setIsPortraitOpen: any, hidePortrait?: boolean }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex text-text-header-secondary">
            {/* EXPAND / COLLAPSE BUTTON */}
            {!hidePortrait && <button
                onClick={() => setIsPortraitOpen(open => !open)}
                title={isPortraitOpen ? appLang.AdversarySheet.collapsePortrait : appLang.AdversarySheet.expandPortrait}
                className={`bg-sheet-header-fill -mt-1 px-0.5 py-2 hover-glow cursor-pointer ${tableBorder}`}
            >
                {isPortraitOpen
                    ? <ChevronRight size={14} className="text-text-header-primary" />
                    : <ChevronLeft size={14} className="text-text-header-primary" />
                }
            </button>}
            {isEditMode
                ? <div className="flex gap-x-1 px-1 mt-1">
                    <DropDown
                        options={createDropdownEntries(appLang.Sizes)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingSize'] }}
                        value={npc.beingSize}
                    />
                    <DropDown
                        options={createDropdownEntries(appLang.BeingTypes, true)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingType'] }}
                        value={npc.beingType}
                    />
                    <DropDown
                        options={createDropdownEntries(appLang.BeingSubtypes, true)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingSubtype'] }}
                        value={npc.beingSubtype}
                    />
                </div>
                : <div className="mt-0.5">
                    <CardSubHeader values={[
                        { label: appLang.Sizes[npc.beingSize], value: "" },
                        { label: appLang.BeingTypes[npc.beingType], value: "" },
                        { label: appLang.BeingSubtypes[npc.beingSubtype].length > 0 ? `(${appLang.BeingSubtypes[npc.beingSubtype]})` : "", value: "" }
                    ]} showRightBorder={false} />
                </div>
            }
        </div>
    )
}

const StatBlock = ({ npc }: { npc: AdversaryDataModel | NpcDataModel }) => {
    const { isEditMode } = useEditMode()
    const hp = npc.health.value

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(npc.parent, { health: { value: (hp ?? 0) + (auxClick ? 1 : -1) } })
    }, [npc.health])

    const inlineRoll = async (formula: string, flavor: string) => {
        if (isEditMode) return
        const roll = await new Roll(formula).evaluate()
        await roll.toMessage({
            flavor: flavor,
            speaker: ChatMessage.getSpeaker()
        }, { rollMode: "gmroll" })
    }

    return (
        <div className="flex flex-col gap-y-1 px-2">
            <StatBlockRow>
                {/* HIT DICE */}
                <StatBlockField label={locale.hd} content={
                    <EditableTextField
                        boundValue={npc.hitDice?.toString() ?? '1'}
                        updateProps={{ object: npc.parent, path: ['hitDice'] }}
                        placeholder="1"
                    />
                } />

                <div className="flex gap-x-4 items-center">
                    {/* HIT POINTS */}
                    <StatBlockField label={locale.hp} content={
                        <StatBlockRow>
                            <Tooltip title={appLang.HeroSheet.controls} content={appLang.HeroSheet.counter_tooltip}>
                                <button
                                    className="cursor-pointer hover-glow"
                                    onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}
                                >
                                    <Heart size={18} className="text-text-hp-current fill-text-hp-current -mr-1" />
                                </button>
                            </Tooltip>
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <div className="flex gap-x-0.5">
                                    <EditableTextField
                                        boundValue={npc.health.value?.toString() ?? '1'}
                                        updateProps={{ object: npc.parent, path: ['health', 'value'] }}
                                        hideBorderOnEditMode={true}
                                        placeholder="4"
                                    />
                                    <p>/{npc.health.max?.toString() ?? '4'}</p>
                                </div>
                            </EditModeContextProvider>
                        </StatBlockRow>
                    } />
                    {/* ARMOR RATING & INFO */}
                    <div className="flex gap-x-1 text-text-primary items-center justify-center">
                        <div className="relative w-[32px] h-[32px]">
                            <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`text-xl text-text-armor font-eskapade font-bold`}>
                                    <EditableTextField
                                        boundValue={npc.armor?.rating?.toString() ?? ''}
                                        updateProps={{ object: npc.parent, path: ['armor', 'rating'] }}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </StatBlockRow>

            <StatBlockRow>
                {/* ZONE */}
                <StatBlockField label={locale.zone} content={<>
                    {isEditMode
                        ? <DropDown
                            options={createDropdownEntries(appLang.Zones)}
                            parent={npc.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={npc.zone}
                        />
                        : <StatBlockValue value={appLang.Zones[npc.zone]} />
                    }
                </>} />
                {/* SPEED */}
                <StatBlockField label={locale.speed} content={
                    <div className="flex space-x-1">
                        {isEditMode
                            ? <SpeedsEditor npc={npc} />
                            : <StatBlockValue value={formatSpeeds(npc.speeds)} />
                        }
                    </div>
                } />
            </StatBlockRow>

            <StatBlockRow>
                {/* MORALE */}
                <div onClick={() => inlineRoll("2d6", localizeString(appLang.NpcSheet.moraleCheckRoll, { morale: locale.morale }))} className="hover-glow cursor-pointer" title={appLang.Combat.moraleRollTooltip}>
                    <StatBlockField label={locale.morale} content={
                        <NumericCounterInput
                            value={npc.morale ?? 6}
                            onChange={(value: string) => {
                                npc.parent.update({ 'system.morale': Number(value) })
                            }}
                        />
                    } />
                </div>
                {/* NUMBER APPEARING */}
                {npc instanceof AdversaryDataModel &&
                    <div onClick={() => inlineRoll(npc.numberAppearing?.toString() ?? '1', localizeString(appLang.NpcSheet.numberAppearingRoll, { appearing: locale.appearing }))} className="hover-glow cursor-pointer" title={appLang.Combat.numberAppearingRollTooltip}>
                        <StatBlockField label={locale.appearing} content={
                            <EditableTextField
                                boundValue={npc.numberAppearing?.toString() ?? '1'}
                                updateProps={{ object: npc.parent, path: ['numberAppearing'] }}
                                placeholder="d4"
                            />
                        } />
                    </div>
                }
            </StatBlockRow>

            {/* SENSES, IMMUNITIES, & WEAKNESSES */}
            <div className="w-full space-y-2 text-base text-text-header-tertiary font-normal">
                <SelectableTextOptions obj={npc.parent} label={locale.senses} path={['senses']} localeObj={appLang.Senses} />
                <DamageTypeSelector actorModel={npc} label={locale.immune} path={['modifiers', 'damage', 'in', 'immunities']} localeObj={damageTypesWithPhysicalThresholds()} />
                <DamageTypeSelector actorModel={npc} label={locale.weak} path={['modifiers', 'damage', 'in', 'weaknesses']} localeObj={appLang.DamageTypes} />
                <SelectableTextOptions obj={npc.parent} label={locale.status_immunities} path={['modifiers', 'damage', 'in', 'statusImmunities']} localeObj={appLang.StatusConditions} />
            </div>
        </div>
    )
}

const SpeedsEditor = ({ npc }: { npc: AdversaryDataModel | NpcDataModel }) => {
    const speeds = (npc.speeds ?? []).map(s => ({ value: s.value, type: s.type }))

    const saveSpeeds = (next: { value: number, type: string }[]) => {
        npc.parent.update({ 'system.speeds': next })
    }

    const usedTypes = speeds.map(s => s.type)
    const nextType = Object.keys(appLang.Movement).find(t => !usedTypes.includes(t)) ?? 'walk'

    return (
        <div className="flex flex-col items-center">
            {speeds.map((speed, index) => (
                <div key={index} className="flex items-center gap-x-0.5">
                    <NumericCounterInput
                        value={speed.value}
                        incrementBy={5}
                        valueAppend="'"
                        onChange={(value: number) => {
                            if (value === speed.value) return
                            saveSpeeds(speeds.map((s, i) => i === index ? { ...s, value } : s))
                        }}
                    />
                    <DropDown
                        value={speed.type}
                        options={createDropdownEntries(appLang.Movement)}
                        updateMechanism={{ onChange: (type: string) => saveSpeeds(speeds.map((s, i) => i === index ? { ...s, type } : s)) }}
                    />
                    <IconOnlyButton
                        Icon={Plus}
                        size={16}
                        title={appLang.ButtonActions.add}
                        onClick={() => saveSpeeds([...speeds, { value: 30, type: nextType }])}
                    />

                    <TrashButton onClick={() => saveSpeeds(speeds.filter((_, i) => i !== index))} />
                </div>
            ))}
        </div>
    )
}

const StatBlockRow = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex justify-between items-center gap-x-2 w-full">
            {children}
        </div>
    )
}

const StatBlockField = ({ label, content }) => {
    return (
        <div className="flex gap-x-1 items-center line-clamp-1">
            <StatBlockLabel text={label} />
            <StatBlockValue value={content} />
        </div>
    )
}

const StatBlockLabel = ({ text }) => {
    return (
        <div className={`text-base text-text-header-tertiary font-paradigm font-normal`}>{text}:</div>
    )
}

const StatBlockValue = ({ value }) => {
    return (
        <div className={`text-base text-text-primary font-paradigm font-normal`}>{value}</div>
    )
}

export const DamageTypeSelector = ({ actorModel, label, path, localeObj }: { actorModel: AdversaryDataModel | NpcDataModel | HeroDataModel, label: string, path: string[], localeObj: any }) => {
    const { isEditMode } = useEditMode()
    const field = getDocumentAtPath(actorModel.parent, path)
    const damageTypes = Object.keys(localeObj).filter(k => k !== 'none').map(k => (
        { key: k, value: localeObj[k], isSelected: field.indexOf(k) > -1 }
    ))

    return (<>
        {!isEditMode && field.length === 0
            ? <></>
            : <div className="flex space-x-2 mt-2">
                {isEditMode
                    ? <OptionsSelectionMenu obj={actorModel.parent} label={label} path={path} options={damageTypes} />
                    : <StatBlockLabel text={label} />
                }
                <DamageTypeIconDisplay dmgTypes={field} />
            </div>
        }
    </>)
}