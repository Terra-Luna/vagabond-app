import type { VagabondCombatant } from "../../../combat/documents/VagabondCombat"
import { CountdownResult } from "../../../combat/engine/roll/CountdownResult"
import { Coins } from "../../../model/common/CoinValue"
import { sys_id } from "../../../utils/foundryUtils"

/**
 * Max Level
 * @returns
 */
export const getMaxLevel = (): number => {
    return (game as any).settings.get(sys_id, "maxLevel") || 10
}

export const getStartingGold = (): Coins => {
    const startingGold = (game as any).settings.get(sys_id, "startingGold") || 3
    return { g: startingGold, s: 0, c: 0 }
}

/**
 * XP Curve Settings
 */
export const getLevelPacing = (): string => {
    return (game as any)?.settings?.get?.(sys_id, "levelPacing") || 'normal'
}
export const getXpToNext = (level: number): number => {
    const xpFormulae = {
        quick: { calculate: () => { return 5 } },
        normal: { calculate: () => { return (level + 1) * 5 } },
        epic: { calculate: () => { return (level + 1) * 7 } },
        saga: { calculate: () => { return (level + 1) * 10 } },
        destiny: { calculate: () => { return -1 } }
    }
    return xpFormulae[getLevelPacing()].calculate()
}

/**
 * XP Questionnaire
 */
export interface XpQuestion {
    id: string
    text: string
    xp: number
}
export const getXpQuestionnaiare = () => {
    return (game as any).settings.get(sys_id, "xpQuestionnaire") as XpQuestion[] || []
}
export const setXpQuestionnaire = async (updatedQuestions) => {
    (game as any).settings.set(sys_id, "xpQuestionnaire", updatedQuestions)
}

/**
 * Attack registry (keeps last 50)
 */
export const getAttackRegistry = () => {
    return (game.settings as any)?.get(sys_id, "attackRegistry") || {}
}
export const setAttackRegistry = async (attackRegistry) => {
    (game.settings as any)?.set(sys_id, "attackRegistry", attackRegistry)
}

export type PolymorphRequestStatus = "applied" | "declined"
export type PolymorphRequestTargetRecord = { status: PolymorphRequestStatus, targetImg?: string }
export type PolymorphRequestRecord = { targets: Record<string, PolymorphRequestTargetRecord> }
export type PolymorphRequestRegistry = Record<string, PolymorphRequestRecord>

export const getPolymorphRequestRegistry = (): PolymorphRequestRegistry => {
    return (game.settings as any)?.get(sys_id, "polymorphRequestRegistry") || {}
}

export const setPolymorphRequestStatuses = async (messageId: string, statuses: Record<string, PolymorphRequestTargetRecord>) => {
    if (!messageId) throw new Error("Polymorph request message ID is unavailable.")
    const registry = getPolymorphRequestRegistry()
    await updateSetting("polymorphRequestRegistry", {
        ...registry,
        [messageId]: { targets: { ...registry[messageId]?.targets, ...statuses } }
    })
}

export const resolveAllAttacks = async () => {
    if (!game.user?.isActiveGM) return
    const registry = { ...getAttackRegistry() }
    Object.keys(registry).forEach(key => {
        registry[key].forEach(attack => {
            attack.isResolved = true
        })
    })
    await setAttackRegistry(registry)
}

/**
 * Item Shop Toggle
 */
export const getItemShopToggle = (): boolean => {
    return (game.settings as any)?.get(sys_id, "itemShopToggle") || false
}
export const setItemShopToggle = async (toggle: boolean) => {
    (game.settings as any)?.set(sys_id, "itemShopToggle", toggle)
}

/**
 * Progress Clocks
 */
export interface ProgressClockSchema extends OverlayObjectPermissions {
    id: string
    x: number
    y: number
    label?: string
    segments: number
    filled: number
}
export const getProgressClocks = (): ProgressClockSchema[] => {
    return (game.settings as any)?.get(sys_id, "progressClocks") || []
}
export const setProgressClocks = async (clocks: ProgressClockSchema[]) => {
    await updateSetting("progressClocks", clocks)
}

/**
 * Auto-arranges new countdowns and progress clocks to avoid overlapping when several are created at the same time. 
 */
const widgetLayoutParams = {
    countdown: { startX: 0.18, endX: 0.4, startY: 0.0, stepPxX: 72, stepPxY: 72 },
    clock: { startX: 0.5, endX: 0.80, startY: 0.0, stepPxX: 84, stepPxY: 104 }
}

/**
 * Controls the auto-layout of widgets by finding the first open slot to place it.
 * Also controls adding new rows once they reach the specified percentage point of
 * the screen. Defaults to 1080p if a resolution can't be found.
 */
