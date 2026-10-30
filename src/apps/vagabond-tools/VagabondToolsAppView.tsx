import { useCallback, useState } from "react"

import { appLang } from "../../utils/lang"
import { UtilityButton } from "../../view/component/Button"
import { Checkbox } from "../../view/component/Checkbox"
import { FoundryHotkeyBlocker } from "../../view/component/FoundryHotkeyBlocker"
import { TrashButton } from "../../view/component/TrashButton"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { ConfirmationDialog } from "./dialog/ConfirmationDialog"
import { PolymorphApp } from "./polymorph/PolymorphApp"
import { CountdownManager } from "./usecase/CountdownManager"
import { addProgressClock, deleteAllProgressClocks, getItemShopToggle, getProgressClocks, setItemShopToggle } from "./usecase/VagabondSettingsHelper"

export const VagabondToolsAppView = () => {
    const [shopToggle, setShopToggle] = useState<boolean>(getItemShopToggle())
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, title: "", message: "", onAccept: () => { } })

    const handleShopToggle = useCallback(async (checked: boolean) => {
        setShopToggle(checked)
        await setItemShopToggle(checked)
    }, [])

    const createNewCountdown = useCallback(async (label: string, duration: number) => {
        await CountdownManager.add(label, duration)
    }, [])

    const createNewProgressClock = useCallback(async (clockName = appLang.VagabondTools.defaultClockName, duration = 4) => {
        await addProgressClock(clockName, duration)
    }, [])

    return (
        <FoundryHotkeyBlocker>
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <div className="flex flex-col gap-y-2 grow bg-sheet-main-fill p-2 text-text-primary font-eskapade font-bold">
                    <div>
                        <p>{appLang.VagabondTools.countdowns}</p>
                        <div className="flex gap-x-1 items-center">
                            <UtilityButton onClick={() => createNewCountdown("Cd4", 4)}>Cd4</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd6", 6)}>Cd6</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd8", 8)}>Cd8</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd10", 10)}>Cd10</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd12", 12)}>Cd12</UtilityButton>
                            <UtilityButton onClick={() => createNewCountdown("Cd20", 20)}>Cd20</UtilityButton>
                            <div className="ml-2">
                                <TrashButton title={appLang.VagabondTools.deleteAllCountdownsTooltip} onClick={async () => {
                                    if (CountdownManager.getAll().length > 0) {
                                        setDeleteConfirmation({
                                            isOpen: true,
                                            title: appLang.VagabondTools.deleteAllCountdowns,
                                            message: appLang.VagabondTools.deleteCountdownsConfirmation,
                                            onAccept: CountdownManager.deleteAll
                                        })
                                    }
                                }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p>{appLang.VagabondTools.progressClocks}</p>
                        <div className="flex gap-x-1 items-center">
                            <UtilityButton onClick={() => createNewProgressClock("Prog-2", 2)}>Prog-2</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-4", 4)}>Prog-4</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-6", 6)}>Prog-6</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-8", 8)}>Prog-8</UtilityButton>
                            <UtilityButton onClick={() => createNewProgressClock("Prog-12", 12)}>Prog-12</UtilityButton>
                            <div className="ml-2">
                                <TrashButton title={appLang.VagabondTools.deleteAllClocksTooltip} onClick={async () => {
                                    if (getProgressClocks().length > 0) {
                                        setDeleteConfirmation({
                                            isOpen: true,
                                            title: appLang.VagabondTools.deleteAllProgressClocks,
                                            message: appLang.VagabondTools.deleteProgressClocksConfirmation,
                                            onAccept: deleteAllProgressClocks
                                        })
                                    }
                                }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p>{appLang.VagabondTools.specialEffects}</p>
                        <div className="flex gap-x-2 items-end">
                            <UtilityButton onClick={() => {
                                const selected = canvas?.tokens?.controlled[0]?.actor as any ?? game.user?.targets?.first()?.actor as any
                                if (selected) {
                                    new PolymorphApp({ caster: selected }).render({ force: true })
                                }
                            }}>
                                Polymorph
                            </UtilityButton>
                            <p className="text-text-secondary font-normal">as selected token</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p>{appLang.VagabondTools.settings}</p>
                        <Checkbox
                            label={appLang.VagabondTools.toggleItemShop}
                            color="text-text-primary font-normal"
                            checked={shopToggle}
                            onCheckedChanged={(checked) => handleShopToggle(checked)}
                        />
                    </div>

                    <ConfirmationDialog
                        isOpen={deleteConfirmation.isOpen}
                        onClose={() => { setDeleteConfirmation(state => ({ ...state, isOpen: false })) }}
                        onConfirm={() => deleteConfirmation.onAccept()}
                        title={deleteConfirmation.title}
                        description={deleteConfirmation.message}
                        confirmText={appLang.VagabondTools.confirmDeleteAll}
                        variant="destructive"
                    />

                </div>
            </EditModeContextProvider>
        </FoundryHotkeyBlocker>
    )
}