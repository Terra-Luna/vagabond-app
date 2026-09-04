import { Fragment } from "react/jsx-runtime"

import { appLang } from "../../utils/lang"
import { createDropdownEntries } from "../../utils/localeUtils"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"

export const CategoryButtons = ({ shopCategory, setShopCategory }: { shopCategory: string, setShopCategory: (cat) => void }) => {
    const shopCategories = createDropdownEntries(appLang.ItemShop.Categories)
    return (
        <div className="flex gap-x-1 justify-center">
            {
                shopCategories.map((cat, index) => (
                    <Fragment key={index}>
                        {cat.value === shopCategory ?
                            <PrimaryButton onClick={() => { }}>{cat.label}</PrimaryButton> :
                            <SecondaryButton onClick={() => setShopCategory(cat.value)}>{cat.label}</SecondaryButton>
                        }
                    </Fragment>))
            }
        </div>
    )
}