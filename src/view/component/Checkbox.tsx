import { LucideCheckSquare, LucideSquare } from "lucide-react"

import { sheetPropLabel } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"

interface CheckboxProps {
  label: string
  checked: boolean
  onCheckedChanged: (checked: boolean) => void
  inverted?: boolean
  color?: string
  disabled?: boolean
}

export const Checkbox = ({
  label,
  checked,
  onCheckedChanged,
  inverted = false,
  color = "text-text-header-tertiary",
  disabled = false,
}: CheckboxProps) => {
  const { isEditMode } = useEditMode()
  return (
    <label
      className={`flex items-center ${label.length > 0 ? "gap-1" : ""} ${sheetPropLabel} ${disabled ? "opacity-40 cursor-not-allowed" : isEditMode ? "cursor-pointer" : ""}`}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (isEditMode && !disabled) {
          onCheckedChanged(!checked)
        }
      }}
    >
      {inverted ? (
        <>
          <span className={color}>{label}</span>
          <Box checked={checked} textColor={color} />
        </>
      ) : (
        <>
          <Box checked={checked} textColor={color} />
          <span className={color}>{label}</span>
        </>
      )}
    </label>
  )
}

const Box = ({
  checked,
  textColor,
}: {
  checked: boolean
  textColor?: string
}) => {
  return (
    <span aria-hidden="true">
      {checked ? (
        <LucideCheckSquare
          className={`${textColor} fill-sheet-main-fill`}
          size={18}
        />
      ) : (
        <LucideSquare
          className={`${textColor} fill-sheet-main-fill`}
          size={18}
        />
      )}
    </span>
  )
}
