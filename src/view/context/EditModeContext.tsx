import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react"

/**
 * This is a variation of a React Context that I really like. 
 * This implements the "Provider" in a more fleshed-out way such that I think the logic is very nicely encapsulated here,
 *  versus the "consumers" having to implement the react states themselves */

/** Properties our context value has, and what "useEditMode" will give you */
interface EditModeContextProps {
    isEditMode: boolean;
    setEditMode: (editMode: boolean) => void;
    toggleEditMode: () => void;
    editModeToggleBtn: ReactNode;
}

/** Contexts need default values to conform to what React expects, and it's what the very first render theoretically renders out (I think) but then is immediately "hydrated" by our Provider */
const DefaultEditModeContextValue: EditModeContextProps = {
    isEditMode: false,
    setEditMode: (editMode: boolean) => { }, //noop
    toggleEditMode: () => { }, //noop
    editModeToggleBtn: undefined,
}

/** This is the react wiring to make a context, all we care about is that now there is a EditModeContext.Provider property we can render out */
const EditModeContext = createContext(DefaultEditModeContextValue)

/** Consuming parents just have to add one of these and all their children then get access to useEditMode() for free */
export const EditModeContextProvider = ({ children }) => {
    // Set up the react state
    const [isEditMode, setIsEditMode] = useState(false)
    const setEditMode = useCallback((value: boolean) => {
        setIsEditMode(value)
    }, [])
    const toggleEditMode = useCallback(() => {
        setIsEditMode(!isEditMode)
    }, [isEditMode])

    // Make a convenient lock icon!
    const editModeToggleBtn = useMemo(() => (
        <div className="mr-2" onClick={toggleEditMode}>
            {isEditMode ?
                <LockKeyholeOpen size={18} strokeWidth={2} /> :
                <LockKeyhole size={18} strokeWidth={2} />
            }
        </div>
    ), [toggleEditMode, isEditMode]);

    // tbh idk if the memo here does anything, but when I first copied this off a stack overflow 5 years ago it had one
    const contextValue = useMemo(() => ({ isEditMode, setEditMode, toggleEditMode, editModeToggleBtn }), [isEditMode, setEditMode, toggleEditMode, editModeToggleBtn])

    // render the Provider from the context we created above (outside this function), providing it our values we made with react state
    return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>
}

/** Consuming children just use this and can destructure it to get any of {isEditMode, setEditMode, toggleEditMode} they want */
export const useEditMode = () => useContext(EditModeContext)