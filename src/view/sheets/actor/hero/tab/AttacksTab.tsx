import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { AttackPresetsListView } from "../../../../../apps/attack-builder/component/AttackPresetsListView"
import { AttackBuilderView } from "../../../../../apps/attack-builder/AttackBuilderView"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    return (
        <div>
            <AttackPresetsListView actor={actor} />
            <div className="mt-1" />
            <AttackBuilderView actor={actor} />
        </div>
    )
}