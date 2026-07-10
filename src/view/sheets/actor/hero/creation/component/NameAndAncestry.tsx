import { useCallback, useState } from "react"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { Header } from "../../../../../component/Header"
import { HeroCreationLabel } from "./HeroCreationTypography"
import { HeroCreationDropdown } from "./HeroCreationDropdown"
import { CombinedItems } from "../../../../../../utils/modelUtil"

export const NameAndAncestry = async ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const strings = vgLiteLang.HeroCreation

    const ancestries = (await CombinedItems('ancestry')).map(it => ({ value: it._id, label: it.name } ))
    const [ancestry, setAncestry] = useState<string>()

    const onSelectAncestry = useCallback((selection: string) => {
        setAncestry(selection)
    }, [ancestry])

    return (
        <div className="bg-sheet-main-fill space-y-4">
            <Header title={strings.identity} />
            <HeroCreationLabel text={strings.heroName} />
            <EditableTextField boundValue={hero.name} updateProps={{ object: hero, path: ['name'] }} />
            <div className="flex ga-x-2">
                <HeroCreationDropdown
                    label={strings.selectAncestry}
                    value={ancestries.find(it => it.value === ancestry)?.label ?? ''}
                    options={ancestries}
                    onChange={onSelectAncestry}
                />
                <p></p>
            </div>
        </div>
    )
}