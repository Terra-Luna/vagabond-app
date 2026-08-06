import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { AttackPresetsListView } from "../../../../../apps/attack-builder/component/AttackPresetsListView"
import { AttackBuilderView } from "../../../../../apps/attack-builder/AttackBuilderView"
import { CollapsibleSection } from "../../../../component/Collapsible"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    return (
        <div>
            <AttackPresetsListView actor={actor} />
            <div className="mt-1" />
            <CollapsibleSection title={"QUICK ATTACK"} startCollapsed={false} content={
                <AttackBuilderView actor={actor} showHeader={false} />
            } />
        </div>
    )
}