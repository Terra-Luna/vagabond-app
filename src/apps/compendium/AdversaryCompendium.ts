import { appLang } from "../../utils/lang"
import { createFilterableCompendium, filterRow, numberFilter, registerFilterableCompendium, selectFilter } from "./FilterableCompendium"

export const ADVERSARY_FILTER_FIELDS = [
    "system.beingSize",
    "system.beingType",
    "system.beingSubtype",
    "system.hitDice",
    "system.threatLevel",
    "system.threatLevelOverride"
]

/**
 * Adds additional adversary filters to the compendium browser interface.
 */
export const AdversaryCompendium = createFilterableCompendium({
    indexFields: ADVERSARY_FILTER_FIELDS,
    emptyFilters: () => ({
        beingSize: "",
        beingType: "",
        hitDiceMin: null,
        hitDiceMax: null,
        threatLevelMin: null,
        threatLevelMax: null
    }),
    renderFilters: () => {
        const sizeOptions = Object.entries(appLang.Sizes) as [string, string][]
        const typeOptions = [...new Map([
            ...Object.entries(appLang.BeingTypes),
            ...Object.entries(appLang.BeingSubtypes).filter(([value]) => value !== "none")
        ])].map(([value, label]) => [value, (label as string) || value] as [string, string])

        return filterRow(
            selectFilter("Size", "beingSize", sizeOptions) + selectFilter("Being Type", "beingType", typeOptions),
            "margin-bottom: 8px;"
        ) + filterRow(
            numberFilter("HD Min", "hitDiceMin") +
            numberFilter("HD Max", "hitDiceMax") +
            numberFilter("TL Min", "threatLevelMin", 0.5) +
            numberFilter("TL Max", "threatLevelMax", 0.5)
        )
    },
    matches: (sys, f) => {
        const threatLevel = sys.threatLevelOverride ?? sys.threatLevel ?? 0
        if (f.beingSize && sys.beingSize !== f.beingSize) return false
        if (f.beingType && sys.beingType !== f.beingType && sys.beingSubtype !== f.beingType) return false
        if (f.hitDiceMin != null && (sys.hitDice ?? 0) < f.hitDiceMin) return false
        if (f.hitDiceMax != null && (sys.hitDice ?? 0) > f.hitDiceMax) return false
        if (f.threatLevelMin != null && threatLevel < f.threatLevelMin) return false
        if (f.threatLevelMax != null && threatLevel > f.threatLevelMax) return false
        return true
    }
})

/**
 * Swaps the Adversaries compendium to use our filterable Application class.
 */
export const registerAdversaryCompendiumFilters = registerFilterableCompendium("adversaries", AdversaryCompendium)
