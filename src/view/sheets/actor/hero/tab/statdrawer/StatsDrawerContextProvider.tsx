import { useCallback } from "react"

import { VagabondSettingsRegistry } from "../../../../../../apps/vagabond-tools/VagabondSettingsRegistry"
import { StatsDrawerContext } from "./StatsDrawerContext"

export const StatsDrawerContextProvider = ({ id, children }) => {

    const settingKey = `hero-sheet-stats-hide-${id}` as any

    VagabondSettingsRegistry.registerClientSetting(settingKey)

    const toggleStatsDrawer = useCallback(async () => {
        VagabondSettingsRegistry.toggleClientSetting(settingKey, id)
    }, [])

    const isStatsDrawerOpen = !game.settings?.get("vagabond-lite" as any, settingKey)

    return (
        <StatsDrawerContext.Provider value={{
            isStatsDrawerOpen,
            toggleStatsDrawer
        }}>
            {children}
        </StatsDrawerContext.Provider>
    )
}