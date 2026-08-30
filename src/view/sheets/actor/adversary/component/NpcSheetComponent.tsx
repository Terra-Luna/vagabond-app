import { ChevronLeft, ChevronRight, Heart, Shield } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { ActiveEffectsApp } from "../../../../../apps/active-effects/ActiveEffectsApp"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { getDocumentAtPath, updateDocument } from "../../../../../utils/documentUtils"
import { vgLiteLang } from "../../../../../utils/lang"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { EditableNameField, EditableTextField, NumericCounterInput } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { DamageTypeIconDisplay,OptionsSelectionMenu } from "../../../../component/OptionsSelectionMenu"
import { CardSubHeader } from "../../../../component/SkillCard"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { useFoundryHook } from "../../../../wrappers/hooks"
import { Description } from "../../../shared/Description"
import { SelectableTextOptions } from "../../../shared/SelectableTextOptions"
import { ActorPortrait } from "../../component/ActorPortrait"
import { Abilities, NewAbilityWindow } from "./Abilities"
import { ActionMenuHeader, Actions, NewActionWindow } from "./Actions"
import { useAddAbilityMenu, useAddActionMenu } from "./hooksAndUtils"

const locale = vgLiteLang.NpcSheet

/**
 * Persists the portrait's collapsed/expanded state as a flag on the actor's token, so it's
 * per-token rather than a transient client-side value.
 */
const usePortraitOpenFlag = (actor: Actor) => {
    const token = actor.isToken ? actor.token : actor.getActiveTokens()[0]?.document
    const [isPortraitOpen, setIsPortraitOpenState] = useState<boolean>(
        (token?.getFlag("vagabond-lite" as any, "portraitOpen" as any) as boolean | undefined) ?? true
    )

    useFoundryHook("updateToken" as any, (doc: any, changes: any) => {
        if (!token || doc.id !== token.id) return
        const flagChange = foundry.utils.getProperty(changes, "flags.vagabond-lite.portraitOpen") as boolean | undefined
        if (flagChange !== undefined) setIsPortraitOpenState(flagChange ?? true)
    })

    const setIsPortraitOpen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        setIsPortraitOpenState(prev => {
            const next = typeof value === 'function' ? (value as (prev: boolean) => boolean)(prev) : value
            token?.setFlag("vagabond-lite" as any, "portraitOpen" as any, next)
            return next
        })
    }, [token])

    return { isPortraitOpen, setIsPortraitOpen }
}

export const NpcSheetComponent = ({ actor }: { actor: Actor & { system: AdversaryDataModel | NpcDataModel } }) => {
    const npc = actor.system
    const { isEditMode } = useEditMode()
    const { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget } = useAddActionMenu()
    const { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget } = useAddAbilityMenu()
    const { isPortraitOpen, setIsPortraitOpen } = usePortraitOpenFlag(actor)

    useEffect(() => {
        if (!isEditMode) {
            setIsAddActionOpen(false)
            setIsAddAbilityOpen(false)
        }
    }, [isEditMode, setIsAddActionOpen, setIsAddAbilityOpen])

    return (
        <div className="@container flex grow overflow-y-hidden">
            <div className="absolute left-0 flex items-start">
                <div className={`overflow-hidden transition-all duration-300 ease-in-out border border-solid border-table-border bg-sheet-main-fill/33 rounded-l-md ${isPortraitOpen ? 'w-[110px] -ml-[110px]' : 'w-0 ml-0'}`}>
                    <div className="w-[110px]">
                        <ActorPortrait actor={npc} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col grow">
                <NpcSheetHeader npc={npc} isPortraitOpen={isPortraitOpen} setIsPortraitOpen={setIsPortraitOpen} />
                <div className="overflow-y-auto">
                    <Description item={npc.parent} />
                    <StatBlock npc={npc} />

                    <Actions npc={npc} setIsAddMenuOpen={setIsAddActionOpen} setEditTarget={setEditActionTarget} />
                    {isAddActionOpen &&
                        <NewActionWindow npc={npc} setIsAddMenuOpen={setIsAddActionOpen} editTarget={editActionTarget} setEditTarget={setEditActionTarget} />
                    }

                    <Abilities npc={npc} setIsAddMenuOpen={setIsAddAbilityOpen} setEditTarget={setEditAbilityTarget} />
                    {isAddAbilityOpen &&
                        <NewAbilityWindow npc={npc} setIsAddMenuOpen={setIsAddAbilityOpen} editTarget={editAbilityTarget} setEditTarget={setEditAbilityTarget} />
                    }

                    <button onClick={() => new ActiveEffectsApp(actor).render({ force: true })} className="ml-2 hover-glow cursor-pointer mb-4" title="Click to open active effects">
                        <ActionMenuHeader label={vgLiteLang.ButtonActions.effects} />
                    </button>
                </div>
            </div>
        </div>
    )
}

const NpcSheetHeader = ({ npc, isPortraitOpen, setIsPortraitOpen }) => {
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
                            <p>{vgLiteLang.NpcSheet.tl}:</p>
                            <EditableTextField
                                boundValue={npc.threatLevelOverride?.toString() ?? npc.threatLevel?.toString() ?? ''}
                                updateProps={{ object: npc.parent, path: ['threatLevelOverride'] }}
                                placeholder={npc.threatLevel?.toString() ?? '1.00'}
                            />
                        </span>
                    }
                        {editModeToggleBtn}
                </div>
            </div>
            <TraitSelectors npc={npc} />

            {/* EXPAND / COLLAPSE BUTTON */}
            <button
                onClick={() => setIsPortraitOpen(open => !open)}
                title={isPortraitOpen ? "Collapse portrait" : "Expand portrait"}
                className="bg-sheet-header-fill border border-solid border-table-border rounded-r-md -mt-3 -mr-6 px-0.5 py-2 hover-glow cursor-pointer"
            >
                {isPortraitOpen
                    ? <ChevronRight size={14} className="text-text-header-primary" />
                    : <ChevronLeft size={14} className="text-text-header-primary" />
                }
            </button>
        </div>
    )
}

