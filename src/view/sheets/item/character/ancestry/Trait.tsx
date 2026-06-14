import lang from "../../../../../../public/lang/en.json"
import { Collapsible } from "../../../../component/Collapsible"
import { Trait as TraitModel, Grant, Modifier } from "../../../../../model/item/character/traitsAndFeatures"
import { CardHeader } from "../../../../component/CardHeader"
import { LabelledField } from "../../../../component/LabelledField"
import { EditableTextField } from "../../../../component/EditableTextField"
import { RichTextField } from "../../../../component/RichTextField"
import { DropDown } from "../../../../component/Dropdown"
import AncestryDataModel from "../../../../../model/item/character/AncestryDataModel"
import { updateDocument } from "../../../../../utils/documentUtils"
import { useCallback } from "react"

const locale = lang.VGLITE.AncestrySheet
interface TypedTrait { name: string; description: string }

const addNewBlankModifier = (ancestry: AncestryDataModel, traitIdx) => {
    updateDocument(ancestry.parent, { traits: [{ name: lang.VGLITE.AncestrySheet.newTrait }] })
}

export const Trait = ({ trait, startExpanded = false, ancestry, index }: { trait: TraitModel, startExpanded?: boolean, ancestry: AncestryDataModel, index: number }) => {
    const typedTrait = trait as unknown as TypedTrait
    const { name } = typedTrait

    const onUpdateName = useCallback((newName) => {
        return ancestry.updateTraitValue("name", newName, index)
    }, [ancestry, index])

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
                                <EditableTextField initialValue={name} onSave={onUpdateName} />
                            </div>
                        </LabelledField>
                    </div>

                    <div>
                        <LabelledField label={lang.VGLITE.AncestrySheet.description}>
                            <RichTextField defaultValue={trait.description} onChange={() => { }} />
                        </LabelledField>
                    </div>

                    <div>
                        {trait.modifiers?.map((mod, modIdx) => (
                            <Modifier key={'mod' + modIdx}
                                ancestry={ancestry}
                                modifier={mod}
                                startExpanded={false}
                                index={modIdx}
                                traitIndex={index}
                            />)
                        )}
                    </div>
                </div>
            )} />
    )
}

interface ModifierProps {
    modifier: Modifier,
    startExpanded?: boolean,
    ancestry: AncestryDataModel,
    index: number,
    traitIndex: number
}

const Modifier = ({ modifier, startExpanded = false, ancestry, index, traitIndex }: ModifierProps) => {
    return <>
        <DropDown label={lang.VGLITE.ItemSheet.size}
            options={Object.values(lang.VGLITE.Sizes)}
            parent={ancestry.parent}
            updatePath={['ancestry', 'traits', traitIndex.toString(), 'modifiers', index.toString(), 'targetStat']}
            value={modifier.targetStat} />
    </>
}