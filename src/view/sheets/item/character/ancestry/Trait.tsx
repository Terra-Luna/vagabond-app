import { Header } from "../../../../component/Header"
import lang from "../../../../../../public/lang/en.json"
import { Collapsible } from "../../../../component/Collapsible"
import { traitSchema } from "../../../../../model/item/character/traitsAndFeatures"
import { CardHeader } from "../../../../component/CardHeader"
import { LabelledField } from "../../../../component/LabelledField"
import { EditableTextField } from "../../../../component/EditableTextField"

const locale = lang.VGLITE.AncestrySheet
type Trait = ReturnType<typeof traitSchema>
interface TypedTrait { name: string; description: string }

export const Trait = ({ trait, startExpanded = false }: { trait: Trait, startExpanded?: boolean }) => {
    const typedTrait = trait as unknown as TypedTrait
    return (
        <Collapsible
            title={trait.name}
            startCollapsed={!startExpanded}
            Header={CardHeader}
            content={(
                <>
                    <LabelledField className="font-paradigm" label={locale.name}>
                        <div className="font-eskapade text-2xl">
                            <EditableTextField initialValue={typedTrait.name} onSave={() => Promise.resolve(true)} />
                        </div>
                    </LabelledField>
                </>
            )} />
    )
}