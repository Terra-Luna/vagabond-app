import { useState } from "react"

import { CustomDropDown } from "../../../../view/component/Dropdown"
import { Label } from "../../component/Labels"

export const useFavorHinderSelector = () => {
    const [favorHinder, setFavorHinder] = useState<'none' | 'favor' | 'hinder'>('none')
    const FavorHinderSelector = <div>
        <Label text={"Fav."} className="-mb-1" />
        <CustomDropDown
            value={favorHinder}
            options={[
                { value: 'none', label: "-" },
                { value: 'favor', label: "+d6" },
                { value: 'hinder', label: '-d6' }
            ]}
            onChange={(e) => setFavorHinder(e.target.value)}
            className="text-sm"
        />
    </div>
    return { FavorHinderSelector, favorHinder, setFavorHinder }
}