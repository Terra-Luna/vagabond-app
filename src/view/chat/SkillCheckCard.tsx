import lang from "../../../public/lang/en.json"
import { SkillCheckResult } from '../../combat/dice-rolls'
import { useContextMenu } from '../component/ContextMenu'
import { Minus, Plus, Trash } from 'lucide-react'
import { tableBorder } from '../common/border-styles'
import { DiceRoll } from './DiceRoll'
import { glowOnHover } from "../sheets/VgLiteSheet"

const chatCardBodyStyle = `${tableBorder} rounded-md text-text-primary text-lg font-eskapade font-bold bg-sheet-main-fill p-2`

export const SkillCheckChatCard = ({ portrait, result }: { portrait: string, result: SkillCheckResult }) => {
    //const { onCtxMenu, ContextMenu } = useContextMenu()
    const [resultTextColor, resultBorderColor] = result.result === lang.VGLITE.RollResult.failure ? ['text-failure', 'border-failure'] : ['text-success', 'border-success']
    return (
        <div
            className={chatCardBodyStyle}
            /* onContextMenu={(e) => onCtxMenu(e, [
                { icon: Trash, label: 'Delete', action: () => { console.log("Delete - clicked!") }, isDestructive: true }
            ])} */>
            <div>
                <ResultBanner portrait={portrait} title={result.skillName} borderColor={resultBorderColor} />
                <DiceGraphics d20={result.d20} d6={result.d6} favHinder={result.favorHinder} />
                <TotalsFooter total={result.total} difficulty={result.difficulty} csf={result.result} resultTextColor={resultTextColor} />
            </div>
            {/* <ContextMenu /> */}
        </div>
    )
}

const ResultBanner = ({ portrait, title, borderColor }: { portrait: string, title: string, borderColor: string }) => {
    const border = `border border-solid ${borderColor} rounded-sm p-1`
    return (
        <div className={`flex space-x-1 items-center bg-sheet-header-fill ${border}`}>
            <img className={`object-contain h-[54px] w-[54px]`} src={portrait} alt={'hero'} />
            <div className="text-text-header-primary">
                <div className="text-2xl mr-1">{title} Check</div>
            </div>
        </div>
    )
}

const DiceGraphics = ({ d20, d6, favHinder }) => {
    return (
        <div className="flex gap-x-2 mt-2 justify-center">
            <DiceRoll faces={20} result={d20} />
            {
                favHinder !== lang.VGLITE.FavorHinder.none ?
                    <div className="flex gap-x-2">
                        <div className="h-full content-center">{
                            favHinder === lang.VGLITE.FavorHinder.favor ?
                                <Plus size={18} strokeWidth={4} /> :
                                <Minus size={18} strokeWidth={4} />
                        }</div>
                        <DiceRoll faces={6} result={d6} />
                    </div> : <></>
            }
        </div>
    )
}

const TotalsFooter = ({ total, difficulty, csf, resultTextColor }) => {
    return (
        <div className="flex mt-2 space-x-2 h-fit items-end">
            <p className="font-paradigm font-normal">Total:</p>
            <p className="text-4xl mr-4">{total}</p>
            <p className="font-paradigm font-normal">vs:</p>
            <p className="text-xl">{difficulty}</p>
            <p className={`${resultTextColor} text-xl ml-auto mr-2 [text-shadow:0_0_10px_var(--color-text-glow)]`}>{csf}</p>
        </div>
    )
}