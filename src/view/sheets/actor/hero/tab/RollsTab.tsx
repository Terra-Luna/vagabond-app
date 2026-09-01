import { useMemo } from "react"

import { RollPresetsListView } from "../../../../../apps/attack-builder/component/RollPresetsListView"
import { RollPreset } from "../../../../../apps/attack-builder/model/RollPreset"
import { RollBuilderView } from "../../../../../apps/attack-builder/RollBuilderView"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { sys_id } from "../../../../../utils/foundryUtils"
import { CollapsibleSection } from "../../../../component/Collapsible"

export const RollsTab = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const customAttack = useMemo(() => {
        return actor.getFlag(sys_id, "customRoll") as RollPreset | undefined
    }, [actor])

    return (
        <div>
            <RollPresetsListView actor={actor} />
            <div className="mt-1" />
            <CollapsibleSection title={"QUICK ROLL"} startCollapsed={false} content={
                <RollBuilderView actor={actor} preset={customAttack} showHeader={false} />
            } />
            <div className="mt-8" />
        </div>
    )
}