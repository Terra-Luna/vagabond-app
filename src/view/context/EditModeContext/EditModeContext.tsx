import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react"

import { EditModeOptions } from "./EditModeOptions";
import { EditModeContext } from "./Hooks";

/** Consuming parents just have to add one of these and all their children then get access to useEditMode() for free */
export const EditModeContextProvider = ({ children, initialEditMode = EditModeOptions.FALSE }: {
    children: ReactNode, initialEditMode?: EditModeOptions
}) => {
    // Set up the react state
    const [isEditMode, setIsEditMode] = useState(initialEditMode === EditModeOptions.TRUE)
    const setEditMode = useCallback((value: boolean) => {
        setIsEditMode(value)
    }, [])
    const toggleEditMode = useCallback(() => {
        setIsEditMode(!isEditMode)
    }, [isEditMode])

    // Make a convenient lock icon!
    const editModeToggleBtn = useMemo(() => (
        initialEditMode === EditModeOptions.NEVER ? <></> : <>
            {game.user?.isGM &&
                <div className="mr-2 cursor-pointer" onClick={toggleEditMode}>
                    {isEditMode ?
                        <LockKeyholeOpen size={18} strokeWidth={2} className="text-text-header-secondary" /> :
                        <LockKeyhole size={18} strokeWidth={2} className="text-text-header-secondary" />
                    }
                </div>
            }</>
    ), [toggleEditMode, isEditMode])

    // tbh idk if the memo here does anything, but when I first copied this off a stack overflow 5 years ago it had one
    const contextValue = useMemo(() => ({ isEditMode, setEditMode, toggleEditMode, editModeToggleBtn }), [isEditMode, setEditMode, toggleEditMode, editModeToggleBtn])

    // render the Provider from the context we created above (outside this function), providing it our values we made with react state
    return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>
}