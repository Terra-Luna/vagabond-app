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
import { Cross, Plus, Shield, SquarePen } from "lucide-react"
import { glowOnHover } from "../../VgLiteSheet"
import { DamageTypeIcon } from "../../../component/DamageTypeIcon"
import { Menu, MenuItem } from '@szhsin/react-menu'
import { DamageTypeIconDisplay, OptionsSelectionMenu, StringOptionsDisplay } from "../../../component/OptionsSelectionMenu"
import { Button } from "../../../component/Button"

const locale = lang.VGLITE.AdversarySheet
const statLabelStyle = `text-sm text-text-primary font-paradigm font-normal content-center`
const statValueStyle = `text-xl text-stat-block-fill font-eskapade font-bold content-center ${glowOnHover} cursor-pointer`

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 480
        },
        window: {
            resizable: true
        }
    }
}

const AdversarySheetReactComponent = ({ actor }: { actor: FoundryActor<AdversaryDataModel> }) => {
    const adv = actor.system
    return (
        <div className="@container flex grow overflow-y-hidden">
            <div className="flex flex-col border border-solid border-transparent border-r-table-border">
                <Portrait actor={adv} />
                <div className="flex flex-col grow p-2">
                    <HPArmorHUD adv={adv} />
                </div>
            </div>
            <div className="flex flex-col grow">
                <AdversarySheetHeader adv={adv} />
                <div className="overflow-y-auto">
                    <Description adv={adv} />
                    <StatBlock adv={adv} />
                    <Actions adv={adv} />
                    <Abilities adv={adv} />
                </div>
            </div>
        </div>
    )
}

const HPArmorHUD = ({ adv }: { adv: AdversaryDataModel }) => {
    const headerStyle = "text-xs font-paradigm"
    const hp = adv.health.current

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(adv.parent, { health: { current: (hp??0) + (auxClick ? 1 : -1) }})
    }, [hp])

    return (
        <div className="text-center space-y-4">
            {/* HIT DICE */}
            <div className="text-text-primary justify-center content-center w-full ml-auto mr-auto mt-4">
                <p className={headerStyle}>{locale.hd}</p>
                <p className={`text-3xl font-eskapade font-bold ${glowOnHover} cursor-pointer`}>
                    <EditableTextField
                        initialValue={adv.hitDice?.toString() ?? '1'}
                        updateProps={{ actor: adv.parent, propertyPath: ['hitDice'] }}
                    />
                </p>
            </div>
            
            {/* HP CURRENT / MAX */}
            <div className="text-text-primary w-full">
                <p className={`${headerStyle} ${glowOnHover} cursor-pointer`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                    {locale.hp}
                </p>
                <div className="flex font-eskapade font-bold w-full justify-center">
                    <p className={`text-text-hp-current text-3xl min-w-[3ch] ${glowOnHover} cursor-pointer`}>
                        <EditableTextField initialValue={adv.health.current?.toString() ?? ''} updateProps={{ actor: adv.parent, propertyPath: ['health', 'current'] }} />
                    </p>
                    <p className="text-text-primary text-5xl font-normal">/</p>
                    <p className={`text-text-hp-max text-xl mt-3 ${glowOnHover} cursor-pointer`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
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
                        <div className={`text-4xl text-text-armor font-eskapade font-bold ${glowOnHover} cursor-pointer`}>
                            <EditableTextField initialValue={adv.armor.rating?.toString() ?? ''} updateProps={{ actor: adv.parent, propertyPath: ['armor', 'rating']}} />
                        </div>
                    </div>
                    <p className={`absolute bottom-0 -right-1.5 ${statLabelStyle}`}>{locale.as}</p>
                </div>
            </div>
            <div className="flex w-full justify-center -mt-4">
                <p className={`content-center ${glowOnHover} cursor-pointer`}>
                    <EditableTextField initialValue={adv.armor.as ?? 'Unarmored'} updateProps={{ actor: adv.parent, propertyPath: ['armor', 'as'] }} />
                </p>
            </div>
        </div>
    )
}

const AdversarySheetHeader = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="bg-sheet-header-fill font-eskapade p-2">
            <div className="text-2xl text-text-header-primary font-bold flex">
                <EditableNameField actor={adv.parent} />
                <div className="flex ml-auto">
                    <span className="text-lg">{`${locale.tl} ${adv.threatLevel}`}</span>
                </div>
            </div>
            <TraitSelectors adv={adv} />
        </div>
    )
}

const TraitSelectors = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="flex gap-2 text-text-header-secondary mt-1">
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
        </div>
    )
}

const Description = ({ adv }: { adv: AdversaryDataModel }) => {
    const onDescriptionChange = useCallback((descr) => {
        updateDocument(adv.parent, { 'description': descr })
    }, [adv])
    return (
        <div className="pb-1 border border-dotted border-transparent border-b-table-border">
            <div className="h-[54px] p-0.5">
                <RichTextField
                    height={54}
                    defaultValue={adv.description}
                    onChange={onDescriptionChange}
                    className="bg-transparent"
                />
            </div>
        </div>
    )
}

