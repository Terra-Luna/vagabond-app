import { appLang } from "../../../../../utils/lang"
import { Tooltip } from "../../../../component/Tooltip"

export const WeaponPropsList = ({ weaponProps, textStyles }: { weaponProps: string[], textStyles?: string }) => {
    return (<div>
        {weaponProps && weaponProps.length > 0 && (
            <div className="flex flex-wrap gap-x-1">
                {weaponProps.map((prop: string, index: number) => (
                    <Tooltip key={`${prop}-${index}`} title={appLang.WeaponProps[prop]?.name ?? prop} content={appLang.WeaponProps[prop]?.description}>
                        <p className={`${textStyles ?? 'text-sm text-text-tertiary font-paradigm font-normal italic'}`}>
                        {appLang.WeaponProps[prop]?.name ?? prop}
                        {index < weaponProps.length - 1 && ","}
                    </p>
                    </Tooltip>
                ))}
            </div>
        )}
    </div>)
}