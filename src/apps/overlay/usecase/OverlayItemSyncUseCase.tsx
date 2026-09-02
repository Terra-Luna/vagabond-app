import { useEffect } from "react"

export const useOverlayItemSync = (setState: (objects) => void, getObjects: () => any, settingsKey: string) => {
    
    useEffect(() => {
        const updateObjects = () => {
            const objects = getObjects()
            setState([...objects])
        }

        updateObjects()

        const onUpdateSetting = (setting: any, change: any) => {
            if (setting.key === settingsKey) {
                updateObjects()
            }
        }

        Hooks.on("updateSetting", onUpdateSetting)
        Hooks.on("canvasReady", updateObjects)

        return () => {
            Hooks.off("updateSetting", onUpdateSetting)
            Hooks.off("canvasReady", updateObjects)
        }
    }, [])
    
}