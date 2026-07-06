import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { OptionsSelectionMenu, OptionsSelectionMenuOption } from "../../../../../component/OptionsSelectionMenu"

export const ClassSheetSelectionMenu = ({ item, path, options }: {
    item: Item & { system: ClassDataModel }, path: string[], options: OptionsSelectionMenuOption[]
}) => {
    return (
        <div className="mt-1 -ml-1 mr-1">
            <OptionsSelectionMenu obj={item} path={path} options={options} />
        </div>
    )
}