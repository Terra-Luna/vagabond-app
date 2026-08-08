import { useCallback, useState } from "react"
import { useCoinApp } from "../../apps/shop/CoinApp"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { addCoins, Coins, isAffordable, subtractCoins } from "../../model/common/CoinValue"
import { lang } from "../../utils/lang"
import { EditableTextField } from "./EditableTextField"

export const HeroCoinPurse = ({ hero }: { hero: HeroDataModel }) => {
    const { CoinApp, coinAppCoin, mode, setMode, onUpdateCoins, reset } = useCoinApp()
    const [isCoinAppOpen, setIsCoinAppOpen] = useState(false)

    const onCoinAppSave = useCallback(() => {
        if (mode === 'add') {
            hero.parent.update({
                'system.inventory.coins': addCoins([hero.inventory.coins, coinAppCoin])
            })
            setIsCoinAppOpen(false)
            reset()
        }
        else if (isAffordable(hero.inventory.coins, coinAppCoin)) {
            hero.parent.update({
                'system.inventory.coins': subtractCoins(hero.inventory.coins, coinAppCoin)
            })
            setIsCoinAppOpen(false)
            reset()
        }
        else {
            ui.notifications?.warn("Not enough funds!")
        }
    }, [coinAppCoin, mode, reset, hero.inventory.coins])

    return (
        <div className={"relative flex pl-2 content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"}>
            <button title={"Click to add/subtract coins"} onClick={() => {
                reset()
                setIsCoinAppOpen(true)
            }}>
                <div className={`hover-glow content-center`}>
                    <p className="text-lg text-wealth-denom-label font-eskapade font-bold">COIN</p>
                </div>
            </button>
            <div className="flex content-center justify-end w-full">
                <CoinValue hero={hero} value={hero.inventory.coins.g ?? 0} label={lang.VGLITE.HeroSheet.Currency.g} path='g' />
                <CoinValue hero={hero} value={hero.inventory.coins.s ?? 0} label={lang.VGLITE.HeroSheet.Currency.s} path='s' />
                <CoinValue hero={hero} value={hero.inventory.coins.c ?? 0} label={lang.VGLITE.HeroSheet.Currency.c} path='c' />
            </div>

            {isCoinAppOpen &&
                <CoinApp
                    coin={coinAppCoin}
                    mode={mode}
                    setMode={setMode}
                    onUpdateCoins={onUpdateCoins}
                    onSave={() => onCoinAppSave()}
                    onCancel={() => setIsCoinAppOpen(false)}
                />
            }
        </div>
    )
}

export const ReadOnlyCoinPurse = ({ coins }: { coins: Coins }) => {
    return (
        <div className={"flex pl-2 content-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"}>
            <div className="content-center">
                <p className="text-2xl text-wealth-denom-label font-eskapade font-bold">FUNDS</p>
            </div>
            <div className="flex content-center justify-end w-full">
                <CoinValue value={coins.g ?? 0} label={lang.VGLITE.HeroSheet.Currency.g} path='g' />
                <CoinValue value={coins.s ?? 0} label={lang.VGLITE.HeroSheet.Currency.s} path='s' />
                <CoinValue value={coins.c ?? 0} label={lang.VGLITE.HeroSheet.Currency.c} path='c' />
            </div>
        </div>
    )
}

const CoinValue = ({ hero, value, label, path }: { hero?: HeroDataModel, value: number, label: string, path: string }) => {
    return (
        <div className="flex pr-2">
            <div className={`text-text-primary text-3xl font-eskapade cursor-pointer min-w-[2ch] text-right hover-glow`}>
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