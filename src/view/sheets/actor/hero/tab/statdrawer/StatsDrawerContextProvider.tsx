import { useCallback, useState } from "react"
import { StatsDrawerContext } from "./hooks"

export const StatsDrawerContextProvider = ({ children }) => {
    const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(true)
    const toggleStatsDrawer = useCallback(() => setIsStatsDrawerOpen(!isStatsDrawerOpen), [isStatsDrawerOpen])
    return (
        <StatsDrawerContext.Provider value={{
            isStatsDrawerOpen,
            toggleStatsDrawer
        }}>
            {children}
        </StatsDrawerContext.Provider>
    )
}