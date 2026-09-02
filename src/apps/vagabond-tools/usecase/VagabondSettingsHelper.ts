import type { VagabondCombatant } from "../../../combat/documents/VagabondCombat"
import { CountdownResult } from "../../../combat/engine/roll/CountdownResult"
import { sys_id } from "../../../utils/foundryUtils"

/**
 * Max Level
 * @returns
 */
export const getMaxLevel = (): number => {
    return (game as any).settings.get(sys_id, "maxLevel") || 10
}

/**
 * XP Curve Settings
 */
export const getLevelPacing = (): string => {
    return (game as any).settings.get(sys_id, "levelPacing") || 'normal'
}
export const getXpToNext = (level: number): number => {
    const xpFormulae = {
        quick: {
            calculate: () => { return 5 }
        },
        normal: {
            calculate: () => { return (level + 1) * 5 }
        },
        epic: {
            calculate: () => { return (level + 1) * 7 }
        },
        saga: {
            calculate: () => { return (level + 1) * 10 }
        },
        destiny: {
            calculate: () => { return -1 }
        }
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
    await updateSetting("countdowns", countdowns);
    const combatants = game.combat?.combatants.contents as VagabondCombatant[];
    if (combatants) {
        for (const combatant of combatants) {
            await combatant.updateBurningStatus();
        }
    }
}
export const checkCountdownPermission = (): boolean => {
    return checkPermissionLevel("countdownPermissionLevel")
}
export const deleteAllCountdowns = () => {
    return setCountdowns([])
}
export const addCountdown = async (
    label: string,
    duration: number, x = 0.1, y = 0.2,
    actorId?: string, tokenUuid?: string,
    status?: { id: string, damageType?: string }
) => {
    const newCountdown: CountdownSchema = {
        id: foundry.utils.randomID(), x: x, y: y,
        result: {
            actorUuid: actorId,
            tokenUuid: tokenUuid,
            name: label,
            duration: duration,
            status: status?.id,
            damageType: status?.damageType
        }
    }
    await setCountdowns([...getCountdowns(), newCountdown])
}
export const removeAllBurns = (actorUuid: string | null | undefined) => {
    if (!actorUuid) return Promise.resolve(true)
    return setCountdowns(getCountdowns().filter(countdown => countdown.result.status !== "burning" || countdown.result.actorUuid !== actorUuid))
}

export const getManaEnforcement = (): boolean => {
    return (game.settings as any)?.get(sys_id, "enforceMana")
}

/**
 * Use this function to provide access for players with ganted permissions.
 * @param setting 
 * @param update 
 * @returns 
 */
const updateSetting = async (setting: string, update: any) => {
    if (!game.user) return

    if (game.user.isGM || game.user.isActiveGM) {
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
        setting === 'gmOnly' && (
            (game.user?.isGM ?? false) || (game.user?.isActiveGM ?? false)
        )
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
}

export const isVisibleToCurrentUser = (obj: OverlayObjectPermissions): boolean => {
    if (game.user?.isGM) return true
    return !obj.hiddenFromUserIds?.includes(game.user?.id ?? '')
}

export const isVisibleInCurrentScene = (obj: OverlayObjectPermissions): boolean => {
    return !obj.sceneId || obj.sceneId === canvas?.scene?.id
}

export const canInteractWithOverlayObject = (obj: OverlayObjectPermissions, globalPermissionCheck: () => boolean): boolean => {
    if (game.user?.isGM || game.user?.isActiveGM) return true
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