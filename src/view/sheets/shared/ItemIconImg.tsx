import { Diamond } from "lucide-react"
import { lazy, Suspense } from "react"

import { getName } from "../../../utils/modelUtil"
import { tableBorderRounded } from "../../common/border-styles"
import { Tooltip } from "../../component/Tooltip"

const EquipmentSheet = lazy(() =>
    import("../item/equip/EquipmentSheetComponent").then(({ EquipmentSheetComponent }) => ({
        default: EquipmentSheetComponent
    }))
)

export const ItemIconImg = ({ item, size = 28 }) => {
    const isEquipped = item.isEquipped
    const isBound = item.isBoundRelic?.()
    const isCursed = item.isCursed?.()

    return (
        <div className="flex items-center justify-center relative mr-2 shrink-0">
            <Tooltip interactive={true} content={
                <Suspense fallback={null}>
                    <EquipmentSheet item={item.parent} />
                </Suspense>
            }>
                <img
                    src={item.parent.img}
                    alt={getName(item)}
                    width={size}
                    height={size}
                    className={`rounded-sm border border-solid border-section-header-fill/60 cursor-pointer`}
                />

                {/* DO NOT SHOW DIAMOND IF CURSED AND UNEQUIPPED */}
                <span>
                    {isEquipped && isBound &&
                        <Diamond
                            size={12}
                            className={`absolute bottom-0 right-0 text-text-header-tertiary fill-text-header-tertiary bg-sheet-main-fill ${tableBorderRounded}`}
                        />
                    }
                    {!isEquipped && isBound && !isCursed &&
                        <Diamond
                            size={12}
                            className={`absolute bottom-0 right-0 text-text-header-tertiary bg-sheet-main-fill ${tableBorderRounded}`}
                            strokeWidth={1}
                        />
                    }
                </span>
            </Tooltip>
        </div>
    )
}