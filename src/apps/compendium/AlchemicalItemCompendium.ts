import { toCopper } from "../../model/common/CoinValue"
import { appLang } from "../../utils/lang"
import { createFilterableCompendium, filterRow, numberFilter, registerFilterableCompendium, selectFilter } from "./FilterableCompendium"

export const ALCHEMICAL_FILTER_FIELDS = [
    "system.alchemyCategory",
    "system.damage.type",
    "system.appliedEffects",
    "system.value"
]

const ANY_STATUS = "__any"

/**
 * Adds alchemical item filters to the compendium browser.
 */
export const AlchemicalItemCompendium = createFilterableCompendium({
    indexFields: ALCHEMICAL_FILTER_FIELDS,
    emptyFilters: () => ({
        alchemyCategory: "",
        damageType: "",
        status: "",
        valueMin: null,
        valueMax: null
    }),
    renderFilters: () => {
        const categoryOptions = Object.entries(appLang.AlchemyCategories)
            .map(([value, cat]: [string, any]) => [value, cat?.name || value] as [string, string])
        const damageOptions = Object.entries(appLang.DamageTypes)
            .filter(([value]) => value !== "none")
            .map(([value, label]) => [value, label as string] as [string, string])
        const statusOptions: [string, string][] = [
            ...Object.entries(appLang.StatusConditions)
                .map(([value, cond]: [string, any]) => [value, cond?.name || value] as [string, string])
        ]

        return filterRow(
            selectFilter("Cat.", "alchemyCategory", categoryOptions) +
            selectFilter("Damage", "damageType", damageOptions) +
            selectFilter("Status", "status", statusOptions) +
            numberFilter("Min (Silver)", "valueMin", 0.01) +
            numberFilter("Max (Silver)", "valueMax", 0.01)
        )
    },
    matches: (sys, f) => {
        if (f.alchemyCategory && sys.alchemyCategory !== f.alchemyCategory) return false
        if (f.damageType && sys.damage?.type !== f.damageType) return false
        if (f.status) {
            const effects: any[] = Array.isArray(sys.appliedEffects) ? sys.appliedEffects : []
            const statuses = Object.keys(appLang.StatusConditions)
            const hit = f.status === ANY_STATUS
                ? effects.some(e => statuses.includes(e?.effect))
                : effects.some(e => e?.effect === f.status)
            if (!hit) return false
        }

        const copperValue = toCopper({ g: sys.value?.g ?? 0, s: sys.value?.s ?? 0, c: sys.value?.c ?? 0 })
        if (f.valueMin != null && f.valueMin !== "" && copperValue < Math.round(Number(f.valueMin) * 100)) return false
        if (f.valueMax != null && f.valueMax !== "" && copperValue > Math.round(Number(f.valueMax) * 100)) return false
        return true
    }
})

export const registerAlchemicalItemCompendiumFilters = registerFilterableCompendium("alchemical", AlchemicalItemCompendium)