import { useCallback, useState } from "react"
import { Coins, consolidateCoins } from "../../model/common/CoinValue"
import { CoinAppView } from "./CoinAppView"

export const useCoinApp = () => {
    const [mode, setMode] = useState<'add' | 'subtr'>('add')
    const [coin, setCoin] = useState<Coins>({ g: 0, s: 0, c: 0 })

    const reset = useCallback(() => {
        setMode('add')
        setCoin({ g: 0, s: 0, c: 0 })
    }, [])

    const onUpdateCoins = useCallback((coins) => {
        setCoin(consolidateCoins(coins))
    }, [])

    return { CoinApp: CoinAppView, coinAppCoin: coin, mode, setMode, onUpdateCoins, reset }
}