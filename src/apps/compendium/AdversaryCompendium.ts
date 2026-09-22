import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"

export const ADVERSARY_FILTER_FIELDS = [
    "system.beingSize",
    "system.beingType",
    "system.beingSubtype",
    "system.hitDice",
    "system.threatLevel"
]

interface AdversaryFilterState {
    beingSize: string
    beingType: string
    beingSubtype: string
    hitDiceMin: number | null
    hitDiceMax: number | null
    threatLevelMin: number | null
    threatLevelMax: number | null
}

const emptyFilters = (): AdversaryFilterState => ({
    beingSize: "",
    beingType: "",
    beingSubtype: "",
    hitDiceMin: null,
    hitDiceMax: null,
    threatLevelMin: null,
    threatLevelMax: null
})

const NUMERIC_FILTER_KEYS = new Set(["hitDiceMin", "hitDiceMax", "threatLevelMin", "threatLevelMax"])

/**
 * Adds additional adversary filters to the compendium browser interface.
 */
export class AdversaryCompendium extends (foundry.applications.sidebar.apps.Compendium as any) {
    private _adversaryFilters: AdversaryFilterState = emptyFilters()

    protected async _onRender(context: any, options: any): Promise<void> {
        await super._onRender(context, options)
        await (this as any).collection?.getIndex({ fields: ADVERSARY_FILTER_FIELDS })
        this._injectFilterBar()
        this._reapplySearch()
    }

