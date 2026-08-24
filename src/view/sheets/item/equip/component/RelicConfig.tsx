import { Diamond } from "lucide-react"
import { useMemo } from "react"

import { RelicPower, RelicPowers } from "../../../../../apps/vagabond-tools/relic/RelicPowers"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { vgLiteLang } from "../../../../../utils/lang"
import { buttonAnimation } from "../../../../component/Button"
import { CollapsibleSection } from "../../../../component/Collapsible"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetPropLabel } from "./ItemSheetLabelComponent"

export const RelicConfig = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    
    const { isEditMode } = useEditMode()
    const relics = useMemo(() => RelicPowers.get(), [])
    
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
        {isEditMode && <div className="flex flex-col gap-y-2 items-start mt-2">
            {/* ACTIVE POWERS */}
            <ItemSheetPropLabel label={vgLiteLang.ButtonActions.relic} />
            <div className="flex flex-wrap gap-1">
                {item.system.relicPowers?.map(relic => (
                    <RelicCard key={relic.id} item={item} relic={relic} />
                ))}
            </div>

            {/* LIST OF RELIC POWERS */}
            {categories.map((cat, index) => (
                <div key={index} className="flex flex-col gap-y-2 w-full">
                
                    {/* RELICS LISTED BY CATEGORY */}
                    <CollapsibleSection title={cat.label} startCollapsed={true} content={
                        <div className="flex flex-wrap gap-1 justify-center mt-1 text-lg text-text-primary font-eskapade font-normal">
                            {/* TOGGLEABLE RELIC INFO CARD */}
                            {filteredRelics(cat.value).map(relic => (
                                <RelicCard item={item} relic={relic} />
                            ))}

                        </div>
                    } />
                </div>
            ))}
                
        </div>}
    </>)
}

const RelicCard = ({ item, relic }) => {
    return (
        <button
            key={relic.id}
            title={relic.description}
            className={buttonAnimation}
            onClick={async () => await RelicPowers.toggleRelicEffect(item, relic)}
        >
            <div className={`
                flex flex-col justify-center text-center p-2 
                border border-solid border-table-border rounded-sm hover-glow
                ${item.system.relicPowers.some(p => p.id === relic.id) ? 'bg-context-menu-fill' : ''}
            `}>
                <div className="flex gap-x-1">
                    <p>{RelicPowers.getFormattedRelicName(relic)}</p>
                    {relic.bound &&
                        <Diamond size={8} className="text-text-header-tertiary fill-text-header-tertiary" />
                    }
                </div>
                <p className="text-xs font-paradigm font-normal italic">{relic.goldValue}g</p>
            </div>
        </button>
    )
}