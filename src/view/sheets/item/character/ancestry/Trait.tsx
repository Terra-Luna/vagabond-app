import { Header } from "../../../../component/Header"
import lang from "../../../../../../public/lang/en.json"
import { Collapsible } from "../../../../component/Collapsible"
import { traitSchema } from "../../../../../model/item/character/traitsAndFeatures"
import { CardHeader } from "../../../../component/CardHeader"
import { LabelledField } from "../../../../component/LabelledField"
import { EditableTextField } from "../../../../component/EditableTextField"
import { RichTextField } from "../../../../component/RichTextField"

const locale = lang.VGLITE.AncestrySheet
type Trait = ReturnType<typeof traitSchema>
interface TypedTrait { name: string; description: string }

export const Trait = ({ trait, startExpanded = false }: { trait: TypedTrait, startExpanded?: boolean }) => {
    const typedTrait = trait as unknown as TypedTrait
    let { name } = typedTrait
    name = name || locale.newTrait
    return (
        <Collapsible
            className="bg-sheet-header-fill text-text-header-primary"
            title={name}
            startCollapsed={!startExpanded}
            Header={CardHeader}
            content={(
                <div className="mx-2 flex flex-col gap-4">
                    <div>
                        <LabelledField className="font-paradigm" label={locale.name}>
                            <div className="font-eskapade text-2xl">
                                <EditableTextField initialValue={name} onSave={() => Promise.resolve(true)} />
                            </div>
                        </LabelledField>
                    </div>

                    <div>
                        <LabelledField label={lang.VGLITE.AncestrySheet.description}>
                            <RichTextField defaultValue={trait.description} onChange={() => { }} />
                        </LabelledField>
                    </div>

                </div>
            )} />
    )
}

const Modifier = ({modifier, startExpanded = false}) => {

}