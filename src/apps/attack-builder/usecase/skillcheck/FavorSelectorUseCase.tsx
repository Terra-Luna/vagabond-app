import { useState } from "react"

import { appLang } from "../../../../utils/lang"
import { CustomDropDown } from "../../../../view/component/Dropdown"
import { Label } from "../../component/Labels"

export const useFavorHinderSelector = () => {
    const [favorHinder, setFavorHinder] = useState<'none' | 'favor' | 'hinder'>('none')
    const FavorHinderSelector = <div>
        <Label text={"Favor/Hinder"} />
        <CustomDropDown
            value={favorHinder}
            options={[
                { value: 'none', label: appLang.FavorHinder.none },
                { value: 'favor', label: appLang.FavorHinder.favor },
                { value: 'hinder', label: appLang.FavorHinder.hinder }
            ]}
            onChange={(e) => setFavorHinder(e.target.value)}
            className="text-sm"
        />
    </div>
    return { FavorHinderSelector, favorHinder, setFavorHinder }
}