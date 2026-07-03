import AncestryDataModel from "../../../../../model/item/character/AncestryDataModel"

export const addNewBlankModifier = (ancestry: AncestryDataModel, traitIdx) => {
    const modifiers = foundry.utils.deepClone(ancestry.traits[traitIdx].modifiers)

    modifiers.push({ targetStat: "MAX HP", type: "BONUS", value: "0" })
    return ancestry.updateTraitValue("modifiers", modifiers, traitIdx)
}

export const addNewBlankGrant = (ancestry: AncestryDataModel, traitIdx) => {
    const grants = foundry.utils.deepClone(ancestry.traits[traitIdx].grants)
    grants.push({ count: 1, ignorePrerequisites: false, type: "PERK", perkOptions: [], spellOptions: [], trainingOptions: [] } as any)
    return ancestry.updateTraitValue("grants", grants, traitIdx)
}