import { Image as ImageIcon, X } from "lucide-react"

import { appLang } from "../../../../../utils/lang"
import { LightSourceUtil } from "../../../../../utils/LightSourceUtil"
import { Checkbox } from "../../../../component/Checkbox"
import { EditableTextField } from "../../../../component/EditableTextField"
import { IconOnlyButton } from "../../../../component/IconOnlyButton"
import { LightToggleButton } from "../../../../component/LightToggleButton"
import { SingleSelect } from "../../../../component/SingleSelect"
import { Timer } from "../../../../component/Timer"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetProperty } from "./ItemSheetLabelComponent"

export const LightSourceConfig = ({ item }) => {
    const { isEditMode } = useEditMode()
    const light = item.system.lightSourceData
    const isLightSource = !!light?.isLightSource
    const showTimer = LightSourceUtil.showsTimer(light)

    if (!isEditMode && !isLightSource) return null

    return (
        <div>
            <ItemSheetProperty label={appLang.ItemSheet.lightSource} value={
                <Checkbox
                    label={''}
                    onCheckedChanged={(isChecked) => item.update({ 'system.lightSourceData.isLightSource': isChecked })}
                    checked={isLightSource}
                />
            } />

            {showTimer &&
                <ItemSheetProperty label={appLang.ItemSheet.lightRemaining} value={
                <div className="flex items-center gap-x-2">
                    <LightToggleButton item={item.system} isHeld={item.parent?.type === 'hero'} />
                        <Timer
                            running={light.litTS > 0}
                            getSeconds={(now) => LightSourceUtil.remainingSeconds(light, now)}
                    />
                    </div>
                } />
            }

            {isEditMode && isLightSource &&
                <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                    <div className="grid grid-cols-2 gap-x-4">
                        <ItemSheetProperty label={appLang.ItemSheet.lightRange} value={
                            <EditableTextField
                                boundValue={light.range}
                                updateProps={{ object: item, path: ['lightSourceData', 'range'] }}
                                placeholder="30"
                            />
                        } />

                        {showTimer &&
                            <ItemSheetProperty label={appLang.ItemSheet.lightDuration} value={
                                <EditableTextField
                                    boundValue={light.duration}
                                    updateProps={{ object: item, path: ['lightSourceData', 'duration'] }}
                                    placeholder="3600"
                                />
                            } />
                        }

                        <ItemSheetProperty label={appLang.ItemSheet.lightColor} value={
                            <input
                                type="color"
                                className="h-5 w-10 cursor-pointer bg-transparent"
                                value={light.color}
                                onChange={(e) => item.update({ 'system.lightSourceData.color': e.target.value })}
                            />
                        } />

                        <ItemSheetProperty label={appLang.ItemSheet.lightLitImage} value={
                            <div className="flex items-center gap-x-1">
                                {light.litImage &&
                                    <img src={light.litImage} width={24} height={24} className="rounded-sm" />
                                }
                                <IconOnlyButton
                                    Icon={ImageIcon}
                                    size={16}
                                    onClick={() => new foundry.applications.apps.FilePicker({
                                        type: "image",
                                        current: light.litImage ?? '',
                                        callback: (path: string) => item.update({ 'system.lightSourceData.litImage': path })
                                    }).render()}
                                />
                                {light.litImage &&
                                    <IconOnlyButton
                                        Icon={X}
                                        size={16}
                                        onClick={() => item.update({ 'system.lightSourceData.litImage': '' })}
                                    />
                                }
                            </div>
                        } />

                        {item.type !== 'weapon' && <>
                            <ItemSheetProperty label={appLang.ItemSheet.lightRequiresFuel} value={
                                <Checkbox
                                    label={''}
                                    onCheckedChanged={(isChecked) => item.update({ 'system.lightSourceData.requiresFuel': isChecked })}
                                    checked={!!light.requiresFuel}
                                />
                            } />

                            <ItemSheetProperty label={appLang.ItemSheet.lightExpendable} value={
                                <Checkbox
                                    label={''}
                                    onCheckedChanged={(isChecked) => item.update({ 'system.lightSourceData.expendable': isChecked })}
                                    checked={!!light.expendable}
                                />
                            } />

                        </>}
                        <div className="col-span-2">
                            <ItemSheetProperty label={appLang.ItemSheet.lightType} value={
                                <SingleSelect
                                    options={[
                                        { value: 'none', label: appLang.ItemSheet.lightTypeNone },
                                        { value: 'sunlight', label: appLang.ItemSheet.sunlight },
                                        { value: 'moonlight', label: appLang.ItemSheet.moonlight },
                                        { value: 'dark', label: appLang.ItemSheet.darkLight }
                                    ]}
                                    value={light.isSunlight ? 'sunlight' : (light.isMoonlight ? 'moonlight' : (light.isDark ? 'dark' : 'none'))}
                                    setValue={(val) => item.update({
                                        'system.lightSourceData.isSunlight': val === 'sunlight',
                                        'system.lightSourceData.isMoonlight': val === 'moonlight',
                                        'system.lightSourceData.isDark': val === 'dark'
                                    })}
                                />
                            } />
                        </div>

                    </div>
                </EditModeContextProvider>
            }
        </div>
    )
}