export const findOpenOverlaySlots = (kind: keyof typeof widgetLayoutParams, existing: { x: number, y: number }[], count: number): { x: number, y: number }[] => {

    const layout = widgetLayoutParams[kind]
    const rect = document.querySelector(".canvas-overlay-viewport")?.getBoundingClientRect()

    const width = rect?.width || window.innerWidth || 1920
    const height = rect?.height || window.innerHeight || 1080

    const stepX = layout.stepPxX / width
    const stepY = layout.stepPxY / height

    const columns = Math.max(1, Math.floor((layout.endX - layout.startX) / stepX) + 1)
    const rows = Math.max(1, Math.floor((0.9 - layout.startY) / stepY) + 1)

    const takenSlots = [...existing]
    const isTaken = (x: number, y: number) =>
        takenSlots.some(it => Math.abs(it.x - x) * width < layout.stepPxX / 2 && Math.abs(it.y - y) * height < layout.stepPxY / 2)

    const slots: { x: number, y: number }[] = []

    for (let n = 0; n < count; n++) {
        let slot: { x: number, y: number } | undefined
        for (let i = 0; i < columns * rows && !slot; i++) {
            const x = layout.startX + (i % columns) * stepX
            const y = layout.startY + Math.floor(i / columns) * stepY
            if (!isTaken(x, y)) slot = { x, y }
        }

        // If a slot is undefined (not found), start a new row...
        slot ??= {
            x: layout.startX + 0.01 * (takenSlots.length % 5),
            y: layout.startY + 0.01 * (takenSlots.length % 5)
        }

        takenSlots.push(slot)
        slots.push(slot)
    }

    return slots
}

export const addProgressClock = async (label: string, segments: number) => {
    const existing = getProgressClocks()
    const [slot] = findOpenOverlaySlots("clock", existing.filter(isVisibleInCurrentScene), 1)
    await setProgressClocks([...existing, { id: foundry.utils.randomID(), x: slot.x, y: slot.y, centered: false, label, segments, filled: 0 }])
}
export const checkClockPermission = (): boolean => {
    return checkPermissionLevel("clockPermissionLevel")
}
export const deleteAllProgressClocks = async () => {
    await updateSetting("progressClocks", [])
}

/**
 * Countdown Timers
 */
export interface CountdownSchema extends OverlayObjectPermissions {
    id: string
    x: number
    y: number
    label?: string
    result: CountdownResult
}
export const getCountdowns = (): CountdownSchema[] => {
    return (game.settings as any)?.get(sys_id, "countdowns") || []
}
export const setCountdowns = async (countdowns: CountdownSchema[]) => {
    await updateSetting("countdowns", countdowns)
    const combatants = game.combat?.combatants.contents as VagabondCombatant[]
    if (combatants) {
        for (const combatant of combatants) {
            await combatant.updateBurningStatus()
        }
    }
}
export const checkCountdownPermission = (): boolean => {
    return checkPermissionLevel("countdownPermissionLevel")
}
export const deleteAllCountdowns = () => {
    return setCountdowns([])
}
export const addCountdowns = async (
    countdownsToAdd: {
        label: string
        duration: number
        x?: number
        y?: number
        actorId?: string
        tokenUuid?: string
        status?: { id: string, damageType?: string }
    }[]
) => {
    if (!countdownsToAdd.length) return
    const existing = getCountdowns()
    const slots = findOpenOverlaySlots("countdown", existing.filter(isVisibleInCurrentScene), countdownsToAdd.length)
    const newCountdowns: CountdownSchema[] = countdownsToAdd.map((item, index) => {
        const hasPosition = item.x !== undefined || item.y !== undefined
        return {
            id: foundry.utils.randomID(),
            x: hasPosition ? item.x ?? 0.5 : slots[index].x,
            y: hasPosition ? item.y ?? 0.5 : slots[index].y,
            centered: false,
            result: {
                actorUuid: item.actorId,
                tokenUuid: item.tokenUuid,
                name: item.label,
                duration: item.duration,
                status: item.status?.id,
                damageType: item.status?.damageType
            }
        }
    })
    await setCountdowns([...existing, ...newCountdowns])
}
export const addCountdown = async (
    label: string,
    duration: number, x?: number, y?: number,
    actorId?: string, tokenUuid?: string,
    status?: { id: string, damageType?: string }
) => {
    return addCountdowns([{ label, duration, x, y, actorId, tokenUuid, status }])
}
export const removeBurns = (actorUuids: (string | null | undefined)[] | Set<string>) => {
    const uuidSet = new Set(Array.from(actorUuids).filter(Boolean) as string[])
    if (uuidSet.size === 0) return Promise.resolve(true)
    return setCountdowns(getCountdowns().filter(countdown => countdown.result.status !== "burning" || !countdown.result.actorUuid || !uuidSet.has(countdown.result.actorUuid)))
}
export const removeAllBurns = (actorUuid: string | null | undefined) => {
    if (!actorUuid) return Promise.resolve(true)
    return removeBurns([actorUuid])
}

