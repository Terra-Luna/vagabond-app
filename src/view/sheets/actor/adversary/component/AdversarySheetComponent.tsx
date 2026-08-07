import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { getDocumentAtPath } from "../../../../../utils/documentUtils"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { EditableNameField, EditableTextField } from "../../../../component/EditableTextField"
import { OptionsSelectionMenu, DamageTypeIconDisplay } from "../../../../component/OptionsSelectionMenu"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { Description } from "../../../shared/Description"
import { SelectableTextOptions } from "../../../shared/SelectableTextOptions"
import { Portrait } from "../../component/ActorPortrait"
import { Abilities, NewAbilityWindow } from "./Ability"
import { Actions, NewActionWindow } from "./Action"
import { useAddAbilityMenu, useAddActionMenu } from "./hooksAndUtils"
import { HPArmorHUD } from "./HPArmorHUD"
import { lang  } from "../../../../../utils/lang"

const locale = lang.VGLITE.AdversarySheet

const statLabelStyle = `text-sm text-text-header-tertiary font-eskapade font-bold`
const statValueStyle = `text-lg text-text-primary font-eskapade font-normal`

export const AdversarySheetReactComponent = ({ actor }: { actor: Actor & { system: AdversaryDataModel } }) => {
    const adversary = actor.system
    const { isAddActionOpen, setIsAddActionOpen, editActionTarget, setEditActionTarget } = useAddActionMenu()
    const { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget } = useAddAbilityMenu()
    return (
        <div className="@container flex grow overflow-y-hidden">
            <div className="flex flex-col border border-solid border-transparent border-r-table-border">
                <Portrait actor={adversary} />
                <div className="flex flex-col grow p-2">
                    <HPArmorHUD adv={adversary} />
                </div>
            </div>
            <div className="flex flex-col grow">
                <AdversarySheetHeader adv={adversary} />
                <div className="overflow-y-auto">
                    <Description item={adversary.parent} />
                    <StatBlock adv={adversary} />
                    <Actions adversary={adversary} setIsAddMenuOpen={setIsAddActionOpen} setEditTarget={setEditActionTarget} />
                    {isAddActionOpen ?
                        <NewActionWindow adv={adversary} setIsAddMenuOpen={setIsAddActionOpen} editTarget={editActionTarget} setEditTarget={setEditActionTarget} /> : undefined
                    }
                    <Abilities adv={adversary} setIsAddMenuOpen={setIsAddAbilityOpen} setEditTarget={setEditAbilityTarget} />
                    {isAddAbilityOpen ?
                        <NewAbilityWindow adv={adversary} setIsAddMenuOpen={setIsAddAbilityOpen} editTarget={editAbilityTarget} setEditTarget={setEditAbilityTarget} /> : undefined
                    }
                </div>
            </div>
        </div>
    )
}

const AdversarySheetHeader = ({ adv }) => {
    const { editModeToggleBtn } = useEditMode()
    return (
        <div className="bg-sheet-header-fill font-eskapade p-2">
            <div className="text-2xl text-text-header-primary font-bold flex">
                <EditableNameField actor={adv.parent} />
                <div className="flex ml-auto mt-2">
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
        <div className="flex gap-2 text-text-header-secondary mt-1">
            {
                isEditMode ? <>
                    <DropDown
                        options={createDropdownEntries(lang.VGLITE.Sizes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingSize'] }}
                        value={adv.beingSize}
                    />
                    <DropDown
                        options={createDropdownEntries(lang.VGLITE.BeingTypes)}
                        parent={adv.parent}
                        updateMechanism={{ updatePath: ['beingType'] }}
                        value={adv.beingType}
                    />
                    <DropDown
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

const StatBlock = ({ adv }: { adv: AdversaryDataModel }) => {
    const { isEditMode } = useEditMode()
    return (<>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-2 w-full px-2 mt-1 mb-4">
            {/* ZONE */}
            <StatBlockField label={locale.zone} content={<>
                {
                    isEditMode ?
                        <DropDown
                            options={createDropdownEntries(lang.VGLITE.Zones)}
                            parent={adv.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={adv.zone}
                        /> : <p className={statValueStyle}>{lang.VGLITE.Zones[adv.zone]}</p>
                }
            </>} />
            {/* SPEED */}
            <StatBlockField label={locale.speed} content={
                <div className="flex space-x-1">
                    <div className={`flex space-x-1 ${statValueStyle}`}>
                        <EditableTextField
                            boundValue={adv.movement?.speed?.toString() ?? '30'}
                            updateProps={{ object: adv.parent, path: ['movement', 'speed'] }}
                            placeholder="30"
                        />
                    </div>
                    <div>
                        {
                            isEditMode ?
                                <DropDown
                                    options={createDropdownEntries(lang.VGLITE.Movement)}
                                    parent={adv.parent}
                                    updateMechanism={{ updatePath: ['movement', 'type'] }}
                                    value={adv.movement.type}
                                /> : <p>{lang.VGLITE.Movement[adv.movement.type]}</p>
                        }
                    </div>
                </div>
            } />
            {/* MORALE */}
            <StatBlockField label={locale.morale} content={
                <EditableTextField
                    boundValue={adv.morale?.toString() ?? '6'}
                    updateProps={{ object: adv.parent, path: ['morale'] }}
                    placeholder="6"
                />
            } />
            {/* NUBMER APPEARING */}
            <StatBlockField label={locale.appearing} content={
                <EditableTextField
                    boundValue={adv.numberAppearing?.toString() ?? '1'}
                    updateProps={{ object: adv.parent, path: ['numberAppearing'] }}
                    placeholder="1d6"
                />
            } />
            {/* SENSENS & STATUS IMMUNITIES */}
            <div className="w-full space-y-4">
                <SelectableTextOptions obj={adv.parent} label={locale.senses} path={['senses']} localeObj={lang.VGLITE.Senses} />
                <SelectableTextOptions obj={adv.parent} label={locale.status_immunities} path={['statusImmunities']} localeObj={lang.VGLITE.StatusConditions} />
            </div>
            {/* WEAKNESS & IMMUNITY */}
            <div className="w-full space-y-4">
                <DamageTypeSelector adv={adv} label={locale.immune} path={['dmgImmunities']} localeObj={lang.VGLITE.DamageTypes} />
                <DamageTypeSelector adv={adv} label={locale.weak} path={['dmgWeaknesses']} localeObj={lang.VGLITE.DamageTypes} />
            </div>
        </div>
    </>)
}

const StatBlockField = ({ label, content }) => {
    return (
        <div className="flex space-x-2 items-center">
            <p className={statLabelStyle}>{label}</p>
            <div className={statValueStyle}>{content}</div>
        </div>
    )
}

const DamageTypeSelector = ({ adv, label, path, localeObj }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any }) => {
    const { isEditMode } = useEditMode()
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
                            <OptionsSelectionMenu obj={adv.parent} label={label} path={path} options={damageTypes} /> :
                            <p className={statLabelStyle}>{label}:</p>
                    }
                    <DamageTypeIconDisplay dmgTypes={field} />
                </div>
        }
    </>)
}