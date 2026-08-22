import { Check, Save } from "lucide-react"
import { useCallback, useMemo,useState } from "react"

import { vgLiteLang } from "../../../utils/lang"
import { DestructiveButton, PrimaryButton } from "../../../view/component/Button"
import { XpQuestion } from "../../vagabond-tools/usecase/VagabondSettingsHelper"

export const XpQuestionnairePlayerView = ({ questions, onSave }: {
    questions: XpQuestion[], onSave: (xp: number) => void
}) => {

    const [selections, setSelections] = useState<string[]>([])
    
    const xp = useMemo(() => {
        return selections.reduce((sum, qId) => { return sum + (questions.find(it => it.id === qId)?.xp ?? 0)}, 0)
    }, [questions, selections])

    const handleSelection = useCallback((question: XpQuestion) => {
        if (selections.includes(question.id)) {
            setSelections(current => current.filter(s => s !== question.id))
        }
        else {
            setSelections(current => [...current, question.id])
        }
    }, [selections, questions])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        onSave(xp)
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col grow h-full gap-2 p-2 bg-sheet-main-fill text-lg text-text-primary font-eskapade rounded-lg">
            {/* Questionnaire List Container */}
            <div className="flex flex-col gap-2">
                {questions.map((q) => (
                    <div key={q.id} onClick={() => handleSelection(q)} className={`
                        border border-solid border-table-border rounded-sm p-2 hover-glow cursor-pointer
                        ${selections.includes(q.id) ? 'bg-context-menu-fill' : ''}
                    `}>
                        <div className="flex justify-between">
                            {selections.includes(q.id) && <Check size={24} />}
                            <div>{q.text}</div>
                            <div>{q.xp} XP</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between">
                <DestructiveButton onClick={() => onSave(0)}>
                    {vgLiteLang.ButtonActions.cancel}
                </DestructiveButton>
                <PrimaryButton type="submit" icon={<Save size={16} />}>
                    {vgLiteLang.ButtonActions.save}
                </PrimaryButton>
            </div>
        </form>
    )
}