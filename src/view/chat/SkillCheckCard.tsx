import { CritSuccessFail, FavorHinder, SkillCheckResult } from '../../combat/dice-rolls'
import { useContextMenu } from '../component/ContextMenu'
import { Trash } from 'lucide-react'
import { tableBorderRounded } from '../common/border-styles'

const chatCardBodyStyle = `${tableBorderRounded} text-text-primary text-lg font-eskapade font-bold bg-sheet-main-fill p-2`
const clipPath = `[clip-path:polygon(0_0,100%_0,100%_50%,80%_100%,0_100%)]`

export const SkillCheckChatCard = ({ portrait, result }: { portrait: string, result: SkillCheckResult }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div
            className={chatCardBodyStyle}
            onContextMenu={(e) => onCtxMenu(e, [
                { icon: Trash, label: 'Delete', action: () => { console.log("Delete - clicked!") }, isDestructive: true }
            ])}>
            <div>
                <ResultBanner portrait={portrait} title={result.skillName} critSuccessFail={result.result} />
                <div>{FavorHinder[result.favorHinder]}</div>
                <div>d20: {result.d20}</div>
                <div>d6: {result.d6}</div>
                <div>Total: {result.total}</div>
                <div>vs. {result.difficulty}</div>
            </div>
            <ContextMenu />
        </div>
    )
}

const ResultBanner = ({ portrait, title, critSuccessFail: favorHinder }: { portrait: string, title: string, critSuccessFail: CritSuccessFail }) => {
    return (
        <div className={`flex items-center border border-solid ${clipPath}`}>
            <img className={`object-contain h-[80px] w-[80px]`} src={portrait} alt={'hero'} />
            <div>
                <div className="text-2xl">{title} Check</div>
                <div>{favorHinder}</div>
            </div>
        </div>
    )
}