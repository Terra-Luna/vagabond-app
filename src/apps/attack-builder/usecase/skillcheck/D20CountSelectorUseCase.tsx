import { useState } from "react"

import { CustomDropDown } from "../../../../view/component/Dropdown"
import { Label } from "../../component/Labels"

export const useD20CountSelector = ({ initialD20Count }: { initialD20Count?: number }) => {
    const [d20Count, setD20Count] = useState<number>(initialD20Count ?? 1)
    const D20CountSelector = <div>
        <Label text={"D20"} className="-mb-1" />
        <CustomDropDown
            value={d20Count.toString()}
            options={[
                { value: '1', label: '1d20' },
                { value: '2', label: '2d20' },
                { value: '3', label: '3d20' }
            ]}
            onChange={(e) => setD20Count(Number(e.target.value))}
            className="text-sm"
        />
    </div>
    return { D20CountSelector, d20Count, setD20Count }
}