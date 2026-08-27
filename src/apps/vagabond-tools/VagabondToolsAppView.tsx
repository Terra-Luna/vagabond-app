import { useCallback, useState } from "react"

import { UtilityButton } from "../../view/component/Button"
import { Checkbox } from "../../view/component/Checkbox"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { TrashButton } from "../../view/component/TrashButton"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { addCountdown, deleteAllCountdowns, deleteAllProgressClocks, getItemShopToggle, getProgressClocks, ProgressClockSchema, setItemShopToggle, setProgressClocks } from "./usecase/VagabondSettingsHelper"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        await setItemShopToggle(checked)
    }, [])

    const spawnPoint = useCallback(() => {
        const x = 0.1
        const y = 0.2
        return { x: x, y: y }
    }, [])

    const createNewCountdown = useCallback(async (label: string, duration: number) => {
        const { x, y } = spawnPoint()
        await addCountdown(label, duration, x, y)
    }, [])

    const createNewProgressClock = useCallback(async (clockName = "Clock", duration = 4) => {
        const { x, y } = spawnPoint()
        const existingClocks = getProgressClocks()

        const newClock = {
            id: foundry.utils.randomID(),
            x: x, y: y,
            label: clockName,
            segments: duration,
            filled: 0
        } as ProgressClockSchema

        setProgressClocks([...existingClocks, newClock])
    }, [])

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col gap-y-2 grow bg-sheet-main-fill p-2 font-eskapade font-bold">
                    <div>
                        <p>Countdowns</p>
                        <div className="flex gap-x-1 items-center">
                            <UtilityButton onClick={() => createNewCountdown("Cd4", 4)}>Cd4</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd6", 6)}>Cd6</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd8", 8)}>Cd8</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd10", 10)}>Cd10</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd12", 12)}>Cd12</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd20", 20)}>Cd20</UtilityButton>
                            <div className="ml-2">
                                <TrashButton title={"Delete all countdowns"} onDelete={async () => await deleteAllCountdowns()} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p>Progress Clocks</p>
                        <div className="flex gap-x-1 items-center">
                            <UtilityButton onClick={() => createNewProgressClock("Prog-2", 2)}>Prog-2</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-4", 4)}>Prog-4</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-6", 6)}>Prog-6</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-8", 8)}>Prog-8</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-12", 12)}>Prog-12</UtilityButton>
                            <div className="ml-2">
                                <TrashButton title={"Delete all clocks"} onDelete={async () => await deleteAllProgressClocks()} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Checkbox
                            label="Toggle Item Shop"
                            checked={shopToggle}
                            onCheckedChanged={(checked) => handleShopToggle(checked)}
                        />
                    </div>

                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}