import { appLang } from "../../utils/lang"
import { tableBorderRounded } from "../../view/common/border-styles"
import { PopOutWidget } from "../../view/component/Widget"

const denominations = ['g', 's', 'c']

/**
 * This is the decoupled view for CoinApp.tsx
 * @param param0
 * @returns 
 */
export const CoinAppView = ({ coin, mode, setMode, onUpdateCoins, onSave, onCancel }) => {
    return (
        <PopOutWidget label="Add or remove coins" onCancel={onCancel} onSave={onSave}>
            <div className={`flex items-center cursor-pointer h-full w-full ${tableBorderRounded}`} onClick={() => setMode(mode === 'add' ? 'subtr' : 'add')}>
                <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-l-md ${mode === 'add' ? 'bg-ic-luck/50' : 'bg-sheet-main-fill'}`}>+</div>
                <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-r-md ${mode === 'add' ? 'bg-sheet-main-fill' : 'bg-destructive-action/50'}`}>-</div>
            </div>
            <div className="flex gap-x-2">
                {
                    denominations.map(denomination => (
                        <div key={denomination} className={`
                                flex items-end text-3xl text-text-primary font-eskapade hover-glow
                                ${tableBorderRounded} p-1
                            `}>
                            <input
                                className="w-16 mr-1"
                                value={coin[denomination] ?? 0}
                                placeholder="0"
                                type="number"
                                onChange={(e) => {
                                    onUpdateCoins({ ...coin, [denomination]: Math.max(0, Number(e.target.value)) })
                                }}
                            />
                            <p className="text-sm text-wealth-denom-label font-bold">{appLang.HeroSheet.Currency[denomination]}</p>
                        </div>
                    ))
                }
            </div>
        </PopOutWidget>
    )
}