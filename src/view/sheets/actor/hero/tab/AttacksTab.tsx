import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { AttackPresetsListView } from "../../../../../apps/attack-builder/component/AttackPresetsListView"
import { AttackBuilderView } from "../../../../../apps/attack-builder/AttackBuilderView"
import { CollapsibleSection } from "../../../../component/Collapsible"
import { useMemo } from "react"
import { AttackPreset } from "../../../../../apps/attack-builder/AttackBuilderApp"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const quickAttack = useMemo(() => {
        return actor.getFlag("vagabond-lite" as any, "customAttack") as AttackPreset | undefined
    }, [actor])

    return (
        <div>
            <AttackPresetsListView actor={actor} />
            <div className="mt-1" />
            <CollapsibleSection title={"CUSTOM ATTACK"} startCollapsed={false} content={
                <AttackBuilderView actor={actor} preset={quickAttack} showHeader={false} />
            } />
            <div className="mt-8" />
        </div>
    )
}