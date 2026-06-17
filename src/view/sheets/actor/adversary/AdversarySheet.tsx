    import { useCallback } from "react"
import lang from "../../../../../public/lang/en.json"
import AdversaryDataModel from "../../../../model/actor/AdversaryDataModel"
import { EditableNameField, EditableTextField } from "../../../component/EditableTextField"
import { Divider } from "../../../component/Header"
import { Portrait } from "../hero/HeroSheet"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { updateDocument } from "../../../../utils/documentUtils"

const locale = lang.VGLITE.AdversarySheet

export default class AdversarySheet extends VgLiteActorSheet {
    Component = AdversarySheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 300
        },
        window: {
            resizable: false
        }
    }
}

const AdversarySheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<AdversaryDataModel>, sheet: VgLiteActorSheet }) => {
    const adv = actor.system
    return (
        <div className="@container flex flex-col grow">
            <AdversarySheetHeader adv={adv} />
            <Description adv={adv} />
            <StatBlock adv={adv} />
        </div>
    )
}

const AdversarySheetHeader = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="flex">
            <Portrait actor={adv} />
            <div className="bg-sheet-header-fill font-eskapade grow ml-[123px]">
                <div className="text-text-header-primary text-2xl font-bold mt-1 ml-2 flex">
                    <EditableNameField actor={adv.parent} />
                    <div className="flex ml-auto mr-2 mt-1 text-md">
                        <span>{locale.hd}&nbsp;</span>
                        <EditableTextField
                            initialValue={adv.hitDice?.toString() ?? '1'}
                            updateProps={{ actor: adv.parent, propertyPath: ['hitDice'] }}
                        />
                    </div>
                </div>
                <div className="flex text-text-header-secondary ml-2 pb-1">
                    <span>{`${lang.VGLITE.Sizes[adv.beingSize]} • ${lang.VGLITE.BeingTypes[adv.beingType]}`}</span>
                    <div className="ml-auto mr-2">
                        <span className="font-eskapade font-bold text-md">{`${locale.tl} ${adv.threatLevel}`}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Description = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div className="ml-[123px] py-1 italic border-2 border-dotted border-transparent border-b-section-header-fill">
            {adv.description + "A relentless hunter of living air, capable of directly locating any scent that lingers in the winds."}
        </div>
    )
}

const StatBlock = ({ adv }: { adv: AdversaryDataModel }) => {
    return (
        <div>

        </div>
    )
}