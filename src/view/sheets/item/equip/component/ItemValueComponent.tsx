import { appLang } from "../../../../../utils/lang"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ItemSheetProperty } from "./ItemSheetLabelComponent"

export const ItemValue = ({ item }) => {
    return (<>
        {item.system.value &&
            <ItemSheetProperty
                label={appLang.ItemSheet.value}
                value={
                    <div className="flex gap-x-1">
                    <CoinDisplay item={item} label={appLang.ItemSheet.g} path={'g'} />
                    <CoinDisplay item={item} label={appLang.ItemSheet.s} path={'s'} />
                    <CoinDisplay item={item} label={appLang.ItemSheet.c} path={'c'} />
                </div>
            } />
        }
    </>)
}

const CoinDisplay = ({ item, label, path }) => {
    const { isEditMode } = useEditMode()

    return (
        <div className="flex">
            <div className={`text-text-primary text-xl font-eskapade min-w-[2ch] text-right`}>
                {isEditMode
                    ? <EditableTextField
                        boundValue={item.system.value[path] ?? ''}
                        updateProps={{ object: item, path: ['value', path] }}
                        placeholder="0"
                    />
                    : <p>{item.system.totalValue[path]}</p>
                }
            </div>
            <div className={"text-wealth-denom-label text-xs content-end"}>{label}</div>
        </div>
    )
}