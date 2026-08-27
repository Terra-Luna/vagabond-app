import { ChevronLeft, ChevronRight, Heart, Shield } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { ActiveEffectsApp } from "../../../../../apps/active-effects/ActiveEffectsApp"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
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

const locale = vgLiteLang.AdversarySheet

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

export const AdversarySheetReactComponent = ({ actor }: { actor: Actor & { system: AdversaryDataModel } }) => {
    const adversary = actor.system
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
                        <ActorPortrait actor={adversary} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col grow">
                <AdversarySheetHeader adv={adversary} />
                <div className="overflow-y-auto">
                    <Description item={adversary.parent} />
                    <StatBlock adv={adversary} isPortraitOpen={isPortraitOpen} setIsPortraitOpen={setIsPortraitOpen} />

                    <Actions adversary={adversary} setIsAddMenuOpen={setIsAddActionOpen} setEditTarget={setEditActionTarget} />
                    {isAddActionOpen &&
                        <NewActionWindow adv={adversary} setIsAddMenuOpen={setIsAddActionOpen} editTarget={editActionTarget} setEditTarget={setEditActionTarget} />
                    }

                    <Abilities adv={adversary} setIsAddMenuOpen={setIsAddAbilityOpen} setEditTarget={setEditAbilityTarget} />
                    {isAddAbilityOpen &&
                        <NewAbilityWindow adv={adversary} setIsAddMenuOpen={setIsAddAbilityOpen} editTarget={editAbilityTarget} setEditTarget={setEditAbilityTarget} />
                    }

                    <button onClick={() => new ActiveEffectsApp(actor).render({ force: true })} className="ml-2 hover-glow cursor-pointer mb-4" title="Click to open active effects">
                        <ActionMenuHeader label={vgLiteLang.ButtonActions.effects} />
                    </button>
                </div>
            </div>
        </div>
    )
}

const AdversarySheetHeader = ({ adv }) => {
    const { editModeToggleBtn } = useEditMode()
    return (
        <div>
            <div className="flex text-2xl text-text-header-primary font-bold bg-sheet-header-fill font-eskapade pl-2 py-1 items-center gap-x-1">
                <EditableNameField actor={adv.parent} />
                <Divider />
                <div className="flex gap-x-1 ml-auto self-center">
                    {/* THREAT LEVEL DISPLAY */}
                    <span className="flex gap-x-1 text-text-header-primary font-eskapade font-normal text-base mr-1">
                        <p>{vgLiteLang.AdversarySheet.tl}:</p>
                        <EditableTextField
                            boundValue={adv.threatLevelOverride?.toString() ?? adv.threatLevel?.toString() ?? ''}
                            updateProps={{ object: adv.parent, path: ['threatLevelOverride'] }}
                            placeholder={adv.threatLevel?.toString() ?? '1.00'}
                        />
                    </span>
                    {editModeToggleBtn}
                </div>
            </div>
            <TraitSelectors adv={adv} />
        </div>
    )
}

