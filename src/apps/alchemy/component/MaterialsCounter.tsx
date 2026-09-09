import { useMemo } from "react"

import { ItemsCache } from "../../../rules/util/ItemsCache"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { ItemPortraitComponent } from "../../../view/sheets/item/shared/ItemPortraitComponent"

export const MaterialsCounter = ({ text }: { text: string | number }) => {

    const materialsItem = useMemo(() => {
        return ItemsCache.sundries().find(it => it.system.isMaterials)
    }, [])

    return (
        <div className={`flex items-end gap-x-1 w-fit pr-2 ${tableBorderRounded} bg-context-menu-fill`}>
            {materialsItem && <ItemPortraitComponent item={materialsItem} size={36} className="flex" disableCtxMenu={true} />}
            <p className="font-paradigm">x</p>
            <p className="text-text-primary text-2xl text-center font-eskapade font-bold">{text}</p>
        </div>
    )
}