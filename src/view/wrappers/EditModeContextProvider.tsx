import { LockKeyhole, LockKeyholeOpen } from "lucide-react"
import { ReactNode, useCallback, useMemo, useState } from "react"

import { EditModeOptions } from "../context/EditModeContext/EditModeOptions"
import { EditModeContext } from "../context/EditModeContext/Hooks"

/** Consuming parents just have to add one of these and all their children then get access to useEditMode() for free */
export const EditModeContextProvider = ({
  children,
  initialEditMode = EditModeOptions.FALSE,
}: {
  children: ReactNode
  initialEditMode?: EditModeOptions
}) => {
  const [isEditMode, setIsEditMode] = useState(
    initialEditMode === EditModeOptions.TRUE,
  )
  const setEditMode = useCallback((value: boolean) => {
    setIsEditMode(value)
  }, [])
  const toggleEditMode = useCallback(() => {
    setIsEditMode(!isEditMode)
  }, [isEditMode])

  const editModeToggleBtn = useMemo(
    () =>
      initialEditMode === EditModeOptions.NEVER ? (
        <></>
      ) : (
        <>
          <div className="mr-2 cursor-pointer" onClick={toggleEditMode}>
            {isEditMode ? (
              <LockKeyholeOpen
                size={18}
                strokeWidth={2}
                className="text-text-header-secondary"
              />
            ) : (
              <LockKeyhole
                size={18}
                strokeWidth={2}
                className="text-text-header-secondary"
              />
            )}
          </div>
        </>
      ),
    [initialEditMode, toggleEditMode, isEditMode],
  )

  const contextValue = useMemo(
    () => ({ isEditMode, setEditMode, toggleEditMode, editModeToggleBtn }),
    [isEditMode, setEditMode, toggleEditMode, editModeToggleBtn],
  )

  return (
    <EditModeContext.Provider value={contextValue}>
      {children}
    </EditModeContext.Provider>
  )
}
