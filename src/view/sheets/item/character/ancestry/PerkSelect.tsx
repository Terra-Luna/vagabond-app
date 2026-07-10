import { useMemo } from "react"
import { DropDown } from "../../../../component/Dropdown"
import { CombinedItems } from "../../../../../utils/modelUtil"

const getAllPerks = async () => {
    return await CombinedItems('perk')
}

export const PerkSelect = async (props: Omit<React.ComponentProps<typeof DropDown>, 'options'>) => {
    const allPerks = getAllPerks()

    const perkOptions = useMemo(async () => (await allPerks).map(perk => ({ label: (perk as any).name, value: perk._id })), [allPerks])

    return <DropDown {...props} options={await perkOptions} />
}