import createAncestries from "./create-ancestries"
import createClasses from "./create-classes"
import createEquipment from "./create-equipment"
import createPerks from "./create-perks"
import createSpells from "./create-spells"

export const runAllMacros = () => {
    createAncestries()
    createClasses()
    createEquipment()
    createPerks()
    createSpells()
}