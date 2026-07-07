import { useCallback, useMemo } from "react"
import { PerkDataModel } from "../../../../../model/item/character/PerkDataModel"
import { DropDown } from "../../../../component/Dropdown"

const getAllPerks = () => {
    // todo make sure this works with compendium packs
    return game.items?.filter(item => (item as any).type === "perk") as unknown as (PerkDataModel & { _id: string })[]
}

export const PerkSelect = (props: Omit<React.ComponentProps<typeof DropDown>, 'options'>) => {
    const allPerks = getAllPerks()

    const perkOptions = useMemo(() => allPerks.map(perk => ({ label: (perk as any).name, value: perk._id })), [allPerks])

    return <DropDown {...props} options={perkOptions} />
}