const TraitSelectors = ({ adv }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex gap-x-1 text-text-header-secondary">
            {
                isEditMode ? <div className="flex gap-x-1 px-1 mt-1">
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.Sizes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingSize'] }}
                        value={adv.beingSize}
                    />
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.BeingTypes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingType'] }}
                        value={adv.beingType}
                    />
                    <DropDown
                        options={createDropdownEntries(vgLiteLang.BeingSubtypes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingSubtype'] }}
                        value={adv.beingSubtype}
                    />
                </div>
                    : <CardSubHeader values={[
                        { label: vgLiteLang.Sizes[adv.beingSize], value: "" },
                        { label: vgLiteLang.BeingTypes[adv.beingType], value: "" },
                        { label: vgLiteLang.BeingSubtypes[adv.beingSubtype], value: "" }
                    ]} showRightBorder={false} />
            }
        </div>
    )
}

const StatBlock = ({ adv, isPortraitOpen, setIsPortraitOpen }: {
    adv: AdversaryDataModel, isPortraitOpen: boolean, setIsPortraitOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const { isEditMode } = useEditMode()
    const hp = adv.health.current

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(adv.parent, { health: { current: (hp ?? 0) + (auxClick ? 1 : -1) } })
    }, [adv.health])

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
                {/* EXPAND / COLLAPSE BUTTON */}
                <button
                    onClick={() => setIsPortraitOpen(open => !open)}
                    title={isPortraitOpen ? "Collapse portrait" : "Expand portrait"}
                    className="bg-sheet-header-fill border border-solid border-table-border rounded-r-md -ml-2 -mt-3 -mr-6 px-0.5 py-2 hover-glow cursor-pointer"
                >
                    {isPortraitOpen
                        ? <ChevronRight size={14} className="text-text-header-primary" />
                        : <ChevronLeft size={14} className="text-text-header-primary" />
                    }
                </button>
                {/* HIT DICE */}
                <StatBlockField label={locale.hd} content={
                    <EditableTextField
                        boundValue={adv.hitDice?.toString() ?? '1'}
                        updateProps={{ object: adv.parent, path: ['hitDice'] }}
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
                                    boundValue={adv.health.current?.toString() ?? '1'}
                                    updateProps={{ object: adv.parent, path: ['health', 'current'] }}
                                    hideBorderOnEditMode={true}
                                    placeholder="4"
                                />
                                <p>/{adv.health.max?.toString() ?? '4'}</p>
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
                                    boundValue={adv.armor.rating?.toString() ?? ''}
                                    updateProps={{ object: adv.parent, path: ['armor', 'rating'] }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                    <StatBlockField label={vgLiteLang.AdversarySheet.as} content={
                        <EditableTextField
                            boundValue={adv.armor.as ?? 'Unarmored'}
                            updateProps={{ object: adv.parent, path: ['armor', 'as'] }}
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
                            parent={adv.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={adv.zone}
                        /> : <StatBlockValue value={vgLiteLang.Zones[adv.zone]} />
                    }
                </>} />
                {/* SPEED */}
                <StatBlockField label={locale.speed} content={
                    <div className="flex space-x-1">
                        <div className="flex">
                            <EditableTextField
                                boundValue={adv.movement?.speed?.toString() ?? '30'}
                                updateProps={{ object: adv.parent, path: ['movement', 'speed'] }}
                                placeholder="30"
                            />
                            <StatBlockValue value={"'"} />
                        </div>
                        <div>
                            {isEditMode
                                ? <DropDown
                                    options={createDropdownEntries(vgLiteLang.Movement)}
                                    parent={adv.parent}
                                    updateMechanism={{ updatePath: ['movement', 'type'] }}
                                    value={adv.movement.type}
                                />
                                : <p>{vgLiteLang.Movement[adv.movement.type]}</p>
                            }
                        </div>
                    </div>
                } />
            </StatBlockRow>

            <StatBlockRow>
                {/* MORALE */}
                <div onClick={() => inlineRoll(adv.morale?.toString() ?? '12', locale.morale + " Check")} className="hover-glow cursor-pointer" title="Click to roll morale check">
                    <StatBlockField label={locale.morale} content={
                        <NumericCounterInput
                            value={adv.morale ?? 6}
                            onChange={(value: string) => {
                                adv.parent.update({ 'system.morale': Number(value) })
                            }}
                        />
                    } />
                </div>
                {/* NUMBER APPEARING */}
                <div onClick={() => inlineRoll(adv.numberAppearing?.toString() ?? '1', locale.appearing + " Roll")} className="hover-glow cursor-pointer" title="Click to roll number appearing">
                    <StatBlockField label={locale.appearing} content={
                        <EditableTextField
                            boundValue={adv.numberAppearing?.toString() ?? '1'}
                            updateProps={{ object: adv.parent, path: ['numberAppearing'] }}
                            placeholder="d4"
                        />
                    } />
                </div>
            </StatBlockRow>

            {/* SENSES, IMMUNITIES, & WEAKNESSES */}
            <div className="w-full space-y-2 text-base text-text-header-tertiary font-normal">
                <SelectableTextOptions obj={adv.parent} label={locale.senses} path={['senses']} localeObj={vgLiteLang.Senses} />
                <DamageTypeSelector adv={adv} label={locale.immune} path={['dmgImmunities']} localeObj={vgLiteLang.DamageTypes} />
                <DamageTypeSelector adv={adv} label={locale.weak} path={['dmgWeaknesses']} localeObj={vgLiteLang.DamageTypes} />
                <SelectableTextOptions obj={adv.parent} label={locale.status_immunities} path={['statusImmunities']} localeObj={vgLiteLang.StatusConditions} />
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

const DamageTypeSelector = ({ adv, label, path, localeObj }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any }) => {
    const { isEditMode } = useEditMode()
    const field = getDocumentAtPath(adv.parent, path)
    const damageTypes = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k], isSelected: field.indexOf(k) > -1 }
    ))
    return (<>
        {!isEditMode && field.length === 0
            ? <></>
            : <div className="flex space-x-2 mt-2">
                {isEditMode
                    ? <OptionsSelectionMenu obj={adv.parent} label={label} path={path} options={damageTypes} />
                    : <StatBlockLabel text={label} />
                }
                <DamageTypeIconDisplay dmgTypes={field} />
            </div>
        }
    </>)
}