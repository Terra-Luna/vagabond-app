import { Plus, Save, Trash } from "lucide-react"
import React, { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../view/component/Button"

export interface XpQuestion {
    id: string
    text: string
    xp: number
}

interface XpQuestionnaireProps {
    initialQuestions?: XpQuestion[]
    onSave?: (questions: XpQuestion[]) => void | Promise<void>
}

export const XpQuestionnaireConfigView: React.FC<XpQuestionnaireProps> = ({ initialQuestions = [], onSave, }) => {

    const [questions, setQuestions] = useState<XpQuestion[]>(initialQuestions)

    const handleInputChange = (id: string, field: keyof Omit<XpQuestion, "id">, value: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== id) return q
                return {
                    ...q,
                    [field]: field === "xp" ? parseInt(value, 10) || 0 : value,
                }
            })
        )
    }

    const addQuestion = () => {
        const newQuestion: XpQuestion = {
            id: Math.random().toString(36).substring(2, 16),
            text: "",
            xp: 1,
        }
        setQuestions((prev) => [...prev, newQuestion])
    }

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSave) {
            onSave(questions)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col grow h-full gap-2 p-2 bg-sheet-main-fill text-lg text-text-primary font-paradigm rounded-lg">
            {/* Questionnaire List Container */}
            <div className="flex flex-col gap-2">
                {questions.map((q) => (
                    <div key={q.id} className="flex items-center gap-2 p-1">
                        {/* QUESTION INPUT */}
                        <input
                            type="text"
                            value={q.text}
                            placeholder="Question description..."
                            onChange={(e) => handleInputChange(q.id, "text", e.target.value)}
                            className="flex-1 bg-context-menu-fill border border-solid border-table-border px-3 py-1.5 placeholder-text-tertiary"
                        />

                        {/* XP VALUE INPUT */}
                        <input
                            type="number"
                            value={q.xp || ""}
                            onChange={(e) => handleInputChange(q.id, "xp", e.target.value)}
                            className="text-center bg-context-menu-fill border border-solid border-table-border w-[6ch] py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-sm text-text-secondary mr-2">XP</p>

                        {/* DELETE BUTTON */}
                        <button type="button" title="Delete" onClick={() => deleteQuestion(q.id)}>
                            <Trash size={18} className="hover:text-destructive-action/80 transition-colors cursor-pointer" />
                        </button>
                    </div>
                ))}
            </div>

            {/* ADD NEW, SAVE & CLOSE BUTTONS */}
            <div className="flex items-center justify-between border-t border-context-menu-fill pt-4 mt-2">
                <SecondaryButton onClick={addQuestion} icon={<Plus size={16} />}>
                    Add Question
                </SecondaryButton>
                <PrimaryButton type="submit" icon={<Save size={16} />} onClick={() => { }}>
                    Save & Close
                </PrimaryButton>
            </div>
        </form>
    )
}