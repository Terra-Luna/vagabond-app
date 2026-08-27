import { CountdownResult } from "../../../combat/engine/roll/CountdownResult"

/**
 * Max Level
 * @returns
 */
export const getMaxLevel = (): number => {
    return (game as any).settings.get("vagabond-lite", "maxLevel") || 10
}

/**
 * XP Curve Settings
 */
export interface XpCurve {
    id: string
    level: number
    xp: number
}
export const getXpCurve = (): XpCurve[] => {
    return (game as any).settings.get("vagabond-lite", "xpCurve") || []
}
export const setXpCurve = async (curve) => {
    await (game as any).settings.set("vagabond-lite", "xpCurve", curve)
}
export const getXpToNext = (level: number): number => {
    return getXpCurve().find(it => it.level === level)?.xp ?? (level + 1) * 5
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
    return (game as any).settings.get("vagabond-lite", "xpQuestionnaire") as XpQuestion[] || []
}
export const setXpQuestionnaire = async (updatedQuestions) => {
    (game as any).settings.set("vagabond-lite", "xpQuestionnaire", updatedQuestions)
}

/**
 * Attack registry (keeps last 50)
 */
export const getAttackRegistry = () => {
    return (game.settings as any)?.get("vagabond-lite", "attackRegistry") || {}
}
export const setAttackRegistry = async (attackRegistry) => {
    (game.settings as any)?.set("vagabond-lite", "attackRegistry", attackRegistry)
}

/**
 * Item Shop Toggle
 */
export const getItemShopToggle = (): boolean => {
    return (game.settings as any)?.get("vagabond-lite", "itemShopToggle") || false
}
export const setItemShopToggle = async (toggle: boolean) => {
    (game.settings as any)?.set("vagabond-lite", "itemShopToggle", toggle)
}

/**
 * Progress Clocks
 */
export interface ProgressClockSchema {
    id: string
    x: number
    y: number
    label?: string
    segments: number
    filled: number
}
export const getProgressClocks = (): ProgressClockSchema[] => {
    return (game.settings as any)?.get("vagabond-lite", "progressClocks") || []
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
export interface CountdownSchema {
    id: string
    x: number
    y: number
    label?: string
    result: CountdownResult
}
export const getCountdowns = (): CountdownSchema[] => {
    return (game.settings as any)?.get("vagabond-lite", "countdowns") || []
}
export const setCountdowns = async (countdowns: CountdownSchema[]) => {
    await updateSetting("countdowns", countdowns)
}
export const checkCountdownPermission = (): boolean => {
    return checkPermissionLevel("countdownPermissionLevel")
}
export const deleteAllCountdowns = async () => {
    await updateSetting("countdowns", [])
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
            actorId: actorId,
            tokenUuid: tokenUuid,
            name: label,
            duration: duration,
            status: status?.id,
            damageType: status?.damageType
        }
    }
    await setCountdowns([...getCountdowns(), newCountdown])
}

export const getManaEnforcement = (): boolean => {
    return (game.settings as any)?.get("vagabond-lite", "enforceMana")
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
        await (game.settings as any)?.set("vagabond-lite", setting, update)
    }
    else {
        const payload = {
            user: game.user.id, action: "updateGameSetting",
            data: { setting: setting, update: update }
        }
        game.socket?.emit("system.vagabond-lite", payload)
    }
}

/**
 * Universal settings permission checker. Options are 'gmOnly' or 'everyone'.
 * Enhance as needed to additionally control visibility as well as editability.
 */
const checkPermissionLevel = (settingName: string): boolean => {
    const setting = (game.settings as any)?.get("vagabond-lite", settingName) || 'gmOnly'
    return setting === 'everyone' || (
        setting === 'gmOnly' && (
            (game.user?.isGM ?? false) || (game.user?.isActiveGM ?? false)
        )
    )
}