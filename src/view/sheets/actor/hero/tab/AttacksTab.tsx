import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { AttackPresetsListView } from "../../../../../apps/attack-builder/component/AttackPresetsListView"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    return (
        <AttackPresetsListView actor={actor} />
    )
}