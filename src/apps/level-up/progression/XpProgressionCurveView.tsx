import { Plus, Save } from "lucide-react"
import React, { useState } from "react"

import { PrimaryButton,SecondaryButton } from "../../../view/component/Button"
import { TrashButton } from "../../../view/component/TrashButton"
import { XpCurve } from "../../vagabond-tools/usecase/VagabondSettingsHelper"

interface XpCurveArgs {
    initialCurve?: XpCurve[]
    onSave?: (curve: XpCurve[]) => void | Promise<void>
}

export const XpProgressionCurveView: React.FC<XpCurveArgs> = ({ initialCurve = [], onSave }) => {

    const [curve, setQuestions] = useState<XpCurve[]>(initialCurve)
    
    const handleInputChange = (id: string, field: keyof Omit<XpCurve, "id">, value: string) => {

        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== id) return q
                return {
                    ...q,
                    [field]: field === "xp" ? parseInt(value, 10) || 0 : value
                }
            })
        )
    }

    const addQuestion = () => {
        const defaultLevel = [...curve.sort((a, b) => a.level - b.level)].reverse()[0].level + 1
        const newQuestion: XpCurve = {
            id: foundry.utils.randomID(),
            level: defaultLevel,
            xp: (defaultLevel + 1) * 5
        }
        setQuestions((prev) => [...prev, newQuestion])
    }

    const deleteRow = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSave) {
            onSave(curve)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col grow h-full gap-1 p-2 bg-sheet-main-fill text-sm text-text-primary font-paradigm rounded-lg">
            {/* XP CURVE LIST CONTAINER */}
            <div className="flex flex-col gap-1">
                {curve.sort((a, b) => a.level - b.level).map((q, index) => (
                    <div key={q.id} className="flex items-center justify-center gap-1 p-1">
                        
                        {/* LEVEL INPUT */}
                        <div>
                            {index === 0 && <Label text={"Level"} />}
                            <input
                                type="number"
                                value={q.level}
                                placeholder="Level"
                                onChange={(e) => handleInputChange(q.id, "level", e.target.value)}
                                className="flex-1 bg-context-menu-fill border border-solid border-table-border w-[8ch] px-3 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        {/* XP INPUT */}
                        <div>
                            {index === 0 && <Label text={"XP to next"} />}
                            <input
                                type="number"
                                value={q.xp || ""}
                                onChange={(e) => handleInputChange(q.id, "xp", e.target.value)}
                                className="text-center bg-context-menu-fill border border-solid border-table-border w-[12ch] py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                        

                        {/* DELETE BUTTON */}
                        <div className={`${index === 0 ? 'pt-5' : ''}`}>
                            <TrashButton onDelete={() => deleteRow(q.id)} />
                        </div>
                        
                    </div>
                ))}
            </div>

            {/* ADD NEW, SAVE & CLOSE BUTTONS */}
            <div className="flex items-center justify-between border-t border-context-menu-fill pt-4 mt-2">
                <SecondaryButton onClick={addQuestion} icon={<Plus size={16} />}>
                    Add Level
                </SecondaryButton>
                <PrimaryButton type="submit" icon={<Save size={16} />}>
                    Save & Close
                </PrimaryButton>
            </div>
        </form>
    )
}

const Label = ({ text }) => {
    return <p className="text-sm text-text-secondary mr-2">{text}</p>
}