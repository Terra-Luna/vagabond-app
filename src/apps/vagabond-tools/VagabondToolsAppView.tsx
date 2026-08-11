import { useCallback, useState } from "react"
import { Checkbox } from "../../view/component/Checkbox"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { getCountdowns, getItemShopToggle, getProgressClocks, setCountdowns, setItemShopToggle, setProgressClocks } from "./VagabondSettingsRegistry"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { CountdownApp } from "../countdown/CountdownApp"
import { UtilityButton } from "../../view/component/Button"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        await setItemShopToggle(checked)
    }, [])

    const spawnPoint = useCallback(() => {
        const centerX = window.innerWidth / 4
        const centerY = window.innerHeight / 4
        return { x: centerX, y: centerY }
    }, [])

    const createNewProgressClock = useCallback(async (clockName = "Progress Clock") => {
        const defaultSegments = 4
        const { x, y } = spawnPoint()
        const existingClocks = getProgressClocks()

        const newClock = {
            id: foundry.utils.randomID(),
            x: x, y: y,
            name: clockName,
            value: 0,
            max: defaultSegments
        }

        setProgressClocks([...existingClocks, newClock])
    }, [])

    const createNewCountdown = useCallback(async (duration: number) => {
        const { x, y } = spawnPoint()
        const existingCds = getCountdowns()

        const newCountdown = {
            id: foundry.utils.randomID(),
            x: x, y: y,
            result: { name: "Cd4", duration: duration }
        }

        setCountdowns([...existingCds, newCountdown])
    }, [])

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col gap-y-2 grow bg-sheet-main-fill p-2">
                    <Checkbox
                        label="Toggle Item Shop"
                        checked={shopToggle}
                        onCheckedChanged={(checked) => handleShopToggle(checked)}
                    />

                    <div>
                        <p>Create Countdown</p>
                        <div className="flex gap-x-1">
                            <UtilityButton onClick={() => createNewCountdown(4)}>Cd4</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown(6)}>Cd6</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown(8)}>Cd8</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown(10)}>Cd10</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown(12)}>Cd12</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown(20)}>Cd20</UtilityButton>
                        </div>
                    </div>

                    <div>
                        <p>Progress Clocks</p>
                        <UtilityButton onClick={() => createNewProgressClock()}>Progress Clock</UtilityButton>
                    </div>

                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}