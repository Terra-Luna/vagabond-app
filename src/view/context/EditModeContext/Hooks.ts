/**
 * This is a variation of a React Context that I really like. 
 * This implements the "Provider" in a more fleshed-out way such that I think the logic is very nicely encapsulated here,
 *  versus the "consumers" having to implement the react states themselves */

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

/** Consuming children just use this and can destructure it to get any of {isEditMode, setEditMode, toggleEditMode} they want */
export const useEditMode = () => useContext(EditModeContext)

/**
 * Navigation Context Provider
 *  >>>  Use next and back functions to increment step counter.
 */
interface NavigationContextProps {
    currentStep: number
    setTotalSteps: (steps: number) => void
    registerOnFinish: (fn: () => void) => void
    backButton: ReactNode
    nextButton: ReactNode
}
const DefaultNavigationContextValue: NavigationContextProps = {
    currentStep: 0,
    setTotalSteps: () => { },
    registerOnFinish: (fn: () => void) => { },
    backButton: undefined,
    nextButton: undefined
}
export const NavigationContext = createContext(DefaultNavigationContextValue)
export const useNavigationContext = () => useContext(NavigationContext)