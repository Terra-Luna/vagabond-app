import { vgLiteLang } from "../../../../../utils/lang"
import { EditableTextField } from "../../../../component/EditableTextField"
import { ItemSheetProperty } from "./ItemSheetLabelComponent"

export const ItemValue = ({ item }) => {
    return (<>
        {
            item.system.value ?
                <ItemSheetProperty label={vgLiteLang.ItemSheet.value} value={
                    <div className="flex gap-x-1">
                        <CoinDisplay item={item} label={vgLiteLang.ItemSheet.g} path={'g'} />
                        <CoinDisplay item={item} label={vgLiteLang.ItemSheet.s} path={'s'} />
                        <CoinDisplay item={item} label={vgLiteLang.ItemSheet.c} path={'c'} />
                    </div>
                } /> : <></>
        }
    </>)
}

const CoinDisplay = ({ item, label, path }) => {
    return (
        <div className="flex">
            <div className={`text-text-primary text-xl font-eskapade min-w-[2ch] text-right`}>
                <EditableTextField
                    boundValue={item.system.value[path] ?? ''}
                    updateProps={{ object: item, path: ['value', path] }}
                    placeholder="0"
                />
            </div>
            <div className={"text-wealth-denom-label text-xs content-end"}>{label}</div>
        </div>
    )
}