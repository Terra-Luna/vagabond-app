import { CoinsIcon } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { Coins } from "../../model/common/CoinValue"
import { lang } from "../../utils/lang"
import { glowOnHover } from "../common/text-styles"
import { EditableTextField } from "./EditableTextField"

export const CoinPurse = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className={"flex pl-2 content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"}>
            <div
                className={`${glowOnHover} content-center`}
                onClick={() =>
                    ui.notifications?.info("TODO: make an interface for adding/subtracting coin amts...")
                }>
                <CoinsIcon className="text-wealth-denom-label" size={28} />
            </div>
            <div className="flex content-center justify-end w-full">
                <CoinValue hero={hero} value={hero.inventory.coins.g ?? 0} label={lang.VGLITE.HeroSheet.gold} path='g' />
                <CoinValue hero={hero} value={hero.inventory.coins.s ?? 0} label={lang.VGLITE.HeroSheet.silver} path='s' />
                <CoinValue hero={hero} value={hero.inventory.coins.c ?? 0} label={lang.VGLITE.HeroSheet.copper} path='c' />
            </div>
        </div>
    )
}

export const CoinPurseReadOnly = ({ coins }: { coins: Coins }) => {
    return (
        <div className={"flex pl-2 content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"}>
            <div
                className={`${glowOnHover} content-center`}
                onClick={() =>
                    ui.notifications?.info("TODO: make an interface for adding/subtracting coin amts...")
                }>
                <CoinsIcon className="text-wealth-denom-label" size={28} />
            </div>
            <div className="flex content-center justify-end w-full">
                <CoinValue value={coins.g ?? 0} label={lang.VGLITE.HeroSheet.gold} path='g' />
                <CoinValue value={coins.s ?? 0} label={lang.VGLITE.HeroSheet.silver} path='s' />
                <CoinValue value={coins.c ?? 0} label={lang.VGLITE.HeroSheet.copper} path='c' />
            </div>
        </div>
    )
}

const CoinValue = ({ hero, value, label, path }: { hero?: HeroDataModel, value: number, label: string, path: string }) => {
    return (
        <div className="flex pr-2">
            <div className={`text-text-primary text-3xl font-eskapade cursor-pointer min-w-[2ch] text-right ${glowOnHover}`}>
                {hero ?
                    <EditableTextField
                        boundValue={value.toString() ?? ""}
                        updateProps={{
                            object: hero.parent,
                            path: ['inventory', 'coins', path]
                        }}
                        placeholder="0"
                        hideBorderOnEditMode={true}
                    /> :
                    <p>{value}</p>
                }
            </div>
            <div className={"text-wealth-denom-label text-sm content-end"}>{label}</div>
        </div>
    )
}