    private _injectFilterBar() {
        const root: HTMLElement = (this as any).element
        if (!root || root.querySelector(".vagabond-adversary-filters")) return

        const header = root.querySelector('[data-application-part="header"]')
            ?? root.querySelector(".directory-header")
            ?? root.querySelector(".window-content")

        if (!header) {
            console.warn(`${sys_id} | AdversaryCompendium: couldn't find a header element to attach filters to`, root)
            return
        }

        if (!root.querySelector("style[data-vagabond-adversary-filter-styles]")) {
            const style = document.createElement("style")
            style.setAttribute("data-vagabond-adversary-filter-styles", "true")
            style.textContent = `
                .vagabond-adversary-filters { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.25rem 0.5rem; align-items: flex-end; }
                .vagabond-adversary-filters label { display: flex; flex-direction: column; font-size: var(--font-size-11, 11px); gap: 0.1rem; flex: 1 1 6rem; }
                .vagabond-adversary-filters select, .vagabond-adversary-filters input { min-width: 0; }
            `
            root.appendChild(style)
        }

        const beingSizeOptions = Object.entries(appLang.Sizes).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")
        const beingTypeOptions = Object.entries(appLang.BeingTypes).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")
        const beingSubtypeOptions = Object.entries(appLang.BeingSubtypes).filter(([value]) => value !== "none").map(([value, label]) => `<option value="${value}">${label || value}</option>`).join("")
        
        const bar = document.createElement("div")
        bar.className = "vagabond-adversary-filters"
        bar.innerHTML = `
            <label>Size
                <select data-filter="beingSize">
                    <option value="">Any</option>
                    ${beingSizeOptions}
                </select>
            </label>
            <label>Being Type
                <select data-filter="beingType">
                    <option value="">Any</option>
                    ${beingTypeOptions}
                </select>
            </label>
            <label>Subtype
                <select data-filter="beingSubtype">
                    <option value="">Any</option>
                    ${beingSubtypeOptions}
                </select>
            </label>
            <div style="display: flex !important; flex-direction: row !important; gap: 8px; width: 100%;">
                <label style="flex: 1 !important; min-width: 0; display: flex; flex-direction: column;">
                    HD Min
                    <style>input[data-filter] { width: 100%; box-sizing: border-box; }</style>
                    <input type="number" min="0" step="1" data-filter="hitDiceMin" style="width: 100%; box-sizing: border-box;" />
                </label>
                <label style="flex: 1 !important; min-width: 0; display: flex; flex-direction: column;">
                    HD Max
                    <input type="number" min="0" step="1" data-filter="hitDiceMax" style="width: 100%; box-sizing: border-box;" />
                </label>
                <label style="flex: 1 !important; min-width: 0; display: flex; flex-direction: column;">
                    TL Min
                    <input type="number" min="0" step="0.5" data-filter="threatLevelMin" style="width: 100%; box-sizing: border-box;" />
                </label>
                <label style="flex: 1 !important; min-width: 0; display: flex; flex-direction: column;">
                    TL Max
                    <input type="number" min="0" step="0.5" data-filter="threatLevelMax" style="width: 100%; box-sizing: border-box;" />
                </label>
            </div>
        `

        bar.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-filter]").forEach(el => {
            el.addEventListener("change", () => this._onFilterChange(el))
        })

        header.appendChild(bar)
    }

    private _onFilterChange(element: HTMLInputElement | HTMLSelectElement) {
        const key = element.dataset.filter as keyof AdversaryFilterState
        const isNumeric = NUMERIC_FILTER_KEYS.has(key)
        const raw = element.value
        ;(this._adversaryFilters as any)[key] = raw === "" ? (isNumeric ? null : "") : (isNumeric ? Number(raw) : raw)
        this._reapplySearch()
    }

    /**
     * Recursively toggles the display of entries within foldlers.
     */
    protected _onSearchFilter(_event: unknown, _query: string, _rgx: RegExp, _html: HTMLElement): void {
        this._reapplySearch()
    }

    private _reapplySearch() {
        const root: HTMLElement = (this as any).element
        if (!root) return

        const input = root.querySelector<HTMLInputElement>('input[name="search"]')
        const query = (input?.value ?? "").trim().toLowerCase()
        const collection = (this as any).collection

        root.querySelectorAll<HTMLElement>("[data-entry-id]").forEach(it => {
            const id = it.dataset.entryId
            if (!id) return
            const entry = collection?.index?.get(id) as any
            const name = (entry?.name ?? it.querySelector(".entry-name")?.textContent ?? "").toLowerCase()
            const visible = (!query || name.includes(query)) && this._matchesAdversaryFilters(id)
            it.style.display = visible ? "" : "none"
        })

        root.querySelectorAll<HTMLElement>("[data-folder-id]").forEach(f => {
            const arr = Array.from(f.querySelectorAll<HTMLElement>("[data-entry-id]"))
            const hasVisibleEntry = arr.length === 0 || arr.some(it => it.style.display !== "none")
            f.style.display = hasVisibleEntry ? "" : "none"
        })
    }

    private _matchesAdversaryFilters(entryId: string): boolean {
        const collection = (this as any).collection
        const entry = collection?.index?.get(entryId) as any
        if (!entry) return true

        const f = this._adversaryFilters
        const system = entry.system ?? {}
        if (f.beingSize && system.beingSize !== f.beingSize) return false
        if (f.beingType && system.beingType !== f.beingType) return false
        if (f.beingSubtype && system.beingSubtype !== f.beingSubtype) return false
        if (f.hitDiceMin != null && (system.hitDice ?? 0) < f.hitDiceMin) return false
        if (f.hitDiceMax != null && (system.hitDice ?? 0) > f.hitDiceMax) return false
        if (f.threatLevelMin != null && (system.threatLevel ?? 0) < f.threatLevelMin) return false
        if (f.threatLevelMax != null && (system.threatLevel ?? 0) > f.threatLevelMax) return false

        return true
    }
}

Hooks.on("renderCompendium", (app: any) => {
    if (app.collection?.metadata?.name !== "adversaries" || app instanceof AdversaryCompendium) return
    app.close({ animate: false })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    new AdversaryCompendium({ collection: app.collection }).render(true)
})

/**
 * Swaps the Adversaries compendium to use our filterable Application class.
 */
export const registerAdversaryCompendiumFilters = () => {
    const pack = game.packs?.get(`${sys_id}.adversaries`) as any
    if (!pack) return
    pack.applicationClass = AdversaryCompendium
    pack.getIndex({ fields: ADVERSARY_FILTER_FIELDS })
    for (const app of [...(pack.apps ?? [])]) {
        if (!(app instanceof AdversaryCompendium)) {
            app.close({ animate: false })
        }
    }
}