import { tableBorderRounded } from "../../../view/common/border-styles"
import { ItemPortraitComponent } from "../../../view/sheets/item/shared/ItemPortraitComponent"

export const AlchemyToolsPill = ({ item }: { item: Item }) => {
    return (
         <div className={`flex items-end gap-x-2 w-fit pr-2 ${tableBorderRounded} bg-context-menu-fill`}>
            {item && <ItemPortraitComponent item={item} size={36} className="flex" disableCtxMenu={true} />}
            <p className="text-text-primary text-lg text-center font-eskapade font-bold">{item.name}</p>
        </div>
    )
}