export const getManaEnforcement = (): boolean => {
    return (game.settings as any)?.get(sys_id, "enforceMana")
}

export const getRelicForgeAccess = (): boolean => {
    return (game.settings as any)?.get(sys_id, "relicForgeAccess")
}

export const getShowTrainingSelectionToggle = (): boolean => {
    return (game.settings as any)?.get(sys_id, "showTrainingSelection") || false
}

export const getAllowLateLuckStudy = (): boolean => {
    return (game.settings as any)?.get(sys_id, "allowLateLuckStudy")
}

/**
 * Use this function to provide access for players with ganted permissions.
 * @param setting 
 * @param update 
 * @returns 
 */
const updateSetting = async (setting: string, update: any) => {
    if (!game.user) return

    if (game.user.isActiveGM) {
        await (game.settings as any)?.set(sys_id, setting, update)
    }
    else {
        const payload = {
            user: game.user.id, action: "updateGameSetting",
            data: { setting: setting, update: update }
        }
        game.socket?.emit(`system.${sys_id}`, payload)
    }
}

/**
 * Universal settings permission checker. Options are 'gmOnly' or 'everyone'.
 * Enhance as needed to additionally control visibility as well as editability.
 */
const checkPermissionLevel = (settingName: string): boolean => {
    const setting = (game.settings as any)?.get(sys_id, settingName) || 'gmOnly'
    return setting === 'everyone' || (
        setting === 'gmOnly' && (game.user?.isActiveGM ?? false)
    )
}

/**
 * Handle granting permissions to specific players for interacting with specific
 * progress clocks or countdown timers. The settings will default to the global
 * "everyone/gmOnly" setting.
 */
const isPermissionLevelEveryone = (settingName: string): boolean => {
    return ((game.settings as any)?.get(sys_id, settingName) || 'gmOnly') === 'everyone'
}
export const getClockPlayerDefaultPermission = (): boolean => isPermissionLevelEveryone("clockPermissionLevel")
export const getCountdownPlayerDefaultPermission = (): boolean => isPermissionLevelEveryone("countdownPermissionLevel")

/**
 * Per-object overrides shared by Progress Clocks and Countdown Timers.
 */
export interface OverlayObjectPermissions {
    hiddenFromUserIds?: string[]
    interactableUserIds?: string[]
    sceneId?: string | null
    centered?: boolean
}

export const isVisibleToCurrentUser = (obj: OverlayObjectPermissions): boolean => {
    if (game.user?.isActiveGM) return true
    return !obj.hiddenFromUserIds?.includes(game.user?.id ?? '')
}

export const isVisibleInCurrentScene = (obj: OverlayObjectPermissions): boolean => {
    return !obj.sceneId || obj.sceneId === canvas?.scene?.id
}

export const canInteractWithOverlayObject = (obj: OverlayObjectPermissions, globalPermissionCheck: () => boolean): boolean => {
    if (game.user?.isActiveGM) return true
    if (obj.interactableUserIds) return obj.interactableUserIds.includes(game.user?.id ?? '')
    return globalPermissionCheck()
}

export const togglePlayerVisibility = (obj: OverlayObjectPermissions, userId: string): string[] => {
    const hidden = obj.hiddenFromUserIds ?? []
    return hidden.includes(userId) ? hidden.filter(id => id !== userId) : [...hidden, userId]
}

export const togglePlayerInteraction = (obj: OverlayObjectPermissions, userId: string, playerDefaultPermission: boolean): string[] => {
    const players = game.users?.filter(u => !u.isGM) ?? []
    const baseline = obj.interactableUserIds ?? (playerDefaultPermission ? players.map(p => p.id) : [])
    return baseline.includes(userId) ? baseline.filter(id => id !== userId) : [...baseline, userId]
}

export const toggleSceneLink = (obj: OverlayObjectPermissions): string | null => {
    return obj.sceneId ? null : (canvas?.scene?.id ?? null)
}

export const getMiniCardsPref = (actorId: string): boolean => {
    try {
        const state = (game.settings as any).get(sys_id, `hero-sheet-mini-cards-${actorId}`)
        return state !== undefined && state !== null ? Boolean(state) : true
    }
    catch {
        return true
    }
}