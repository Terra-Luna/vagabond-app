import { useCallback, useState } from "react"
import { Checkbox } from "../../view/component/Checkbox"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { getItemShopToggle, setItemShopToggle } from "./VagabondSettingsRegistry"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { CountdownApp } from "../countdown/CountdownApp"
import { UtilityButton } from "../../view/component/Button"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        setItemShopToggle(checked)
    }, [])

    const createNewCountdown = useCallback((duration: number) => {
        new CountdownApp(`Cd${duration}`, duration).render({ force: true })
    }, [])

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col grow bg-sheet-main-fill p-2">
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

                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}