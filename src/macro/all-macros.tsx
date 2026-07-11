import createAncestries from "./create-ancestries"
import createEquipment from "./create-equipment"
import createPerks from "./create-perks"
import createSpells from "./create-spells"

export const runAllMacros = () => {
    createAncestries()
    createEquipment()
    createPerks()
    createSpells()
}