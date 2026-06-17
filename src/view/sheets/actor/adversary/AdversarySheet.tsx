import lang from "../../../../../public/lang/en.json"
import AdversaryDataModel from "../../../../model/actor/AdversaryDataModel"
import { localizeString } from "../../../../utils/localeUtils"
import { EditableNameField } from "../../../component/EditableTextField"
import { Divider } from "../../../component/Header"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"

const locale = lang.VGLITE.AdversarySheet
const cardHeaderLayout = "flex items-center pt-2 pb-1 pl-2 pr-2 bg-section-header-fill"
const cardHeaderStyle = "text-text-section-header text-2xl font-eskapade font-bold"
const cardSubheaderLayout = "flex items-center border-r-1 border-solid border-table-border"
const cardSubheaderStyle = "flex text-text-section-header text-sm pb-1 pl-2 pr-8 bg-section-header-fill [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]"

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: 360
        },
        window: {
            resizable: false
        }
    }
}

const AdversarySheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<AdversaryDataModel>, sheet: VgLiteActorSheet }) => {
    const adv = actor.system
    return (<>
        <div className={`${cardHeaderLayout} ${cardHeaderStyle}`}>
            <EditableNameField actor={actor} />
            <Divider />
            <p className="text-sm">
                {localizeString(locale.tl, { tl: adv.threatLevel?.toString() ?? '' })}
            </p>
        </div>
        <div className={cardSubheaderLayout}>
            <div className={cardSubheaderStyle}>
                {`${lang.VGLITE.Sizes[adv.beingSize]} • ${lang.VGLITE.BeingTypes[adv.beingType]}`}
            </div>
        </div>
        <AdversaryCardBody adv={adv}  />
    </>)
}

const AdversaryCardBody = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="mx-2">
            <Description adv={adv} />
            <Stats adv={adv} />
            <Actions adv={adv} />
            <Abilities adv={adv} />
        </div>
    )
}

const Description = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="border-2 border-dotted border-transparent border-b-section-header-fill py-1 italic">
            {adv.description + "A relentless hunter of living air, capable of directly locating any scent that lingers in the winds."}
        </div>
    )
}

const Stats = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="flex-col">
            {localizeString(locale.hd, { hd: adv.hitDice?.toString() ?? '1' })}
            {localizeString(locale.zone, { zone: adv.zone?.toString() ?? '' })}
            {localizeString(locale.senses, { senses: adv.senses.toString() ?? '' })}
            {localizeString(locale.armor, { rating: adv.armor.rating?.toString() ?? '', type: adv.armor.as?.toString() ?? 'Unarmored' })}
            {localizeString(locale.immune, { immunities: '' })}
            {localizeString(locale.weak, { weaknesses: '' })}
            {localizeString(locale.status_immunities, { immunities: '' })}

            {localizeString(locale.speed, { spd: adv.movement?.toString() ?? '30' })}
            {localizeString(locale.appearing, { num: adv.numberAppearing?.toString() ?? '1' })}
            {localizeString(locale.morale, { morale: adv.morale?.toString() ?? '0' })}

        </div>
    )
}

const Actions = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div>
            <span className="text-lg font-eskapade font-bold">
                Actions
                <Divider />
            </span>
        </div>
    )
}

const Abilities = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div>
            <span className="text-lg font-eskapade font-bold">
                Abilities
                <Divider />
            </span>
        </div>
    )
}