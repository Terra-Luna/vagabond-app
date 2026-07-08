import { Plus, Minus } from "lucide-react"
import { EditableTextField } from "./EditableTextField"

export const NumericCounterInput = ({ value, valueAppend = '', onUpdateValue, incrementBy = 1 }: {
    value: number, valueAppend?: string, onUpdateValue: (input) => Promise<boolean>, incrementBy?: number
}) => {
    return (
        <div className="flex">
            <EditableTextField boundValue={`${value.toString()}${valueAppend}`} onSave={onUpdateValue} />
            <div className="flex flex-col mt-1 ml-1">
                <Plus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value + incrementBy)} />
                <Minus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value - incrementBy)} />
            </div>
        </div>
    )
}