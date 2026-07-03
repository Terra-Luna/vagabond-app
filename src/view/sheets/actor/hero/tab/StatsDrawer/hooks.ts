import { createContext, useContext } from "react"

export const StatsDrawerContext = createContext({
    isStatsDrawerOpen: true,
    toggleStatsDrawer: () => { }
})

export const useStatsDrawerStatus = () => useContext(StatsDrawerContext)