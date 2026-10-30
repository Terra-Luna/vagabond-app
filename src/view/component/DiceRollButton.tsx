import { ButtonHTMLAttributes } from "react"

import { DiceRollComponent } from "../chat/component/DiceRollComponent"

interface DiceRollButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    faces: number
    result: any
    textSize?: string
    disabled?: boolean
}

export const DiceRollButton = ({ faces, result, textSize, disabled = false, className = "", ...buttonProps }: DiceRollButtonProps) => (
    <button
        type="button"
        className={`${disabled
            ? "opacity-70"
            : "hover-glow transition-transform active:scale-95 cursor-pointer"
            }
        focus:outline-none ${className}`}
        aria-disabled={disabled}
        {...buttonProps}
    >
        <DiceRollComponent faces={faces} result={result} textSize={textSize} />
    </button>
)
