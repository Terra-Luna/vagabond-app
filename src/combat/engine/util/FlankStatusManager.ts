import { getCombatAutoFlanking } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { StatusEffectUtil } from "../../../model/actor/util/StatusEffectUtil"
import { groupBy } from "../../../utils/collectionUtil"
import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"

export class FlankStatusManager {

    private static readonly RELEVANT_CHANGES = ["x", "y", "width", "height", "elevation", "disposition", "hidden"]
    private static readonly pendingPositions = new Map<string, { x?: number, y?: number, width?: number, height?: number }>()

    static register() {
        Hooks.on("canvasReady", () => FlankStatusManager.refreshAll())
        Hooks.on("createCombat", () => FlankStatusManager.refreshAll())
        Hooks.on("deleteCombat", () => FlankStatusManager.refreshAll())
        Hooks.on("combatStart", () => FlankStatusManager.refreshAll())
        Hooks.on("createToken", (doc: TokenDocument) => FlankStatusManager.onTokenChanged(doc))
        const onDeadStatusChanged = (effect: ActiveEffect) => {
            if ((effect as any).statuses?.has("dead")) FlankStatusManager.refreshAll()
        }
        Hooks.on("createActiveEffect", onDeadStatusChanged)
        Hooks.on("deleteActiveEffect", onDeadStatusChanged)
        Hooks.on("deleteToken", (doc: TokenDocument) => FlankStatusManager.onTokenChanged(doc))
        Hooks.on("updateActor", (actor: Actor, changes: Record<string, any>) => {
            const polymorphChanged = foundry.utils.hasProperty(changes, `flags.${sys_id}.polymorph`)
                || foundry.utils.hasProperty(changes, `flags.${sys_id}.-=polymorph`)
            const hpChanged = foundry.utils.hasProperty(changes, "system.health.value")
            const sizeChanged = hpChanged || polymorphChanged
                || foundry.utils.hasProperty(changes, "system.beingSize")
                || foundry.utils.hasProperty(changes, "system.ancestry.beingSize")
            if (!sizeChanged) return
            if (!canvas?.tokens?.placeables.some(token => token.actor?.id === actor.id)) return
            FlankStatusManager.refreshAll()
        })
        const onAncestryItemChanged = (item: Item) => {
            if ((item.type as string) !== "ancestry" || !item.parent) return
            if (!canvas?.tokens?.placeables.some(token => token.actor?.id === item.parent?.id)) return
            FlankStatusManager.refreshAll()
        }
        Hooks.on("updateItem", (item: Item, changes: Record<string, any>) => {
            if (foundry.utils.hasProperty(changes, "system.beingSize")) onAncestryItemChanged(item)
        })
        Hooks.on("createItem", (item: Item) => onAncestryItemChanged(item))
        Hooks.on("deleteItem", (item: Item) => onAncestryItemChanged(item))
        Hooks.on("updateToken", (doc: TokenDocument, changes: Record<string, any>) => {
            if (!FlankStatusManager.RELEVANT_CHANGES.some(key => key in changes)) return
            const { x, y, width, height } = changes
            if (doc.id) FlankStatusManager.pendingPositions.set(doc.id, { x, y, width, height })
            FlankStatusManager.onTokenChanged(doc)
            FlankStatusManager.onMovementSettled(doc)
        })
    }

    private static async onMovementSettled(doc: TokenDocument) {
        try {
            await (doc.object as any)?.movementAnimationPromise
        }
        catch { /* animation interrupted */ }
        if (doc.id) FlankStatusManager.pendingPositions.delete(doc.id)
        FlankStatusManager.onTokenChanged(doc)
    }

    private static onTokenChanged(doc: TokenDocument) {
        if (!doc.parent || doc.parent !== canvas?.scene) return
        FlankStatusManager.refreshAll()
    }

    private static isEnabled(): boolean {
        return getCombatAutoFlanking() && !!game.combat
    }

    // While disabled, any lingering flanked status is cleared.
    private static refreshAll() {
        const enabled = FlankStatusManager.isEnabled()
        for (const token of canvas?.tokens?.placeables ?? []) {
            const actor = token.actor
            if (!actor) continue
            StatusEffectUtil.toggleStatusEffectOnce(actor, "flanked", enabled && FlankStatusManager.isFlanked(token))
        }
    }

