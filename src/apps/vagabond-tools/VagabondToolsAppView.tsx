import { useCallback, useState } from "react"
import { Checkbox } from "../../view/component/Checkbox"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { getItemShopToggle, getProgressClocks, setItemShopToggle, setProgressClocks } from "./VagabondSettingsRegistry"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { CountdownApp } from "../countdown/CountdownApp"
import { UtilityButton } from "../../view/component/Button"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        await setItemShopToggle(checked)
    }, [])

    const createNewCountdown = useCallback((duration: number) => {
        new CountdownApp(`Cd${duration}`, duration).render({ force: true })
    }, [])

    async function createNewProgressClock(clockName = "Progress Clock") {
        const defaultSegments = 4
        const centerX = window.innerWidth / 4
        const centerY = window.innerHeight / 4
        const existingClocks = getProgressClocks()

        const newClock = {
            id: foundry.utils.randomID(),
            name: clockName,
            x: centerX,
            y: centerY,
            value: 0,
            max: defaultSegments
        }

        setProgressClocks([...existingClocks, newClock])
    }

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col gap-y-2 grow bg-sheet-main-fill p-2">
                    <Checkbox
                        label="Toggle Item Shop"
                        checked={shopToggle}
                        onCheckedChanged={(checked) => handleShopToggle(checked)}
                    />

                    <div className="flex gap-x-1">
                        <UtilityButton onClick={() => createNewCountdown(4)}>Cd4</UtilityButton>
                        <UtilityButton onClick={() => createNewCountdown(6)}>Cd6</UtilityButton>
                        <UtilityButton onClick={() => createNewCountdown(8)}>Cd8</UtilityButton>
                    </div>

                    <div>
                        <UtilityButton onClick={() => createNewProgressClock()}>Progress Clock</UtilityButton>
                    </div>

                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}