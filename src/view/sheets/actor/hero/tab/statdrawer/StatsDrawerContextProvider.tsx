import { useCallback } from "react"
import { StatsDrawerContext } from "./StatsDrawerContext"
import { fields } from "../../../../../../model/common/sharedSchemas"

export const StatsDrawerContextProvider = ({ id, children }) => {

    const settingKey = `hero-sheet-stats-hide-${id}` as any

    game.settings?.register("vagabond-lite" as any, settingKey, {
        name: "Hero Sheet Setting",
        hint: "Hero Sheet Dynamic Setting",
        scope: "client",
        type: new fields.BooleanField(),
        default: false
    })

    const toggleStatsDrawer = useCallback(async () => {
        const isHidden = game.settings?.get("vagabond-lite" as any, settingKey)
        await game.settings?.set("vagabond-lite" as any, settingKey, !isHidden)
        game.actors?.get(id)?.render()
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