import { VgLiteItemSheet } from "../VgLiteItemSheet"
import SpellDataModel from "../../../../model/item/character/SpellDataModel"

export class SpellSheet extends VgLiteItemSheet {
    Component = SpellReactComponent
}

const SpellReactComponent = ({ item }: { item: Item & { system: SpellDataModel } }) => {
    return (
        <div>

        </div>
    )
}