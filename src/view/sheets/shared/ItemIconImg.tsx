import { Diamond } from "lucide-react"

import { getName } from "../../../utils/modelUtil"
import { tableBorderRounded } from "../../common/border-styles"
import { Tooltip } from "../../component/Tooltip"
import { getItemTooltipComponent } from "./ItemTooltipSheet"

export const ItemIconImg = ({ item, size = 28 }) => {
    const isBoundToHero = item.isBound
    const isBindable = item.isBoundRelic?.()
    const TooltipSheet = getItemTooltipComponent()

    return (
        <div className="flex items-center justify-center relative mr-2 shrink-0">
            <Tooltip interactive={true} content={
                TooltipSheet ? <TooltipSheet item={item.parent} /> : null
            }>
                <img
                    src={item.parent.img}
                    alt={getName(item)}
                    width={size}
                    height={size}
                    className={`rounded-sm border border-solid border-section-header-fill/60`}
                />

                <span>
                    {isBoundToHero && isBindable &&
                        <Diamond
                            size={12}
                            className={`absolute bottom-0 right-0 text-text-header-tertiary fill-text-header-tertiary bg-sheet-main-fill ${tableBorderRounded}`}
                        />
                    }
                    {!isBoundToHero && isBindable &&
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