const StatBlock = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="p-1 mx-2">
            <div className="grid grid-flow-row auto-rows-max grid-cols-2 gap-y-2 text-text-primary">
                
                {/* ZONE */}
                <div className="flex items-center">
                    <p className={statLabelStyle}>{locale.zone}&nbsp;</p>
                    <div className="text-stat-block-fill">
                        <DropDown label=''
                            options={createDropdownEntries(lang.VGLITE.Zones)}
                            parent={adv.parent}
                            updateMechanism={{ updatePath: ['zone'] }}
                            value={adv.zone}
                        />
                    </div>
                </div>

                {/* SPEED */}
                <div className="flex items-center justify-end">
                    <p className={statLabelStyle}>{locale.speed}&nbsp;</p>
                    <div className="flex space-x-1">
                        <p className={`flex space-x-1 ${statValueStyle}`}>
                            <EditableTextField
                                initialValue={adv.movement?.speed?.toString() ?? '30'}
                                updateProps={{ actor: adv.parent, propertyPath: ['movement', 'speed'] }}
                            />
                        </p>
                        <div className="text-stat-block-fill">
                            <DropDown label=''
                                options={createDropdownEntries(lang.VGLITE.Movement)}
                                parent={adv.parent}
                                updateMechanism={{ updatePath: ['movement', 'type'] }}
                                value={adv.movement.type}
                            />
                        </div>
                    </div>
                </div>

                {/* MORALE */}
                <div className="flex items-center">
                    <p className={statLabelStyle}>{locale.morale}&nbsp;</p>
                    <p className={statValueStyle}>
                        <EditableTextField
                            initialValue={adv.morale?.toString() ?? '6'}
                            updateProps={{ actor: adv.parent, propertyPath: ['morale'] }}
                        />
                    </p>
                </div>

                {/* NUBMER APPEARING */}
                <div className="flex items-center justify-end">
                    <p className={statLabelStyle}>{locale.appearing}&nbsp;</p>
                    <p className={statValueStyle}>
                        <EditableTextField
                            initialValue={adv.numberAppearing?.toString() ?? '1'}
                            updateProps={{ actor: adv.parent, propertyPath: ['numberAppearing'] }}
                        />
                    </p>
                </div>

                <DamageTypeSelector adv={adv} label={locale.weak} path={['dmgWeaknesses']} localeObj={lang.VGLITE.DamageTypes} />
                <SelectableTextField adv={adv} label={locale.senses} path={['senses']} localeObj={lang.VGLITE.Senses} />
                <DamageTypeSelector adv={adv} label={locale.immune} path={['dmgImmunities']} localeObj={lang.VGLITE.DamageTypes} />
                <SelectableTextField adv={adv} label={locale.status_immunities} path={['statusImmunities']} localeObj={lang.VGLITE.StatusConditions} />

            </div>
        </div>
    )
}

const DamageTypeSelector = ({ adv, label, path, localeObj }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any }) => {
    const field = getDocumentAtPath(adv.parent, path)
    const damageTypes = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k], isSelected: field.indexOf(k) > -1 }
    ))
    return (
        <div className="space-y-1">
            <OptionsSelectionMenu actor={adv.parent} label={label} path={path} options={damageTypes} />
            <DamageTypeIconDisplay dmgTypes={getDocumentAtPath(adv.parent, path)} />
        </div>
    )
}

const SelectableTextField = ({ adv, label, path, localeObj }: { adv: AdversaryDataModel, label: string, path: string[], localeObj: any}) => {
    const field = getDocumentAtPath(adv.parent, path)
    const options = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k].name, isSelected: field.indexOf(k) > -1 }
    ))
    return (
        <div className="ml-auto justify-items-end text-right space-y-1">
            <OptionsSelectionMenu actor={adv.parent} label={label} path={path} options={options} />
            <StringOptionsDisplay options={options.filter(o => o.isSelected).map(o => o.value)} />
        </div>
    )
}

const Actions = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="ml-2 mt-2">
            {/* HEADER W/ ADD BUTTON */}
            <div className="flex items-center gap-x-2">
                <p className="font-eskapade font-bold text-text-primary text-xl">{locale.actions}</p>
                <Plus
                    size={16}
                    className={`text-stat-block-fill ${glowOnHover}`}
                    onClick={() => {
                        updateDocumentAtPath(adv.parent, ['actions'], [...adv.actions, { name: 'New action' }])
                    }}
                />
            </div>
            {/* DISPLAY COMBO FIRST */}
            <div>
                { adv.combo.name !== '' ? <p className="font-paradigm font-bold">{adv.combo.name}</p> : <></> }
            </div>
            {/* DISPLAY ALL ACTIONS */}
            <div>
                {
                    adv.actions.map(act => (
                        <div key={act.name} className="flex flex-wrap">
                            <p className="font-bold">{act.name}&nbsp;</p>
                            <p className="">{act.effect}&nbsp;</p>
                            <p className="text-stat-block-fill font-eskapade font-bold">{act.damage.roll}&nbsp;</p>
                            <p className="">|&nbsp;{act.damage.avg}&nbsp;</p>
                            <p className="">{act.recharge}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

const Abilities = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="ml-2 mt-2">
            <div className="flex items-center gap-x-2">
                <p className="font-eskapade font-bold text-text-primary text-xl">{locale.abilities}</p>
                <Plus
                    size={16}
                    className={`text-stat-block-fill ${glowOnHover}`}
                    onClick={() => {
                        updateDocumentAtPath(adv.parent, ['abilities'], [...adv.abilities, { name: 'New ability', description: 'New ability description...'}])
                    }}
                />
            </div>
            <div>
                {
                    adv.abilities.map(ab => (
                        <div key={ab.name}>
                            <p>{ab.name}</p>
                            <p>{ab.description}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}