    static isFlanked(subject: Token): boolean {
        if (!subject) return false

        const proximimalTokens = FlankStatusManager.getProximalTokens(subject)
        if (proximimalTokens.length === 0) return false

        const { FRIENDLY, NEUTRAL, HOSTILE } = CONST.TOKEN_DISPOSITIONS

        // Group proximal tokens by Disposition.
        const byDisposition = groupBy(
            "disposition",
            proximimalTokens.map(token => ({ token, disposition: token.document.disposition }))
        ) ?? {}

        // Get the size of a token as a Number by its index in the appLang.Sizes array.
        const getSize = (token: Token) => {
            if (token.actor?.type as string === "hero") return Object.keys(appLang.Sizes).indexOf((token.actor as any)?.system?.ancestry?.beingSize ?? "medium")
            else return Object.keys(appLang.Sizes).indexOf((token.actor as any)?.system?.beingSize ?? "medium")
        }

        // Return the number of proximal tokens that are eligible for flanking the subject.
        const countOf = (...dispositions: number[]) => {
            return dispositions.reduce((sum, d) =>
                sum + (byDisposition[d]?.filter(it => getSize(it.token) >= getSize(subject) - 1)?.length ?? 0), 0
            )
        }

        // Friendly and Neutral share a side. Hostile is opposed to both.
        const isHostileSubject = subject.document.disposition === HOSTILE
        const enemyDispositions: number[] = isHostileSubject ? [FRIENDLY, NEUTRAL] : [HOSTILE]
        const allyDispositions: number[] = isHostileSubject ? [HOSTILE] : [FRIENDLY, NEUTRAL]
        const isSupportedSubject = ([FRIENDLY, NEUTRAL, HOSTILE] as number[]).includes(subject.document.disposition)

        // An enemy with the "solo" flanking modifier (Bravado) flanks a subject that has no proximal allies.
        const hasSolo = (token: Token) => !!(token.actor as any)?.system?.modifiers?.combat?.constant?.flanking?.solo
        if (isSupportedSubject
            && !proximimalTokens.some(it => allyDispositions.includes(it.document.disposition))
            && proximimalTokens.some(it => enemyDispositions.includes(it.document.disposition) && hasSolo(it) && getSize(it) >= getSize(subject) - 1)
        ) return true

        // A Friendly or Neutral subject is flanked by 2+ Hostile tokens.
        if (subject.document.disposition === FRIENDLY || subject.document.disposition === NEUTRAL) return countOf(HOSTILE) >= 2

        // A Hostile subject is flanked by 2+ Friendly or Neutral tokens.
        if (subject.document.disposition === HOSTILE) return countOf(FRIENDLY, NEUTRAL) >= 2

        return false
    }

    static getProximalTokens(subject: Token): Token[] {
        if (!subject) return []

        const grid = canvas?.grid as any
        if (!grid || !canvas?.tokens) return []

        const rectOf = (token: Token) => {
            const live = token.document as any
            const pending = FlankStatusManager.pendingPositions.get(token.document.id ?? "") ?? {}
            const doc = {
                x: pending.x ?? live.x,
                y: pending.y ?? live.y,
                width: pending.width ?? live.width,
                height: pending.height ?? live.height
            }
            const size = grid.size || 100
            const left = doc.x, top = doc.y
            return { left, top, right: left + (doc.width ?? 1) * size, bottom: top + (doc.height ?? 1) * size, doc, size }
        }

        const isDown = (token: Token) => {
            const actor = token.actor as any
            return actor?.system?.health?.value <= 0 || !!actor?.statuses?.has("dead")
        }

        // Gridless: tokens within 5 ft of each other are proximal.
        if (grid.isGridless) {
            const a = rectOf(subject)
            const feetPerPixel = (grid.distance ?? 5) / (grid.size || 100)
            return canvas.tokens.placeables.filter(token => {
                if (token === subject || isDown(token)) return false
                const b = rectOf(token)
                const dx = Math.max(0, a.left - b.right, b.left - a.right)
                const dy = Math.max(0, a.top - b.bottom, b.top - a.bottom)
                return Math.hypot(dx, dy) * feetPerPixel <= 5
            })
        }

        const key = (o: { i: number, j: number }) => `${o.i},${o.j}`

        // Grid spaces covered by a token, found by sampling the center of each space the token spans.
        const occupiedOffsets = (token: Token): { i: number, j: number }[] => {
            const { left, top, doc, size } = rectOf(token)
            const found = new Map<string, { i: number, j: number }>()
            for (let a = 0; a < Math.max(1, Math.round(doc.width ?? 1)); a++) {
                for (let b = 0; b < Math.max(1, Math.round(doc.height ?? 1)); b++) {
                    const offset = grid.getOffset({ x: left + (a + 0.5) * size, y: top + (b + 0.5) * size })
                    found.set(key(offset), offset)
                }
            }
            return [...found.values()]
        }

        // Spaces adjacent to the subject (diagonals included), excluding the subject's own spaces.
        const own = new Set(occupiedOffsets(subject).map(key))
        const adjacent = new Set<string>()
        for (const offset of occupiedOffsets(subject)) {
            for (const neighbor of grid.getAdjacentOffsets(offset) as { i: number, j: number }[]) {
                const k = key(neighbor)
                if (!own.has(k)) adjacent.add(k)
            }
        }

        return canvas.tokens.placeables.filter(token =>
            token !== subject && !isDown(token) && occupiedOffsets(token).some(o => adjacent.has(key(o)))
        )
    }
}
