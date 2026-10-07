import type { SelectOption } from "../../view/component/MultiSelect"

// "Type" is already taken as a property of the rules, so use "Kind" instead.
export type SelectorKind = "toggle" | "modifier"

/**
 * Add any other virtual properties here so the "intellisense" can suggest it.
 */
const VIRTUAL_SELECTORS = ["class.castingSkill", "class.maxCastFormula"]

/**
 * Ignore-list of all paths that should not be considered as valid selectors.
 */
const EXCLUSIONS = [
    "ancestry.beingSize", "ancestry.beingType", "ancestry.description", "ancestry.rules",
    "class.featureIds", "class.description", "class.complexity", "class.keyStats", "class.rules", "class.startingPacks",
    "inventory.coins.", "inventory.items", "inventory.weaponSlots", "level.", "health.value", "mana.value",
    "saves.endure", "saves.reflex", "saves.will", "forceUpdateTrack", "trackers", "tagalongId", "status.counters."
]

/**
 * Flags can be any boolean value. Typical use-case is marking that a Hero
 * has a specific Perk or class Feature in effect.
 */
const FLAG_SELECTOR_PATTERN = /^flags\.[A-Za-z0-9_]+$/

export const normalizeSelector = (selector: string): string => selector.trim().replace(/^system\./, "")

export const getRuleSelectors = (rule: any): string[] =>
    Array.isArray(rule?.selector) ? (rule.selector as string[]) : []

interface SelectorPath { path: string, isBoolean: boolean }

/**
 * Should we be using actor.system.getRollData() here instead? Idk.
 * @param fields 
 * @param prefix 
 * @param out 
 * @returns 
 */
const collectSchemaPaths = (fields: Record<string, any> | undefined, prefix: string, out: SelectorPath[]) => {
    if (!fields) return
    for (const [name, field] of Object.entries(fields)) {
        const path = prefix ? `${prefix}.${name}` : name
        if (field?.fields && typeof field.fields === "object") {
            collectSchemaPaths(field.fields, path, out)
        }
        else {
            out.push({ path, isBoolean: field instanceof foundry.data.fields.BooleanField })
        }
    }
}

let cachedPaths: SelectorPath[] | null = null

const getSelectorPaths = (): SelectorPath[] => {
    if (cachedPaths) return cachedPaths
    const paths: SelectorPath[] = []
    collectSchemaPaths((CONFIG as any).Actor?.dataModels?.hero?.schema?.fields, "", paths)
    const known = new Set(paths.map(p => p.path))
    VIRTUAL_SELECTORS.filter(p => !known.has(p)).forEach(path => paths.push({ path, isBoolean: false }))
    cachedPaths = paths.filter(it => !EXCLUSIONS.some(x => x.includes(it.path))).sort((a, b) => a.path.localeCompare(b.path))
    return cachedPaths
}

export const isValidSelector = (selector: string, kind: SelectorKind): boolean => {
    const normalized = normalizeSelector(selector)
    if (FLAG_SELECTOR_PATTERN.test(normalized)) return kind === "toggle"
    const match = getSelectorPaths().find(p => p.path === normalized)
    return !!match && match.isBoolean === (kind === "toggle")
}

export const getSelectorOptions = (kind: SelectorKind): SelectOption[] =>
    getSelectorPaths()
        .filter(p => p.isBoolean === (kind === "toggle"))
        .map(p => ({ label: p.path, value: p.path }))