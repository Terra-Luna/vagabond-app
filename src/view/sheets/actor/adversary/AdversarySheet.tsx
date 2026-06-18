import { useCallback } from "react"
import lang from "../../../../../public/lang/en.json"
import AdversaryDataModel, { calcAdversaryMaxHP } from "../../../../model/actor/AdversaryDataModel"
import { EditableNameField, EditableTextField } from "../../../component/EditableTextField"
import { Portrait } from "../hero/HeroSheet"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { updateDocument } from "../../../../utils/documentUtils"
import { RichTextField } from "../../../component/RichTextField"
import { createDropdownEntries } from "../../../../utils/localeUtils"
import { DropDown } from "../../../component/Dropdown"
import { Shield } from "lucide-react"
import { glowOnHover } from "../../VgLiteSheet"
import { getId } from "../../../../utils/modelUtil"

const locale = lang.VGLITE.AdversarySheet
const statLabelStyle = `text-sm font-paradigm font-regular content-center`
const statValueStyle = `text-xl font-eskapade font-bold content-center ${glowOnHover} cursor-pointer`

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: 280
        },
        window: {
            resizable: false
        }
    }
}

const AdversarySheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<AdversaryDataModel>, sheet: VgLiteActorSheet }) => {
    const adv = actor.system
    return (
        <div className="flex grow">
            <div className="flex flex-col border border-solid border-transparent border-r-table-border">
                <Portrait actor={adv} />
                <div className="flex flex-col grow">
                    <HPArmorHUD adv={adv} />
                </div>
            </div>
            <div className="grow">
                <AdversarySheetHeader adv={adv} />
                <Description adv={adv} />
                <StatBlock adv={adv} />
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
        <div className="text-center space-y-4 border border-solid border-transparent border-t-table-border">
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
                    <p className={`text-text-hp-current text-3xl ${glowOnHover} cursor-pointer`}>
                        <EditableTextField initialValue={adv.health.current?.toString() ?? ''} updateProps={{ actor: adv.parent, propertyPath: ['health', 'current'] }} />
                    </p>
                    <p className="text-text-primary text-5xl font-regular">/</p>
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
            <div className="h-[75px] p-0.5">
                <RichTextField
                    height={75}
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
        <div className="p-1">

            {/* ROW 1: ZONE & SPEED */}
            <div className="flex text-text-primary content-center">
                <p className={statLabelStyle}>{locale.zone}&nbsp;</p>
                <DropDown label=''
                    options={createDropdownEntries(lang.VGLITE.Zones)}
                    parent={adv.parent}
                    updateMechanism={{ updatePath: ['zone'] }}
                    value={adv.zone}
                />

                <p className={statLabelStyle}>{locale.speed}&nbsp;</p>
                <p className={`flex ${statValueStyle}`}>
                    <EditableTextField initialValue={adv.movement?.speed?.toString() ?? '30'} updateProps={{ actor: adv.parent, propertyPath: ['movement', 'speed'] }} />
                    <div className={statLabelStyle}>
                        <DropDown label=''
                            options={createDropdownEntries(lang.VGLITE.Movement)}
                            parent={adv.parent}
                            updateMechanism={{ updatePath: ['movement', 'type'] }}
                            value={adv.movement.type}
                        />
                    </div>
                </p>
            </div>

            {/* MORALE */}
            <div className="flex text-text-primary">
                <p className={statLabelStyle}>{locale.morale}&nbsp;</p>
                <p className={statValueStyle}>
                    <EditableTextField initialValue={adv.morale?.toString() ?? '6'} updateProps={{ actor: adv.parent, propertyPath: ['morale'] }} />
                </p>
            </div>
            
        </div>
    )
}