const TraitSelectors = ({ npc }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex gap-x-1 text-text-header-secondary">
            {
                isEditMode ? <div className="flex gap-x-1 px-1 mt-1">
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.Sizes)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingSize'] }}
                        value={npc.beingSize}
                    />
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.BeingTypes)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingType'] }}
                        value={npc.beingType}
                    />
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.BeingSubtypes)}
                        parent={npc.parent}
                        updateMechanism={{ updatePath: ['beingSubtype'] }}
                        value={npc.beingSubtype}
                    />
                </div>
                    : <CardSubHeader values={[
                        { label: vgLiteLang.Sizes[npc.beingSize], value: "" },
                        { label: vgLiteLang.BeingTypes[npc.beingType], value: "" },
                        { label: vgLiteLang.BeingSubtypes[npc.beingSubtype], value: "" }
                    ]} showRightBorder={false} />
            }
        </div>
    )
}

const StatBlock = ({ npc }: { npc: AdversaryDataModel | NpcDataModel }) => {
    const { isEditMode } = useEditMode()
    const hp = npc.health.current

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(npc.parent, { health: { current: (hp ?? 0) + (auxClick ? 1 : -1) } })
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
                {/* HIT POINTS */}
                <StatBlockField label={locale.hp} content={
                    <StatBlockRow>
                        <button
                            title={vgLiteLang.HeroSheet.counter_tooltip}
                            className="cursor-pointer hover-glow"
                            onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}
                        >
                            <Heart size={18} className="text-text-hp-current fill-text-hp-current -mr-1" />
                        </button>
                        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                            <div className="flex gap-x-0.5">
                                <EditableTextField
                                    boundValue={npc.health.current?.toString() ?? '1'}
                                    updateProps={{ object: npc.parent, path: ['health', 'current'] }}
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
                                    boundValue={npc.armor.rating?.toString() ?? ''}
                                    updateProps={{ object: npc.parent, path: ['armor', 'rating'] }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                    <StatBlockField label={vgLiteLang.NpcSheet.as} content={
                        <EditableTextField
                            boundValue={npc.armor.as ?? 'Unarmored'}
                            updateProps={{ object: npc.parent, path: ['armor', 'as'] }}
                            placeholder="Unarmored"
                        />}
                    />
                </div>
            </StatBlockRow>

            <StatBlockRow>
                {/* ZONE */}
                <StatBlockField label={locale.zone} content={<>
                    {isEditMode ?
                        <DropDown
                            options={createDropdownEntries(vgLiteLang.Zones)}
                            parent={npc.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={npc.zone}
                        /> : <StatBlockValue value={vgLiteLang.Zones[npc.zone]} />
                    }
                </>} />
                {/* SPEED */}
                <StatBlockField label={locale.speed} content={
                    <div className="flex space-x-1">
                        <div className="flex">
                            <EditableTextField
                                boundValue={npc.movement?.speed?.toString() ?? '30'}
                                updateProps={{ object: npc.parent, path: ['movement', 'speed'] }}
                                placeholder="30"
                            />
                            <StatBlockValue value={"'"} />
                        </div>
                        <div>
                            {isEditMode
                                ? <DropDown
                                    options={createDropdownEntries(vgLiteLang.Movement)}
                                    parent={npc.parent}
                                    updateMechanism={{ updatePath: ['movement', 'type'] }}
                                    value={npc.movement.type}
                                />
                                : <p>{vgLiteLang.Movement[npc.movement.type]}</p>
                            }
                        </div>
                    </div>
                } />
            </StatBlockRow>

            <StatBlockRow>
                {/* MORALE */}
                <div onClick={() => inlineRoll(npc.morale?.toString() ?? '12', locale.morale + " Check")} className="hover-glow cursor-pointer" title="Click to roll morale check">
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
                    <div onClick={() => inlineRoll(npc.numberAppearing?.toString() ?? '1', locale.appearing + " Roll")} className="hover-glow cursor-pointer" title="Click to roll number appearing">
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
                <SelectableTextOptions obj={npc.parent} label={locale.senses} path={['senses']} localeObj={vgLiteLang.Senses} />
                <DamageTypeSelector npc={npc} label={locale.immune} path={['dmgImmunities']} localeObj={vgLiteLang.DamageTypes} />
                <DamageTypeSelector npc={npc} label={locale.weak} path={['dmgWeaknesses']} localeObj={vgLiteLang.DamageTypes} />
                <SelectableTextOptions obj={npc.parent} label={locale.status_immunities} path={['statusImmunities']} localeObj={vgLiteLang.StatusConditions} />
            </div>
        </div >
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

const DamageTypeSelector = ({ npc, label, path, localeObj }: { npc: AdversaryDataModel | NpcDataModel, label: string, path: string[], localeObj: any }) => {
    const { isEditMode } = useEditMode()
    const field = getDocumentAtPath(npc.parent, path)
    const damageTypes = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k], isSelected: field.indexOf(k) > -1 }
    ))
    return (<>
        {!isEditMode && field.length === 0
            ? <></>
            : <div className="flex space-x-2 mt-2">
                {isEditMode
                    ? <OptionsSelectionMenu obj={npc.parent} label={label} path={path} options={damageTypes} />
                    : <StatBlockLabel text={label} />
                }
                <DamageTypeIconDisplay dmgTypes={field} />
            </div>
        }
    </>)
}