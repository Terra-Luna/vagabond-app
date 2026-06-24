import lang from "../../../public/lang/en.json"
import { SkillCheckResult } from '../../combat/dice-rolls'
import { Minus, Plus } from 'lucide-react'
import { tableBorder } from '../common/border-styles'
import { DiceRoll } from './DiceRoll'
import { Divider } from "../component/Header"

const chatCardBodyStyle = `${tableBorder} rounded-md text-text-primary text-lg font-eskapade font-bold bg-sheet-main-fill`

export const SkillCheckChatCard = ({ portrait, result }: { portrait: string, result: SkillCheckResult }) => {
    const [resultTextColor] = result.result === lang.VGLITE.RollResult.failure ? ['text-failure'] : ['text-success']
    return (
        <div className={chatCardBodyStyle}>
            <ResultBanner portrait={portrait} title={result.skillName} />
            <div className="p-2">
                <DiceGraphics d20={result.d20} d6={result.d6} favHinder={result.favorHinder} />
                <TotalsFooter total={result.total} difficulty={result.difficulty} csf={result.result} resultTextColor={resultTextColor} />
            </div>
        </div>
    )
}

const ResultBanner = ({ portrait, title }: { portrait: string, title: string }) => {
    return (
        <div className={`flex space-x-1 items-center bg-section-header-fill px-1 rounded-t-md`}>
            <img className={`object-contain h-[54px] w-[54px] p-0.5`} src={portrait} alt={'hero'} />
            <div className="flex w-full items-center text-text-section-header">
                <div className="text-xl mr-1">{title} Check</div>
                <Divider />
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
                                <Plus size={24} strokeWidth={4} /> :
                                <Minus size={24} strokeWidth={4} />
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