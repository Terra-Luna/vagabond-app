import { vgLiteLang } from "../../utils/lang"
import { glowOnHover } from "../../view/common/text-styles"
import { PrimaryButton, DestructiveButton } from "../../view/component/Button"

const denominations = ['g', 's', 'c']

/**
 * This is the decoupled view for CoinApp.tsx
 * @param param0
 * @returns 
 */
export const CoinAppView = ({ coin, mode, setMode, onUpdateCoins, onSave, onCancel }) => {
    return (
        <div className="border-2 border-solid border-table-border rounded-md bg-wealth-fill p-2 space-y-4">
            <div className="flex gap-x-2 items-center">
                <div className="flex items-center border border-solid border-table-border rounded-md cursor-pointer h-full w-full" onClick={() => setMode(mode === 'add' ? 'subtr' : 'add')}>
                    <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-l-md ${mode === 'add' ? 'bg-ic-luck/50' : 'bg-sheet-main-fill'}`}>+</div>
                    <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-r-md ${mode === 'add' ? 'bg-sheet-main-fill' : 'bg-destructive-action/50'}`}>-</div>
                </div>
                <div className="flex gap-x-2">
                    {
                        denominations.map(denomination => (
                            <div key={denomination} className={`
                                flex items-end text-3xl text-text-primary font-eskapade ${glowOnHover}
                                border border-solid border-table-border rounded-sm p-1
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
                                <p className="text-sm text-wealth-denom-label font-bold">{vgLiteLang.HeroSheet.Currency[denomination]}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="flex w-full items-center">
                <p className="text-sm font-eskapade font-normal">Add or remove coins</p>
                <div className="flex gap-x-1 justify-end w-full">
                    <PrimaryButton onClick={onSave}>
                        <p>{vgLiteLang.ButtonActions.save}</p>
                    </PrimaryButton>
                    <DestructiveButton onClick={onCancel}>
                        <p>{vgLiteLang.ButtonActions.cancel}</p>
                    </DestructiveButton>
                </div>
            </div>
        </div>
    )
}