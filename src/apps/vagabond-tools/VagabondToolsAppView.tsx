import { useCallback, useState } from "react"
import { Checkbox } from "../../view/component/Checkbox"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { getItemShopToggle, setItemShopToggle } from "./VagabondSettingsRegistry"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        setItemShopToggle(checked)

    }, [])

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col grow bg-sheet-main-fill">
                    <Checkbox
                        label="Toggle Item Shop"
                        checked={shopToggle}
                        onCheckedChanged={(checked) => handleShopToggle(checked)}
                    />
                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}