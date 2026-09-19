import { appLang } from "../../../../../utils/lang"
import { tableBorderRounded } from "../../../../common/border-styles"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { TrashButton } from "../../../../component/TrashButton"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ActionMenuHeader } from "./Actions"

const locale = appLang.NpcSheet

export const Abilities = ({ actor }) => {
    const { isEditMode } = useEditMode()
    const features = actor.items.filter(it => it.type === 'feature').sort((a, b) => a.name.localeCompare(b.name))
    return (
        <div className="m-2 space-y-1">
            {(features.length > 0 || isEditMode) && <ActionMenuHeader label={locale.abilities} />}

            {features.length === 0 && isEditMode &&
                <p className="text-xs font-paradigm font-normal italic">Add abilities by dropping Features onto sheet</p>
            }

            {/* ABILITY (FEATURE) CARDS */}
            {features.map(feature => (
                <FeatureCard key={feature.id} actor={actor} feature={feature} />
            ))}
        </div>
    )
}

const FeatureCard = ({ actor, feature }) => {
    const { isEditMode } = useEditMode()

    const deleteAbility = async (id) => {
        await actor.deleteEmbeddedDocuments("Item", [id])
    }

    return (
        <div className={`flex justify-between items-center gap-2 ${tableBorderRounded} p-2`}>
            <div className="flex flex-col gap-1">
                <p className={`font-paradigm font-bold hover-glow`}>{feature.name}</p>
                <EnrichedContent content={feature.system.description} styleClasses="text-xs font-paradigm font-normal" actor={feature.parent} />
            </div>
            {isEditMode && <TrashButton onClick={() => deleteAbility(feature.id)} />}
        </div>
    )
}