import { AncestryDataModel } from "../../../../../model/item/character/AncestryDataModel"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { lang } from "../../../../../utils/lang"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { ItemSheetBanner } from "../../shared/ItemSheetBanner"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { Description } from "../../../shared/Description"

export const AncestryReactComponent = ({ item }: { item: Item & { system: AncestryDataModel } | null }) => {
    if (!item) return
    const { isEditMode } = useEditMode()
    const ancestry = item.system

    return (
        <BaseItemSheetComponent
            bodyClassName="mt-2 mx-2"
            banner={<ItemSheetBanner item={item} />}
            body={<>
                {isEditMode &&
                    <div className="text-header-text-secondary flex gap-2 mb-2">
                        <DropDown label={lang.VGLITE.ItemSheet.size}
                            variant="alternate"
                            options={createDropdownEntries(lang.VGLITE.Sizes)}
                            parent={ancestry.parent}
                            updateMechanism={{ updatePath: ['beingSize'] }}
                            value={ancestry.beingSize ?? ''}
                        />
                        <DropDown label={lang.VGLITE.ItemSheet.type}
                            variant="alternate"
                            options={createDropdownEntries(lang.VGLITE.BeingTypes)}
                            parent={ancestry.parent}
                            updateMechanism={{ updatePath: ['beingType'] }}
                            value={ancestry.beingType}
                        />
                    </div>
                }

                <ItemRulesManager item={item} />

            </>}
            description={<Description item={item} showFullView={true} italic={false} />} />
    )
}