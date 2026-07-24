import { vgLiteLang } from "../../utils/lang"
import { createDropdownEntries } from "../../utils/localeUtils"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"

export const CategoryButtons = ({ shopCategory, setShopCategory }: { shopCategory: string, setShopCategory: (cat) => void }) => {
    const shopCategories = createDropdownEntries(vgLiteLang.ItemShop.Categories)
    return (
        <div className="flex gap-x-1 justify-center">
            {
                shopCategories.map((cat, index) => (<>
                    {
                        cat.value === shopCategory ?
                            <PrimaryButton key={`${index}_${cat.value}_selected`} onClick={() => { }}>{cat.label}</PrimaryButton> :
                            <SecondaryButton key={`${index} _${cat.value}_deselected`} onClick={() => setShopCategory(cat.value)}>{cat.label}</SecondaryButton>
                    }
                </>))
            }
        </div>
    )
}