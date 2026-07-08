import { Plus, Minus } from "lucide-react"
import { EditableTextField } from "./EditableTextField"

export const NumericCounterInput = ({ value, onUpdateValue, incrementBy = 1 }: {
    value: number, onUpdateValue: (input) => Promise<boolean>, incrementBy?: number
}) => {
    return (
        <div className="flex">
            <EditableTextField boundValue={value.toString()} onSave={onUpdateValue} />
            <div className="flex flex-col mt-1 ml-1">
                <Plus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value + incrementBy)} />
                <Minus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value - incrementBy)} />
            </div>
        </div>
    )
}