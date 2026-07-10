import { useEffect, useState } from "react"
import { DropDown } from "../../../../component/Dropdown"
import { CombinedItems } from "../../../../../utils/modelUtil"

export const PerkSelect = (props: Omit<React.ComponentProps<typeof DropDown>, 'options'>) => {
    const [perkOptions, setPerkOptions] = useState<{ label: string, value: string | null }[]>([])

    useEffect(() => {
        CombinedItems('perk').then((perks) => {
            setPerkOptions(
                perks.map(p => ({ label: p.name, value: p._id }))
            )
        })
    }, [])

    return <DropDown {...props} options={perkOptions} />
}