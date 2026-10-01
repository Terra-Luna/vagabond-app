import { useCallback } from "react"

import { VagabondSettingsRegistry } from "../../../../../../apps/vagabond-tools/VagabondSettingsRegistry"
import { sys_id } from "../../../../../../utils/foundryUtils"
import { StatsDrawerContext } from "./StatsDrawerContext"

export const StatsDrawerContextProvider = ({ id, children }) => {

    const settingKey = `hero-sheet-stats-hide-${id}` as any

    VagabondSettingsRegistry.registerClientSetting(settingKey, true)

    const toggleStatsDrawer = useCallback(async () => {
        VagabondSettingsRegistry.toggleClientSetting(settingKey, id)
    }, [])

    let isStatsDrawerOpen: boolean
    try {
        const raw = game.settings?.get(sys_id, settingKey)
        isStatsDrawerOpen = raw !== undefined && raw !== null ? Boolean(raw) : true
    } catch {
        isStatsDrawerOpen = true
    }

    return (
        <StatsDrawerContext.Provider value={{
            isStatsDrawerOpen,
            toggleStatsDrawer
        }}>
            {children}
        </StatsDrawerContext.Provider>
    )
}