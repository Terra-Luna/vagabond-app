/**
 * This is a variation of a React Context that I (Ada) really like...
 * This implements the "Provider" in a more fleshed-out way such that I think the logic
 * is very nicely encapsulated here, versus the "consumers" having to implement the react
 * states themselves.
 * */
import { createContext, ReactNode, useContext } from "react";

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
export const EditModeContext = createContext(DefaultEditModeContextValue)

export const useEditMode = (item?: Item) => {
    const context = useContext(EditModeContext)
    const canToggleEditMode = game.user?.isGM || item?.isOwner
    return { ...context, editModeToggleBtn: canToggleEditMode ? context.editModeToggleBtn : null }
}