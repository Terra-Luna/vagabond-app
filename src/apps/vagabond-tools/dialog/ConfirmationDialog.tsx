import { useState } from "react"

import { appLang } from "../../../util/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../../view/component/Button"
import { Option, Select } from "../../../view/component/Dropdown"
import { SingleSelect } from "../../../view/component/SingleSelect"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "../../../view/wrappers/EditModeContextProvider"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (input?: string) => Promise<void> | void
  /** When true, shows a text field; its value is passed to onConfirm. */
  showInput?: boolean
  inputPlaceholder?: string
  inputDefaultValue?: string
  selectOptions?: { label: string; value: string }[]
  selectAsButtons?: boolean
  selectDefaultValue?: string
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "primary" | "info"
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = appLang.General.areYouSure,
  description = appLang.General.actionCannotBeUndone,
  confirmText = appLang.General.confirm,
  cancelText = appLang.ButtonActions.cancel,
  variant = "destructive",
  showInput = false,
  inputPlaceholder,
  inputDefaultValue = "",
  selectOptions,
  selectAsButtons = false,
  selectDefaultValue,
}: ConfirmModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(inputDefaultValue)
  const [selectedValue, setSelectedValue] = useState(
    selectDefaultValue ?? selectOptions?.[0]?.value ?? "",
  )

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm(
        selectOptions ? selectedValue : showInput ? inputValue : undefined,
      )
      onClose()
    }
    catch (error) {
      console.error("Action failed:", error)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/33 backdrop-blur-sm">
      {/* BLURRED BACKDROP */}
      <div
        className="absolute inset-0"
        onClick={isLoading ? undefined : onClose}
      />

      {/* DIALOG BOX */}
      <div
        className={`
                relative w-full max-w-md transform overflow-hidden
                rounded-xl bg-sheet-main-fill p-6 text-left align-middle shadow-xl
                transition-all ${tableBorderRounded}
            `}
      >
        <p className="text-text-primary text-lg font-eskapade font-bold">
          {title}
        </p>
        <p className="mt-2 text-base text-text-primary font-paradigm font-normal whitespace-pre-line">
          {description}
        </p>

        {showInput && (
          <input
            type="text"
            autoFocus
            className={`mt-4 w-full px-2 py-1 text-text-primary font-paradigm ${tableBorderRounded} bg-transparent`}
            value={inputValue}
            placeholder={inputPlaceholder}
            disabled={isLoading}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") handleConfirm()
              else if (e.key === "Escape") onClose()
            }}
          />
        )}

        {selectOptions && selectAsButtons && (
          <div className="mt-4 flex justify-center">
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
              <SingleSelect
                options={selectOptions}
                value={selectedValue}
                setValue={setSelectedValue}
              />
            </EditModeContextProvider>
          </div>
        )}

        {selectOptions && !selectAsButtons && (
          <Select
            className={`mt-4 w-full px-2 py-1 text-base ${tableBorderRounded}`}
            value={selectedValue}
            disabled={isLoading}
            onChange={(e) => setSelectedValue(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {selectOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {/* BUTTONS */}
        <div className="mt-6 flex justify-end gap-3 text-text-primary">
          {variant !== "info" && (
            <SecondaryButton onClick={onClose}>{cancelText}</SecondaryButton>
          )}

          {variant === "destructive" ? (
            <DestructiveButton onClick={handleConfirm}>
              {isLoading ? appLang.General.processing : confirmText}
            </DestructiveButton>
          ) : (
            <PrimaryButton onClick={handleConfirm}>
              {isLoading ? appLang.General.processing : confirmText}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  )
}
