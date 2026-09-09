import { useCallback, useState } from "react"

import { Coins, consolidateCoins, zeroCoins } from "../../model/common/CoinValue"
import { CoinAppView } from "./CoinAppView"

/**
 * This "app" is opened from the Hero sheet's inventory tab
 * and can be used for adding/subtracting coin values.
 * @returns
 */
export const useCoinApp = () => {
    const [mode, setMode] = useState<'add' | 'subtr'>('add')
    const [coin, setCoin] = useState<Coins>({ ...zeroCoins })

    const reset = useCallback(() => {
        setMode('add')
        setCoin({ ...zeroCoins })
    }, [])

    const onUpdateCoins = useCallback((coins) => {
        setCoin(consolidateCoins(coins))
    }, [])

    return { CoinApp: CoinAppView, coinAppCoin: coin, mode, setMode, onUpdateCoins, reset }
}