import { sys_id } from "../../utils/foundryUtils"

export type FilterValue = string | number | null
export type FilterState = Record<string, FilterValue>

const STYLE_FLEX_CONTAINER = "display: flex !important; flex-direction: row !important; gap: 8px; width: 100%;"
const STYLE_FLEX_LABEL = "flex: 1 !important; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1 !important; margin: 0 !important; line-height: 1.2;"
const STYLE_INPUT_BOX = "width: 100%; box-sizing: border-box; margin-top: -2px !important;"

export const filterRow = (content: string, extraStyle = "") =>
    `<div style="${STYLE_FLEX_CONTAINER} ${extraStyle}">${content}</div>`

export const selectFilter = (label: string, key: string, options: [string, string][], anyLabel = "Any") => `
    <label style="${STYLE_FLEX_LABEL}">${label}
        <select data-filter="${key}" style="${STYLE_INPUT_BOX}">
            <option value="">${anyLabel}</option>
            ${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
        </select>
    </label>`

export const numberFilter = (label: string, key: string, step = 1) => `
    <label style="${STYLE_FLEX_LABEL}">${label}
        <input type="number" min="0" step="${step}" data-filter="${key}" data-numeric="true" style="${STYLE_INPUT_BOX}" />
    </label>`

export interface FilterableCompendiumConfig {
    /** Index fields required by the filters, e.g. "system.beingSize" */
    indexFields: string[]
    /** Initial (empty) filter state */
    emptyFilters: () => FilterState
    /** Inner HTML for the filter bar, built from the shared filter helpers */
    renderFilters: () => string
    /** Whether an index entry's system data passes the current filters */
    matches: (sys: any, filters: FilterState) => boolean
}

/**
 * Builds a compendium Application class that adds a filter bar to the compendium browser.
 */
export const createFilterableCompendium = (config: FilterableCompendiumConfig) => {
    return class FilterableCompendium extends (foundry.applications.sidebar.apps.Compendium as any) {
        static readonly indexFields = config.indexFields
        private _filters: FilterState = config.emptyFilters()

        protected async _onRender(context: any, options: any): Promise<void> {
            await super._onRender(context, options)
            await (this as any).collection?.getIndex({ fields: config.indexFields })
            this._injectFilterBar()
            this._reapplySearch()
        }

        private _injectFilterBar() {
            const root: HTMLElement = (this as any).element
            if (!root || root.querySelector(".vagabond-compendium-filters")) return

            const header = root.querySelector('[data-application-part="header"]')
                ?? root.querySelector(".directory-header")
                ?? root.querySelector(".window-content")

            if (!header) {
                console.warn(`${sys_id} | FilterableCompendium: couldn't find a header element to attach filters to`, root)
                return
            }

            if (!root.querySelector("style[data-vagabond-compendium-filter-styles]")) {
                const style = document.createElement("style")
                style.setAttribute("data-vagabond-compendium-filter-styles", "true")
                style.textContent = `
                    .vagabond-compendium-filters { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.25rem 0.5rem; align-items: flex-end; }
                    .vagabond-compendium-filters label { display: flex; flex-direction: column; font-size: var(--font-size-11, 11px); gap: 0.1rem; flex: 1 1 6rem; }
                    .vagabond-compendium-filters select, .vagabond-compendium-filters input { min-width: 0; }
                    .vagabond-compendium-filters input[data-filter], .vagabond-compendium-filters select[data-filter] { ${STYLE_INPUT_BOX} }
                `
                root.appendChild(style)
            }

            const bar = document.createElement("div")
            bar.className = "vagabond-compendium-filters"
            bar.innerHTML = config.renderFilters()

            bar.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-filter]").forEach(el => {
                el.addEventListener("change", () => this._onFilterChange(el))
            })

            header.appendChild(bar)
        }

        private _onFilterChange(element: HTMLInputElement | HTMLSelectElement) {
            const key = element.dataset.filter!
            const isNumeric = element.dataset.numeric === "true"
            const raw = element.value
            this._filters[key] = raw === "" ? (isNumeric ? null : "") : (isNumeric ? Number(raw) : raw)
            this._reapplySearch()
        }

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
                const visible = (!query || name.includes(query)) && (!entry || config.matches(entry.system ?? {}, this._filters))
                it.style.display = visible ? "" : "none"
            })

            root.querySelectorAll<HTMLElement>("[data-folder-id]").forEach(f => {
                const arr = Array.from(f.querySelectorAll<HTMLElement>("[data-entry-id]"))
                const hasVisibleEntry = arr.length === 0 || arr.some(it => it.style.display !== "none")
                f.style.display = hasVisibleEntry ? "" : "none"
            })
        }
    }
}

type FilterableCompendiumClass = ReturnType<typeof createFilterableCompendium>

/**
 * Swaps the named pack to use the given filterable Application class, and re-opens it when rendered with the default class.
 */
export const registerFilterableCompendium = (packName: string, appClass: FilterableCompendiumClass) => {
    Hooks.on("renderCompendium", (app: any) => {
        if (app.collection?.metadata?.name !== packName || app instanceof appClass) return
        app.close({ animate: false })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        new appClass({ collection: app.collection }).render(true)
    })

    return () => {
        const pack = game.packs?.get(`${sys_id}.${packName}`) as any
        if (!pack) return
        pack.applicationClass = appClass
        pack.getIndex({ fields: appClass.indexFields })
        for (const app of [...(pack.apps ?? [])]) {
            if (!(app instanceof appClass)) {
                app.close({ animate: false })
            }
        }
    }
}
