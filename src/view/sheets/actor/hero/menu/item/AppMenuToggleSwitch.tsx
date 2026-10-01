import { ToggleLeft, ToggleRight } from "lucide-react"
import { useCallback } from "react"

import { VagabondSettingsRegistry } from "../../../../../../apps/vagabond-tools/VagabondSettingsRegistry"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"
import { sys_id } from "../../../../../../utils/foundryUtils"
import { ItemDivider } from "../../../../../component/Header"

export const AppMenuToggleSwitch = ({
    label,
    hero,
    toggleKey,
}: {
    label: string
    hero: HeroDataModel
    toggleKey: string
}) => {
    const fullKey = `${toggleKey}-${hero.parent.id}`

    VagabondSettingsRegistry.registerClientSetting(fullKey, true)
    let toggleState: boolean
    try {
        const raw = (game.settings as any)?.get(sys_id, fullKey)
        toggleState = raw !== undefined && raw !== null ? Boolean(raw) : true
    } catch {
        toggleState = true
    }

    const handleToggle = useCallback(async () => {
        try {
            VagabondSettingsRegistry.registerClientSetting(fullKey, true)
            await VagabondSettingsRegistry.toggleClientSetting(fullKey, hero.parent.id)
        } catch (err) {
            console.error(err)
        }
    }, [fullKey, hero.parent.id])

    return (
        <div>
            <ItemDivider />

            <div className="flex items-center justify-between mt-2">
                <p>{label}</p>

                {toggleState ? (
                    <ToggleRight
                        className="text-text-header-tertiary cursor-pointer hover-glow self-center"
                        onClick={handleToggle}
                    />
                ) : (
                    <ToggleLeft
                            className="text-context-menu-text/50 cursor-pointer hover-glow self-center"
                        onClick={handleToggle}
                    />
                )}
            </div>
        </div>
    )
}