import { VgLiteItemSheet } from "../VgLiteItemSheet"
import ClassDataModel from "../../../../model/item/character/ClassDataModel"

export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <div>

        </div>
    )
}