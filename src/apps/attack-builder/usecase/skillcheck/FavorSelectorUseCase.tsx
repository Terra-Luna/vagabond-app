import { useState } from "react"
import { vgLiteLang } from "../../../../utils/lang"
import { CustomDropDown } from "../../../../view/component/Dropdown"
import { Label } from "../../component/Labels"

export const useFavorHinderSelector = () => {
    const [favorHinder, setFavorHinder] = useState<'none' | 'favor' | 'hinder'>('none')
    const FavorHinderSelector = <div>
        <Label text={"Favor/Hinder"} />
        <CustomDropDown
            value={favorHinder}
            options={[
                { value: 'none', label: vgLiteLang.FavorHinder.none },
                { value: 'favor', label: vgLiteLang.FavorHinder.favor },
                { value: 'hinder', label: vgLiteLang.FavorHinder.hinder }
            ]}
            onChange={(e) => setFavorHinder(e.target.value)}
            className="text-sm"
        />
    </div>
    return { FavorHinderSelector, favorHinder }
}