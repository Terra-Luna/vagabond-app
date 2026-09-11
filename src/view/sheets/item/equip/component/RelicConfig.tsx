import { Diamond } from "lucide-react"
import { useMemo } from "react"

import { RelicPowerProcessor } from "../../../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { RelicPower, RelicPowers } from "../../../../../apps/vagabond-tools/relic/RelicPowers"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { appLang } from "../../../../../utils/lang"
import { tableBorderRounded } from "../../../../common/border-styles"
import { buttonAnimation } from "../../../../component/Button"
import { CollapsibleSection } from "../../../../component/Collapsible"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"

export const RelicConfig = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    
    const { isEditMode } = useEditMode()
    const relics = useMemo(() => RelicPowers.get(item.type), [])
    
    const categories = useMemo(() => [
        ...Object.values(
            relics.reduce((cats, r) => {
                cats[r.category.value] = { value: r.category.value, label: r.category.label }
                return cats
            }, {})
        )
    ], [relics]) as { value: string, label: string }[]

    const filteredRelics = (category: string): RelicPower[] => {
        return relics.filter(r => r.category.value === category)
    }

    return (<>
        {isEditMode && <div className="flex flex-col gap-y-1 items-stretch w-full mb-8">
            <CollapsibleSection title={appLang.ButtonActions.relic} content={
                <div className="flex flex-col gap-1 w-full">

                    {/* ACTIVE POWERS */}
                    <div className="flex flex-wrap gap-1 mt-0.5 w-full">
                        {item.system.relicPowers?.map(relic => (
                            <RelicCard key={relic.id} item={item} relic={relic} />
                        ))}
                    </div>

                    {/* LIST OF RELIC POWERS */}
                    {categories.map((cat, index) => (
                        <div key={index} className="flex flex-col gap-y-2 w-full">

                            {/* RELICS LISTED BY CATEGORY */}
                            <CollapsibleSection title={cat.label} useClearHeader={true} startCollapsed={true} content={
                                <div className="flex flex-wrap gap-1 justify-center w-full mt-1 text-lg text-text-primary font-eskapade font-normal">
                                    {/* TOGGLEABLE RELIC INFO CARD */}
                                    {filteredRelics(cat.value).map(relic => (
                                        <RelicCard key={relic.id} item={item} relic={relic} />
                                    ))}
                                </div>
                            } />
                        </div>
                    ))}
                </div>
            } />
        </div>}
    </>)
}

const RelicCard = ({ item, relic }) => {
    return (
        <button
            key={relic.id}
            title={`${relic.description}${relic.bound ? `\n(Bound)` : ""}`}
            className={buttonAnimation}
            onClick={async () => await RelicPowerProcessor.toggleRelicEffect(item, relic)}
        >
            <div className={`
                flex flex-col justify-center text-center p-1 ${tableBorderRounded} hover-glow
                ${item.system.relicPowers.some(p => p.id === relic.id) ? 'bg-context-menu-fill' : ''}
            `}>
                <div className="flex gap-x-1">
                    {relic.bound && <Diamond size={8} className="text-text-header-tertiary fill-text-header-tertiary" />}
                    <p className="text-base">{RelicPowerProcessor.getFormattedRelicName(relic)}</p>
                </div>
                <p className="text-xs font-paradigm font-normal italic">{relic.goldValue}g</p>
            </div>
        </button>
    )
}