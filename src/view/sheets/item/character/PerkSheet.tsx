import PerkDataModel from "../../../../model/item/character/PerkDataModel"
import { VgLiteItemSheet } from "../VgLiteItemSheet"

export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ perk }: { perk: Item & { system: PerkDataModel } }) => {
    return (
        <div>

        </div>
    )
}